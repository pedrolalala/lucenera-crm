-- Idempotent seed for pedro@lucenera.com.br with password Caquidrose17
-- Ensures auth.users entry, public.usuarios sync, and RLS policies
DO $$
DECLARE
  v_user_id uuid;
  v_role text;
BEGIN
  -- Ensure user exists with correct password (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pedro@lucenera.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'pedro@lucenera.com.br',
      crypt('Caquidrose17', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Pedro"}'::jsonb,
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'pedro@lucenera.com.br';
    UPDATE auth.users
    SET encrypted_password = crypt('Caquidrose17', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE email = 'pedro@lucenera.com.br';
  END IF;

  -- Sync to public.usuarios table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuarios') THEN
    SELECT enumlabel INTO v_role
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'usuario_role'
      AND e.enumlabel ILIKE 'admin'
    LIMIT 1;

    IF v_role IS NULL THEN
      v_role := 'admin';
    END IF;

    BEGIN
      EXECUTE format(
        'INSERT INTO public.usuarios (id, email, nome, role, ativo, onboarding_completado)
         VALUES ($1, $2, $3, $4::usuario_role, true, false)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           nome = EXCLUDED.nome,
           role = EXCLUDED.role,
           ativo = true,
           updated_at = NOW()',
        v_user_id, 'pedro@lucenera.com.br', 'Pedro', v_role
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not insert into public.usuarios with role: %', SQLERRM;
    END;

    -- Ensure RLS policies exist for usuarios table
    ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "authenticated_select_usuarios" ON public.usuarios;
    CREATE POLICY "authenticated_select_usuarios" ON public.usuarios
      FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "authenticated_insert_usuarios" ON public.usuarios;
    CREATE POLICY "authenticated_insert_usuarios" ON public.usuarios
      FOR INSERT TO authenticated WITH CHECK (true);

    DROP POLICY IF EXISTS "authenticated_update_usuarios" ON public.usuarios;
    CREATE POLICY "authenticated_update_usuarios" ON public.usuarios
      FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "authenticated_delete_usuarios" ON public.usuarios;
    CREATE POLICY "authenticated_delete_usuarios" ON public.usuarios
      FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
