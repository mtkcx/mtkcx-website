-- Function to make a user admin by email
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- If user not found, return false
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert admin role if not already exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Make the specific user "wrapsmt" an admin
-- You'll need to replace this with the actual email address
SELECT public.make_user_admin('wrapsmt@example.com');