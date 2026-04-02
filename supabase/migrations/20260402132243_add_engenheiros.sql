CREATE TABLE IF NOT EXISTS public.engenheiro_crm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT,
    email TEXT,
    telefone TEXT,
    empresa TEXT,
    endereco_comercial TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.engenheiro_crm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_engenheiros" ON public.engenheiro_crm;
CREATE POLICY "authenticated_select_engenheiros" ON public.engenheiro_crm FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_engenheiros" ON public.engenheiro_crm;
CREATE POLICY "authenticated_insert_engenheiros" ON public.engenheiro_crm FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_engenheiros" ON public.engenheiro_crm;
CREATE POLICY "authenticated_update_engenheiros" ON public.engenheiro_crm FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_engenheiros" ON public.engenheiro_crm;
CREATE POLICY "authenticated_delete_engenheiros" ON public.engenheiro_crm FOR DELETE TO authenticated USING (true);
