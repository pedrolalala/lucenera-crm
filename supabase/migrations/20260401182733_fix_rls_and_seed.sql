DO $$ 
BEGIN
  -- Fix RLS for Organizacao_projetos
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

  -- Fix RLS for clientes_crm
  DROP POLICY IF EXISTS "authenticated_select_clientes" ON public."clientes_crm";
  CREATE POLICY "authenticated_select_clientes" ON public."clientes_crm"
    FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_clientes" ON public."clientes_crm";
  CREATE POLICY "authenticated_insert_clientes" ON public."clientes_crm"
    FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_update_clientes" ON public."clientes_crm";
  CREATE POLICY "authenticated_update_clientes" ON public."clientes_crm"
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "authenticated_delete_clientes" ON public."clientes_crm";
  CREATE POLICY "authenticated_delete_clientes" ON public."clientes_crm"
    FOR DELETE TO authenticated USING (true);
END $$;

DO $$ 
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'filippo@lucenera.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'filippo@lucenera.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Filippo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
