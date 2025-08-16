-- Comprehensive security fix for all sensitive customer data tables
-- This addresses multiple security vulnerabilities found by the scanner

-- 1. Strengthen mobile_orders table policies
DROP POLICY IF EXISTS "Service role can insert mobile orders" ON public.mobile_orders;
DROP POLICY IF EXISTS "Only admins can view mobile orders" ON public.mobile_orders;
DROP POLICY IF EXISTS "Only admins can manage mobile orders" ON public.mobile_orders;

-- Create strict admin-only policies for mobile_orders
CREATE POLICY "STRICT: Admin only mobile orders access"
ON public.mobile_orders
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

-- Create secure service insertion policy
CREATE POLICY "SECURE: Service role mobile order creation"
ON public.mobile_orders
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.mobile_order_context', true) = 'secure_mobile_order_creation' AND
  current_setting('app.security_validated', true) = 'true'
);

-- 2. Fix contact_messages table - ensure complete lockdown
DROP POLICY IF EXISTS "SERVICE: Edge function contact message insertion" ON public.contact_messages;
DROP POLICY IF EXISTS "LOCKDOWN: Admin only contact message access" ON public.contact_messages;

CREATE POLICY "LOCKDOWN: Admin only contact access"
ON public.contact_messages
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "SECURE: Service contact creation"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.contact_context', true) = 'secure_contact_creation' AND
  current_setting('app.security_validated', true) = 'true'
);

-- 3. Ensure chat_conversations and chat_messages are locked down
-- (Already have ultra_secure_admin_check policies, but verify they're working)

-- 4. Lock down newsletter_subscriptions completely
DROP POLICY IF EXISTS "SERVICE: Edge function newsletter insertion" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "LOCKDOWN: Admin only newsletter access" ON public.newsletter_subscriptions;

CREATE POLICY "LOCKDOWN: Admin only newsletter access"
ON public.newsletter_subscriptions
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "SECURE: Service newsletter creation"
ON public.newsletter_subscriptions
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  current_setting('app.security_validated', true) = 'true'
);

-- 5. Lock down enrollment_requests completely
DROP POLICY IF EXISTS "SERVICE: Edge function enrollment insertion" ON public.enrollment_requests;
DROP POLICY IF EXISTS "LOCKDOWN: Admin only enrollment access" ON public.enrollment_requests;

CREATE POLICY "LOCKDOWN: Admin only enrollment access"
ON public.enrollment_requests
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "SECURE: Service enrollment creation"
ON public.enrollment_requests
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.enrollment_context', true) = 'secure_enrollment_creation' AND
  current_setting('app.security_validated', true) = 'true'
);

-- 6. Add logging for security violations
CREATE OR REPLACE FUNCTION public.log_security_violation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    'unauthorized_access_attempt',
    'sensitive_data_tables',
    'policy_violation',
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Don't fail if logging fails
END;
$$;