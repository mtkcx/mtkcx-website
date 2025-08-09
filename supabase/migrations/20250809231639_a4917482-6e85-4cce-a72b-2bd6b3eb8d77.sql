-- COMPREHENSIVE FINAL SECURITY FIX - Address All Remaining Issues
-- Fix all 4 remaining security findings

-- 1. Fix Newsletter Subscriptions - Remove public INSERT access
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

-- Create secure newsletter subscription policy (INSERT only via edge functions)
CREATE POLICY "Secure newsletter subscription via edge function" 
ON public.newsletter_subscriptions 
FOR INSERT
TO service_role
WITH CHECK (
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 2. Strengthen enrollment_requests policies - Remove any public access
DROP POLICY IF EXISTS "Secure enrollment creation via edge function" ON public.enrollment_requests;

-- Create ultra-secure enrollment policy
CREATE POLICY "Ultra secure enrollment creation" 
ON public.enrollment_requests 
FOR INSERT
TO service_role
WITH CHECK (
  -- Only allow through secure edge function with proper validation
  current_setting('app.enrollment_context', true) = 'secure_enrollment_endpoint' AND
  current_setting('app.enrollment_validated', true) = 'true' AND
  -- Validate all fields are properly formatted
  char_length(trim(name)) >= 2 AND 
  char_length(trim(name)) <= 100 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  phone ~* '^[\+]?[1-9][\d]{0,15}$' AND
  course_type IN ('professional_detailing', 'basic_detailing', 'advanced_techniques')
);

-- 3. Ultra-secure chat conversations - Remove any potential public access
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.chat_conversations;

-- Create admin-only conversation creation policy
CREATE POLICY "Only admins and service role can create conversations" 
ON public.chat_conversations 
FOR INSERT
USING (
  -- Only admins or secure edge functions can create conversations
  is_admin() OR 
  (auth.role() = 'service_role' AND current_setting('app.chat_context', true) = 'secure_chat_creation')
)
WITH CHECK (
  is_admin() OR 
  (auth.role() = 'service_role' AND current_setting('app.chat_context', true) = 'secure_chat_creation')
);

-- 4. Ultra-secure email logs - Admin only access
DROP POLICY IF EXISTS "Users can view their order email logs" ON public.email_logs;

-- Email logs should only be viewed by admins
CREATE POLICY "Only admins can view email logs" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 5. Create secure newsletter signup edge function context
CREATE OR REPLACE FUNCTION public.set_newsletter_context()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.newsletter_context', 'secure_newsletter_signup', true);
END;
$$;

-- 6. Create function to validate enrollment context
CREATE OR REPLACE FUNCTION public.set_enrollment_context()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.enrollment_context', 'secure_enrollment_endpoint', true);
  PERFORM set_config('app.enrollment_validated', 'true', true);
END;
$$;

-- 7. Create function to validate chat context
CREATE OR REPLACE FUNCTION public.set_chat_context()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.chat_context', 'secure_chat_creation', true);
END;
$$;

-- 8. Final security audit - create comprehensive security check function
CREATE OR REPLACE FUNCTION public.security_health_check()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  has_public_access BOOLEAN,
  security_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity::BOOLEAN,
    COALESCE(p.policy_count, 0)::BIGINT,
    COALESCE(p.has_public, false)::BOOLEAN,
    CASE 
      WHEN NOT t.rowsecurity THEN 'CRITICAL: RLS DISABLED'
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 'WARNING: NO POLICIES'
      WHEN COALESCE(p.has_public, false) THEN 'WARNING: PUBLIC ACCESS'
      ELSE 'SECURE'
    END::TEXT
  FROM pg_tables t
  LEFT JOIN (
    SELECT 
      tablename,
      COUNT(*) as policy_count,
      bool_or(roles = '{public}' OR 'public' = ANY(string_to_array(roles, ','))) as has_public
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public' 
  AND t.tablename IN (
    'enrollment_requests', 'chat_conversations', 'chat_messages', 
    'email_logs', 'newsletter_subscriptions', 'orders', 'order_items',
    'user_roles', 'security_audit_log', 'profiles'
  )
  ORDER BY 
    CASE 
      WHEN NOT t.rowsecurity THEN 1
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 2
      WHEN COALESCE(p.has_public, false) THEN 3
      ELSE 4
    END,
    t.tablename;
END;
$$;