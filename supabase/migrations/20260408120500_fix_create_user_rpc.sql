-- Drop the existing function to avoid signature mismatch issues
DROP FUNCTION IF EXISTS public.create_user(text, text, text, text);

-- Recreate the function pointing to usuarios_crm instead of profiles
CREATE OR REPLACE FUNCTION public.create_user(
  p_email text,
  p_name text,
  p_password text,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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

  -- Insert into usuarios_crm automatically
  INSERT INTO public.usuarios_crm (id, email, nome, role)
  VALUES (new_user_id, p_email, p_name, p_role);

  RETURN new_user_id;
END;
$function$;

-- Ensure 'filippo@lucenera.com.br' has Admin privileges if it exists, to prevent getting locked out
UPDATE public.usuarios_crm
SET role = 'Admin'
WHERE email = 'filippo@lucenera.com.br';
