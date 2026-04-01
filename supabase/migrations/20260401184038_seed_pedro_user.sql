DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed requested user Pedro idempotently
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pedro@lucenera.com.br') THEN
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
      'pedro@lucenera.com.br',
      crypt('Caquidrose', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Pedro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    -- If public.profiles exists, insert the user there as well based on how create_user functions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
      EXECUTE format('INSERT INTO public.profiles (id, email, name, role) VALUES (%L, %L, %L, %L) ON CONFLICT (id) DO NOTHING', new_user_id, 'pedro@lucenera.com.br', 'Pedro', 'User');
    END IF;
  END IF;
END $$;
