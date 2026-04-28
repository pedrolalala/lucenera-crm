-- Fix type casts in triggers that compare enum values to text

CREATE OR REPLACE FUNCTION public.trigger_proteger_fechamento()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  itens_nao_validados INTEGER;
  status_fechamento public.projeto_status[] := ARRAY[
    'Projeto executivo'::public.projeto_status,
    'Entrega materiais'::public.projeto_status,
    'Ajustes finais'::public.projeto_status,
    'Finalizado'::public.projeto_status
  ];
BEGIN
  -- Só verifica quando está indo para um status de execução/fechamento
  IF NEW.status = ANY(status_fechamento)
     AND (OLD.status IS NULL OR OLD.status <> NEW.status) THEN

    SELECT COUNT(*) INTO itens_nao_validados
    FROM projeto_itens
    WHERE projeto_id = NEW.id
      AND validado = false;

    IF itens_nao_validados > 0 THEN
      RAISE EXCEPTION
        'Não é possível avançar o projeto para "%". Existem % item(ns) não validado(s). Valide todos os itens antes de fechar.',
        NEW.status, itens_nao_validados;
    END IF;

    -- Também verifica se existe pelo menos 1 item no projeto
    IF NOT EXISTS (SELECT 1 FROM projeto_itens WHERE projeto_id = NEW.id) THEN
      RAISE EXCEPTION
        'Não é possível fechar o projeto sem nenhum item cadastrado.';
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_fechar_projeto()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sinal RECORD;
BEGIN
  IF NEW.status = 'Entrega materiais'::public.projeto_status AND OLD.status <> 'Entrega materiais'::public.projeto_status THEN

    -- 3a. Baixar estoque físico (local='Estoque') por produto
    UPDATE estoque_itens ei
    SET quantidade    = GREATEST(0, ei.quantidade - pi.quantidade),
        atualizado_em = NOW()
    FROM projeto_itens pi
    WHERE pi.projeto_id = NEW.id
      AND pi.produto_id = ei.produto_id
      AND ei.local = 'Estoque'::public.estoque_local;

    -- 3b. Zerar a reserva desse projeto
    UPDATE estoque_itens ei
    SET quantidade    = GREATEST(0, ei.quantidade - pi.quantidade),
        atualizado_em = NOW()
    FROM projeto_itens pi
    WHERE pi.projeto_id = NEW.id
      AND pi.produto_id = ei.produto_id
      AND ei.local = 'Reservado'::public.estoque_local;

    -- 3c. Marcar sinal como 'creditado' (cliente comprou)
    UPDATE projeto_sinal
    SET status     = 'creditado'::public.sinal_status,
        updated_at = NOW()
    WHERE projeto_id = NEW.id
      AND status = 'recebido'::public.sinal_status;

    -- 3d. Criar separação automaticamente com os itens validados
    --     (só cria se ainda não existe separação para esse projeto)
    IF NOT EXISTS (
      SELECT 1 FROM separacoes
      WHERE projeto_id = NEW.id
        AND status NOT IN ('Cancelado'::public.separacao_status)
    ) THEN
      WITH nova_sep AS (
        INSERT INTO separacoes (
          projeto_id, responsavel_id, status,
          codigo_obra, cliente, observacoes
        )
        SELECT
          NEW.id,
          NEW.created_by,
          'Pendente'::public.separacao_status,
          NEW.codigo,
          (SELECT nome FROM contatos WHERE id = NEW.cliente_id),
          'Separação gerada automaticamente no fechamento do projeto'
        RETURNING id
      )
      INSERT INTO separacao_itens (separacao_id, produto_id, descricao, quantidade, unidade)
      SELECT
        nova_sep.id,
        pi.produto_id,
        pi.descricao,
        pi.quantidade,
        NULL
      FROM projeto_itens pi, nova_sep
      WHERE pi.projeto_id = NEW.id
        AND pi.validado = true;

    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_proteger_parcelas()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status public.projeto_status;
BEGIN
  SELECT status INTO v_status FROM projetos WHERE id = NEW.projeto_id;

  IF v_status NOT IN ('Ajustes finais'::public.projeto_status, 'Finalizado'::public.projeto_status) THEN
    RAISE EXCEPTION
      'Parcelas só podem ser criadas após o projeto estar em "Ajustes finais" ou "Finalizado". Status atual: %',
      v_status;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_reserva_estoque()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Só age quando status MUDA para 'Proposta Sinal'
  IF NEW.status = 'Proposta Sinal'::public.projeto_status AND OLD.status <> 'Proposta Sinal'::public.projeto_status THEN

    -- Inserir ou somar na reserva de estoque para cada item do projeto
    INSERT INTO estoque_itens (produto_id, local, quantidade, atualizado_por, atualizado_em)
    SELECT
      pi.produto_id,
      'Reservado'::public.estoque_local,
      pi.quantidade,
      NEW.created_by,
      NOW()
    FROM projeto_itens pi
    WHERE pi.projeto_id = NEW.id
      AND pi.produto_id IS NOT NULL
    ON CONFLICT (produto_id, local)
    DO UPDATE SET
      quantidade    = estoque_itens.quantidade + EXCLUDED.quantidade,
      atualizado_em = NOW();

  END IF;

  -- Ao SAIR de 'Proposta Sinal' para trás (ex: cancelamento),
  -- liberar a reserva
  IF OLD.status = 'Proposta Sinal'::public.projeto_status
     AND NEW.status NOT IN ('Proposta Sinal'::public.projeto_status,'Elaboração Orçamento'::public.projeto_status,
                             'Informações necessárias'::public.projeto_status,'Projeto executivo'::public.projeto_status,
                             'Entrega materiais'::public.projeto_status,'Ajustes finais'::public.projeto_status,'Finalizado'::public.projeto_status) THEN

    UPDATE estoque_itens ei
    SET quantidade = GREATEST(0, ei.quantidade - pi.quantidade),
        atualizado_em = NOW()
    FROM projeto_itens pi
    WHERE pi.projeto_id = NEW.id
      AND pi.produto_id = ei.produto_id
      AND ei.local = 'Reservado'::public.estoque_local;

  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_separacao_pronta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'Pronto'::public.separacao_status AND OLD.status <> 'Pronto'::public.separacao_status THEN

    -- Proteção: data_entrega obrigatória para gerar entrega
    IF NEW.data_entrega IS NULL THEN
      RAISE EXCEPTION
        'Defina a data de entrega antes de marcar a separação como Pronto.';
    END IF;

    -- Criar entrega se ainda não existir para essa separação
    IF NOT EXISTS (
      SELECT 1 FROM entregas
      WHERE separacao_id = NEW.id
        AND status <> 'Cancelado'::public.entrega_status
    ) THEN
      INSERT INTO entregas (
        separacao_id,
        projeto_id,
        entregador_id,
        endereco_entrega,
        contato_destino,
        data_prevista,
        status
      ) VALUES (
        NEW.id,
        NEW.projeto_id,
        NEW.responsavel_id,
        NEW.endereco_entrega,
        NEW.cliente,
        NEW.data_entrega,
        'Pendente'::public.entrega_status
      );
    ELSE
      -- Se entrega já existe, só atualiza a data_prevista
      UPDATE entregas
      SET data_prevista = NEW.data_entrega,
          updated_at    = NOW()
      WHERE separacao_id = NEW.id
        AND status = 'Pendente'::public.entrega_status;
    END IF;

  END IF;

  -- Quando data_entrega muda em separação já Pronta,
  -- propagar para entrega pendente correspondente
  IF NEW.status = 'Pronto'::public.separacao_status
     AND OLD.data_entrega IS DISTINCT FROM NEW.data_entrega
     AND NEW.data_entrega IS NOT NULL THEN

    UPDATE entregas
    SET data_prevista = NEW.data_entrega,
        updated_at    = NOW()
    WHERE separacao_id = NEW.id
      AND status = 'Pendente'::public.entrega_status;

  END IF;

  RETURN NEW;
END;
$function$;
