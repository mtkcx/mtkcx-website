-- Ensure proper admin role checking function with enhanced security
CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Create a function to safely check if current user can manage other users
CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_admin_secure();
$$;

-- Update the promote user function to use enhanced security
CREATE OR REPLACE FUNCTION public.promote_user_to_admin_secure(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin using secure function
  IF NOT public.is_admin_secure() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can promote users';
  END IF;
  
  -- Prevent promoting non-existent users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Insert admin role for target user (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the promotion for audit purposes
  PERFORM public.log_sensitive_data_access('user_promotion', 'promote_to_admin', target_user_id::text);
  
  RETURN TRUE;
END;
$$;

-- Update the demote user function with enhanced security
CREATE OR REPLACE FUNCTION public.demote_admin_to_user_secure(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin using secure function
  IF NOT public.is_admin_secure() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can demote users';
  END IF;
  
  -- Don't allow self-demotion to prevent admin lockout
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Remove admin role
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = 'admin';
  
  -- Log the demotion for audit purposes
  PERFORM public.log_sensitive_data_access('user_demotion', 'demote_from_admin', target_user_id::text);
  
  RETURN TRUE;
END;
$$;

-- Create a function to list all admin users (for admin management)
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamp with time zone,
  full_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ur.user_id,
    au.email,
    ur.created_at,
    p.full_name
  FROM public.user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  LEFT JOIN public.profiles p ON ur.user_id = p.user_id
  WHERE ur.role = 'admin'
    AND public.is_admin_secure() -- Only admins can see this list
  ORDER BY ur.created_at DESC;
$$;