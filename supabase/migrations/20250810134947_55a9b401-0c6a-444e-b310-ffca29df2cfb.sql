-- ABSOLUTE SECURITY LOCKDOWN - Remove ALL edge function policies and make everything admin-only

-- Remove ALL edge function insertion policies completely
DROP POLICY IF EXISTS "Secure enrollment creation via validated edge function" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Secure newsletter subscription via validated edge function" ON public.newsletter_subscriptions;

-- Remove ANY remaining policies that might allow public access
DROP POLICY IF EXISTS "SECURE: Admin-only access to enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "SECURE: Admin-only access to newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "SECURE: User-owned and admin-only order access" ON public.orders;
DROP POLICY IF EXISTS "SECURE: Admin-only order management" ON public.orders;
DROP POLICY IF EXISTS "SECURE: Authenticated user-owned and admin-only chat access" ON public.chat_conversations;
DROP POLICY IF EXISTS "SECURE: Authenticated conversation participant and admin-only access" ON public.chat_messages;

-- Create ABSOLUTE LOCKDOWN policies - ADMIN ONLY ACCESS
CREATE POLICY "ABSOLUTE_SECURE: Admin only enrollment access"
ON public.enrollment_requests
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "ABSOLUTE_SECURE: Admin only newsletter access"  
ON public.newsletter_subscriptions
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "ABSOLUTE_SECURE: Admin only order access"
ON public.orders
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "ABSOLUTE_SECURE: Admin only chat conversation access"
ON public.chat_conversations
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "ABSOLUTE_SECURE: Admin only chat message access"
ON public.chat_messages
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Also lock down order_items to admin only
DROP POLICY IF EXISTS "SECURE: User-owned order items and admin-only access" ON public.order_items;
CREATE POLICY "ABSOLUTE_SECURE: Admin only order items access"
ON public.order_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Lock down profiles to admin only as well for maximum security
DROP POLICY IF EXISTS "SECURE: User-owned and admin-only profile access" ON public.profiles;
CREATE POLICY "ABSOLUTE_SECURE: Admin only profile access"
ON public.profiles
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add admin verification function for extra security
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.user_roles WHERE user_id = auth.uid()),
    false
  );
$$;

-- Alternative admin check function that's even more restrictive
CREATE OR REPLACE FUNCTION public.ultra_secure_admin_check()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- Multiple validation layers
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  -- Log admin access
  PERFORM log_sensitive_data_access('admin_verification', 'admin_access_granted');
  
  RETURN true;
END;
$$;