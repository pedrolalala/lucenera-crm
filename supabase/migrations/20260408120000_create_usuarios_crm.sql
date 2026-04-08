CREATE TABLE IF NOT EXISTS public.usuarios_crm (
    id UUID PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'User',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios_crm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_usuarios_crm" ON public.usuarios_crm;
CREATE POLICY "authenticated_select_usuarios_crm" ON public.usuarios_crm
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_usuarios_crm" ON public.usuarios_crm;
CREATE POLICY "authenticated_insert_usuarios_crm" ON public.usuarios_crm
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_usuarios_crm" ON public.usuarios_crm;
CREATE POLICY "authenticated_update_usuarios_crm" ON public.usuarios_crm
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_usuarios_crm" ON public.usuarios_crm;
CREATE POLICY "authenticated_delete_usuarios_crm" ON public.usuarios_crm
    FOR DELETE TO authenticated USING (true);

-- Backfill existing users from profiles if the profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.usuarios_crm (id, nome, email, role)
    SELECT id, name, email, role
    FROM public.profiles
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
