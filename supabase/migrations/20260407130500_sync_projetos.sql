-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."Organizacao_projetos" (
  "Codigo" double precision null,
  "Nivel_Estrategico" text null,
  "Projeto" text null,
  "Responsavel" text null,
  "Data_Entrada" text null,
  "Status" text null,
  "Arquiteto_Responsavel" text null,
  "Responsavel_da_Obra" text null,
  "Cidade" text null,
  "Estado" text null,
  "Arquivado" text null,
  "Tipo_de_Item" text null,
  "Caminho" text null
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public."Organizacao_projetos" ENABLE ROW LEVEL SECURITY;

-- Fix RLS policies
DROP POLICY IF EXISTS "authenticated_select_projetos" ON public."Organizacao_projetos";
CREATE POLICY "authenticated_select_projetos" ON public."Organizacao_projetos"
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_projetos" ON public."Organizacao_projetos";
CREATE POLICY "authenticated_insert_projetos" ON public."Organizacao_projetos"
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_projetos" ON public."Organizacao_projetos";
CREATE POLICY "authenticated_update_projetos" ON public."Organizacao_projetos"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_projetos" ON public."Organizacao_projetos";
CREATE POLICY "authenticated_delete_projetos" ON public."Organizacao_projetos"
  FOR DELETE TO authenticated USING (true);

-- Seed missing data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public."Organizacao_projetos" WHERE "Codigo" = 26.082) THEN
    INSERT INTO public."Organizacao_projetos" 
    ("Codigo", "Nivel_Estrategico", "Projeto", "Responsavel", "Data_Entrada", "Status", "Arquiteto_Responsavel", "Responsavel_da_Obra", "Cidade", "Estado") 
    VALUES 
    (26.082, '3', 'GRAÇA E MOACIR QUIRINO', 'Thairine', '2026-03-24T10:00:00Z', 'Estudo Inicial', 'FLÁVIA CAMARGO', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.081, '2', 'APTO KT', 'Thais', '2026-03-21T10:00:00Z', 'Proposta Sinal', 'MORIZE CARVALHO', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.080, '4', 'GUILHERME', 'Thairine', '2026-03-19T10:00:00Z', 'Elaboração Orçamento', 'Não Informado', 'Não Informado', 'TAQUARITINGA', 'SP'),
    (26.079, '3', 'PAISAGISMO DANIELA BULLE', 'Thais', '2026-03-19T10:00:00Z', 'Elaboração Orçamento', 'Não Informado', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.078, '1', 'CLÍNICA VET ODONTO', 'Marina', '2026-03-15T10:00:00Z', 'Projeto executivo', 'JOÃO SILVA', 'CARLOS ALBERTO', 'SÃO PAULO', 'SP'),
    (26.077, '2', 'CASA LAGO SUL', 'Thairine', '2026-03-10T10:00:00Z', 'Informações necessárias', 'FLÁVIA CAMARGO', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.076, '3', 'ESCRITÓRIO CORPORATIVO', 'Thais', '2026-03-05T10:00:00Z', 'Entrega materiais', 'MORIZE CARVALHO', 'MARCOS VINICIUS', 'ARARAQUARA', 'SP'),
    (26.075, '4', 'REFORMA FACHADA', 'Marina', '2026-03-01T10:00:00Z', 'Finalizado', 'Não Informado', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.074, '2', 'RESIDÊNCIA FAMÍLIA COSTA', 'Thairine', '2026-02-28T10:00:00Z', 'Ajustes finais', 'ANA PAULA', 'ROBERTO JUSTUS', 'SÃO PAULO', 'SP'),
    (26.073, '1', 'GALPÃO LOGÍSTICO', 'Thais', '2026-02-20T10:00:00Z', 'Projeto executivo', 'Não Informado', 'FERNANDO HENRIQUE', 'CRAVINHOS', 'SP'),
    (26.072, '3', 'APARTAMENTO DUPLEX', 'Marina', '2026-02-15T10:00:00Z', 'Estudo Inicial', 'FLÁVIA CAMARGO', 'Não Informado', 'RIBEIRÃO PRETO', 'SP'),
    (26.071, '2', 'RESTAURANTE VILA', 'Thairine', '2026-02-10T10:00:00Z', 'Proposta Sinal', 'MARIA CLARA', 'Não Informado', 'ARARAQUARA', 'SP');
  END IF;
END $$;
