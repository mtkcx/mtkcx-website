-- Create a function to check if current user is admin (avoiding RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Create a function for ultra secure admin checking
CREATE OR REPLACE FUNCTION public.ultra_secure_admin_check()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Add user role management functionality for admins
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Insert admin role for target user (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_admin_to_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Don't allow self-demotion to prevent lockout
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  -- Remove admin role
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = 'admin';
  
  RETURN TRUE;
END;
$$;

-- Create trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert user role for new user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to use the security definer functions
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
CREATE POLICY "Only admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Ensure there's at least one admin (replace with your actual user ID)
-- You should run this separately with your actual user ID:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'admin') 
-- ON CONFLICT (user_id, role) DO NOTHING;