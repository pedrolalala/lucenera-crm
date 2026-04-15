-- This migration assumes the tables already exist but ensures safety and non-destructive updates

DO $$
BEGIN
  -- 1. Ensure `contatos` table has the right constraints and types
  CREATE TABLE IF NOT EXISTS public.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL DEFAULT 'outro',
    nome TEXT NOT NULL,
    nome_empresa TEXT,
    cpf_cnpj VARCHAR,
    rg VARCHAR,
    email VARCHAR,
    email_financeiro VARCHAR,
    telefone VARCHAR,
    celular VARCHAR,
    endereco TEXT,
    bairro VARCHAR,
    cep VARCHAR,
    cidade VARCHAR,
    estado VARCHAR,
    data_nascimento DATE,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    endereco_comercial TEXT,
    bairro_comercial VARCHAR,
    cep_comercial VARCHAR,
    cidade_comercial VARCHAR,
    estado_comercial VARCHAR,
    especialidade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Add columns if they were missing
  ALTER TABLE public.contatos ADD COLUMN IF NOT EXISTS celular VARCHAR;
  ALTER TABLE public.contatos ADD COLUMN IF NOT EXISTS email_financeiro VARCHAR;

  -- 2. Ensure `projetos` table references `contatos` properly
  -- Assuming the table `projetos` is the new primary projects table
  CREATE TABLE IF NOT EXISTS public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    nivel_estrategico VARCHAR,
    status VARCHAR DEFAULT 'Estudo Inicial',
    cidade VARCHAR,
    estado VARCHAR,
    caminho TEXT,
    data_entrada DATE,
    arquivado BOOLEAN DEFAULT false,
    cliente_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL,
    arquiteto_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL,
    responsavel_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL,
    responsavel_obra_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL,
    valor_total NUMERIC DEFAULT 0,
    responsavel_nome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL;
  ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS arquiteto_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL;
  ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL;
  ALTER TABLE public.projetos ADD COLUMN IF NOT EXISTS responsavel_obra_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL;

  -- 3. Ensure `projeto_parcelas` table exists
  CREATE TABLE IF NOT EXISTS public.projeto_parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    valor NUMERIC NOT NULL,
    data_fechamento DATE,
    status VARCHAR NOT NULL DEFAULT 'pendente',
    data_vencimento DATE,
    data_pagamento DATE,
    valor_pago NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.projeto_parcelas ADD COLUMN IF NOT EXISTS status VARCHAR NOT NULL DEFAULT 'pendente';
  ALTER TABLE public.projeto_parcelas ADD COLUMN IF NOT EXISTS data_vencimento DATE;
  ALTER TABLE public.projeto_parcelas ADD COLUMN IF NOT EXISTS data_pagamento DATE;
  ALTER TABLE public.projeto_parcelas ADD COLUMN IF NOT EXISTS valor_pago NUMERIC;

  -- Add RLS Policies
  DROP POLICY IF EXISTS "authenticated_all_contatos" ON public.contatos;
  CREATE POLICY "authenticated_all_contatos" ON public.contatos FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_projetos" ON public.projetos;
  CREATE POLICY "authenticated_all_projetos" ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_all_projeto_parcelas" ON public.projeto_parcelas;
  CREATE POLICY "authenticated_all_projeto_parcelas" ON public.projeto_parcelas FOR ALL TO authenticated USING (true) WITH CHECK (true);

END $$;
