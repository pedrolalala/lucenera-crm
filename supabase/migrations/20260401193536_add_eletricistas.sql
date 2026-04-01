CREATE TABLE IF NOT EXISTS public.eletricistas_crm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    cidade TEXT,
    estado TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public."Organizacao_projetos" ADD COLUMN IF NOT EXISTS eletricista TEXT;
ALTER TABLE IF EXISTS public.organizacao_projetos ADD COLUMN IF NOT EXISTS eletricista TEXT;

ALTER TABLE public.eletricistas_crm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_eletricistas" ON public.eletricistas_crm;
CREATE POLICY "authenticated_select_eletricistas" ON public.eletricistas_crm FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_eletricistas" ON public.eletricistas_crm;
CREATE POLICY "authenticated_insert_eletricistas" ON public.eletricistas_crm FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_eletricistas" ON public.eletricistas_crm;
CREATE POLICY "authenticated_update_eletricistas" ON public.eletricistas_crm FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_eletricistas" ON public.eletricistas_crm;
CREATE POLICY "authenticated_delete_eletricistas" ON public.eletricistas_crm FOR DELETE TO authenticated USING (true);
