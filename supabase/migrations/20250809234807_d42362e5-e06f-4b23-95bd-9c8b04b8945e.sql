-- CRITICAL SECURITY FIX: Address data exposure vulnerabilities
-- This fixes overly permissive RLS policies that allow unauthorized access to sensitive data

-- 1. Fix Chat Conversations Security
-- Remove any overly permissive policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Public can read conversations" ON public.chat_conversations;

-- Ensure only proper access
CREATE POLICY "Users can only view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Only admins can manage all conversations" 
ON public.chat_conversations 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Fix Chat Messages Security
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public can read messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations only" 
ON public.chat_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND (chat_conversations.user_id = auth.uid() OR is_admin())
  )
);

-- 3. Fix Enrollment Requests Security
-- Remove any public access policies
DROP POLICY IF EXISTS "Anyone can view enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Public can read enrollments" ON public.enrollment_requests;

-- Ensure only admins can access enrollment data
CREATE POLICY "Only admins can view enrollment requests" 
ON public.enrollment_requests 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage enrollment requests" 
ON public.enrollment_requests 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Fix Newsletter Subscriptions Security
-- Remove any public access policies
DROP POLICY IF EXISTS "Anyone can view newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Public can read subscriptions" ON public.newsletter_subscriptions;

-- Ensure only admins can access subscriber data
CREATE POLICY "Only admins can view newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Keep secure newsletter signup via edge function
CREATE POLICY "Secure newsletter signup via edge function" 
ON public.newsletter_subscriptions 
FOR INSERT 
TO anon
WITH CHECK (
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 5. Fix Profiles Security
-- Remove any public access policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;

-- Ensure users can only access their own profiles
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Enhanced Security Audit Logging
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_table_name TEXT,
  p_action TEXT,
  p_record_id TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    p_action || '_sensitive_data_access',
    p_table_name,
    p_record_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail operations if logging fails
  NULL;
END;
$$;

-- 7. Add rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_sensitive_operation_rate_limit(
  p_operation TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
  user_identifier TEXT;
BEGIN
  -- Use user ID if authenticated, otherwise IP address
  user_identifier := COALESCE(auth.uid()::TEXT, inet_client_addr()::TEXT);
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count recent attempts
  SELECT COUNT(*) INTO current_count
  FROM public.security_audit_log
  WHERE (user_id::TEXT = user_identifier OR ip_address::TEXT = user_identifier)
    AND action LIKE p_operation || '%'
    AND created_at >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_attempts THEN
    -- Log the rate limit violation
    PERFORM public.log_sensitive_data_access('rate_limits', 'rate_limit_exceeded_' || p_operation);
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;