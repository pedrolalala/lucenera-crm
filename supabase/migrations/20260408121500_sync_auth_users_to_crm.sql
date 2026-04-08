-- Backfill existing users from auth.users to usuarios_crm
DO $$
BEGIN
  INSERT INTO public.usuarios_crm (id, email, nome, role)
  SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 
    'Admin' -- Existing users are made Admin by default so they can manage the system
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create trigger for new auth users to sync to usuarios_crm automatically
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios_crm (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'User'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Update the existing create_user function to handle the conflict gracefully
CREATE OR REPLACE FUNCTION public.create_user(p_email text, p_name text, p_password text, p_role text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  is_admin boolean;
BEGIN
  -- Verify caller is an Admin using usuarios_crm
  SELECT role = 'Admin' INTO is_admin FROM public.usuarios_crm WHERE id = auth.uid();

  -- Fallback if the user is not admin and the table is not empty (for bootstrap)
  IF NOT is_admin AND EXISTS (SELECT 1 FROM public.usuarios_crm) THEN
    RAISE EXCEPTION 'Apenas administradores podem criar novos usuários.';
  END IF;

  -- Check for existing email in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Um usuário com este e-mail já existe na base de autenticação.';
  END IF;

  new_user_id := gen_random_uuid();

  -- Bypass Supabase API to insert user directly (allows smaller passwords and avoids Edge Functions)
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current, phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', p_email,
    crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('name', p_name),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', NULL, '', '', ''
  );

  -- Insert into usuarios_crm automatically (using ON CONFLICT to avoid errors with the trigger)
  INSERT INTO public.usuarios_crm (id, email, nome, role)
  VALUES (new_user_id, p_email, p_name, p_role)
  ON CONFLICT (id) DO UPDATE 
  SET nome = EXCLUDED.nome, role = EXCLUDED.role;

  RETURN new_user_id;
END;
$;
