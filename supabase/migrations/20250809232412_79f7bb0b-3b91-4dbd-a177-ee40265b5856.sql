-- FINAL SECURITY FIX - Correct Syntax and Complete Security
-- Fix the syntax error and secure everything

-- 1. Fix Newsletter Subscriptions - Remove public INSERT access
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

-- Create secure newsletter subscription policy
CREATE POLICY "Secure newsletter subscription via edge function" 
ON public.newsletter_subscriptions 
FOR INSERT
TO service_role
WITH CHECK (
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 2. Fix chat conversations INSERT policy (correct syntax)
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.chat_conversations;

-- Create admin-only conversation creation policy with correct syntax
CREATE POLICY "Only admins and service role can create conversations" 
ON public.chat_conversations 
FOR INSERT
TO authenticated, service_role
WITH CHECK (
  -- Only admins or secure edge functions can create conversations
  is_admin() OR 
  (auth.role() = 'service_role' AND current_setting('app.chat_context', true) = 'secure_chat_creation')
);

-- 3. Ultra-secure email logs - Admin only access
DROP POLICY IF EXISTS "Users can view their order email logs" ON public.email_logs;

-- Email logs should only be viewed by admins
CREATE POLICY "Only admins can view email logs" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 4. Create newsletter context setting function
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

-- 5. Create chat context setting function
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

-- 6. Final validation - ensure all sensitive tables are locked down
DO $$
DECLARE
  table_record RECORD;
BEGIN
  -- Ensure RLS is enabled on all sensitive tables
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'enrollment_requests', 'chat_conversations', 'chat_messages', 
      'email_logs', 'newsletter_subscriptions', 'orders', 'order_items',
      'user_roles', 'security_audit_log'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    RAISE NOTICE 'RLS enabled for table: %', table_record.tablename;
  END LOOP;
END;
$$;