-- Comprehensive Security Fix for Critical RLS Vulnerabilities
-- Addresses: Customer Support Conversations Exposed, Private Support Messages Readable, 
-- Student Personal Information at Risk, Customer Email History Exposed

-- 1. Fix Chat Conversations - Remove email-based access, require proper authentication
DROP POLICY IF EXISTS "Customers can view their conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.chat_conversations;

-- Add user_id column to link conversations to authenticated users
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create secure policies for chat conversations
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage all conversations" 
ON public.chat_conversations 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can create conversations" 
ON public.chat_conversations 
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Fix Chat Messages - Secure message access through proper conversation ownership
DROP POLICY IF EXISTS "Customers can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users and guests can insert messages with rate li" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND (chat_conversations.user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Users can insert messages in their conversations" 
ON public.chat_messages 
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND (chat_conversations.user_id = auth.uid() OR is_admin())
  )
);

CREATE POLICY "Admins can manage all messages" 
ON public.chat_messages 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Secure Email Logs - Restrict to order owners and admins only
DROP POLICY IF EXISTS "Users can view email logs for their orders" ON public.email_logs;
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can insert email logs" ON public.email_logs;

CREATE POLICY "Users can view their order email logs" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = email_logs.order_id 
    AND orders.user_id = auth.uid()
  )) OR is_admin()
);

CREATE POLICY "Admins can manage email logs" 
ON public.email_logs 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Service role can insert email logs" 
ON public.email_logs 
FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  ip_address INET DEFAULT inet_client_addr(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security audit log" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "System can insert audit log entries" 
ON public.security_audit_log 
FOR INSERT
WITH CHECK (true);

-- 5. Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL
) RETURNS VOID
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
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- 6. Add database-level validation for customer data
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT valid_conversation_status 
CHECK (status IN ('active', 'closed', 'transferred'));

ALTER TABLE public.chat_conversations 
ADD CONSTRAINT valid_conversation_language 
CHECK (language IN ('en', 'ar', 'he'));

-- 7. Ensure proper constraints on existing tables
ALTER TABLE public.enrollment_requests 
ADD CONSTRAINT valid_enrollment_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'contacted'));

ALTER TABLE public.enrollment_requests 
ADD CONSTRAINT valid_course_type 
CHECK (course_type IN ('professional_detailing', 'basic_detailing', 'advanced_techniques'));

-- 8. Create function to migrate existing email-based conversations to user-based (for future use)
CREATE OR REPLACE FUNCTION public.migrate_email_conversations_to_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  migration_count INTEGER := 0;
BEGIN
  -- This function can be used to migrate existing conversations
  -- when customer emails are linked to user accounts
  UPDATE public.chat_conversations 
  SET user_id = auth_users.id
  FROM auth.users auth_users
  WHERE chat_conversations.customer_email = auth_users.email
  AND chat_conversations.user_id IS NULL;
  
  GET DIAGNOSTICS migration_count = ROW_COUNT;
  RETURN migration_count;
END;
$$;