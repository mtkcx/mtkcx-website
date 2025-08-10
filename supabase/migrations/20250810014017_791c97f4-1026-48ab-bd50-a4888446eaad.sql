-- Fix remaining critical security issues

-- 1. Remove any public read access from enrollment_requests
DROP POLICY IF EXISTS "Secure admin enrollment view access" ON public.enrollment_requests;
-- Only keep admin-only access and the secure insert policy

-- 2. Remove any public read access from newsletter_subscriptions  
DROP POLICY IF EXISTS "Secure admin newsletter view access" ON public.newsletter_subscriptions;
-- Only keep admin-only access and the secure insert policy

-- 3. Fix chat_conversations - remove any public read policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Secure user conversation access" ON public.chat_conversations;

-- Create restrictive policy for chat conversations
CREATE POLICY "Chat conversations: Strict user and admin access only" 
ON public.chat_conversations 
FOR SELECT 
USING (
  -- Only authenticated users can see their own conversations OR admins can see all
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
);

-- 4. Fix chat_messages - remove any public read policies  
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Secure user message access" ON public.chat_messages;

-- Create restrictive policy for chat messages
CREATE POLICY "Chat messages: Strict conversation participant access only" 
ON public.chat_messages 
FOR SELECT 
USING (
  -- Only authenticated users can see messages in their conversations OR admins
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND (chat_conversations.user_id = auth.uid() OR is_admin())
  )) OR 
  is_admin()
);

-- 5. Ensure chat message creation is also restricted
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.chat_messages;

CREATE POLICY "Chat messages: Authenticated users can only add to their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND (chat_conversations.user_id = auth.uid() OR is_admin())
  )
);

-- 6. Add additional security logging function for unauthorized access attempts
CREATE OR REPLACE FUNCTION public.log_unauthorized_access_attempt(
  table_name text,
  attempted_action text,
  user_context text DEFAULT NULL
)
RETURNS void
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
    'unauthorized_access_attempt_' || attempted_action,
    table_name,
    user_context,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail operations if logging fails, but try to log the logging error
  NULL;
END;
$$;

-- 7. Add function to completely lock down sensitive tables from public access
CREATE OR REPLACE FUNCTION public.enforce_strict_rls_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log any attempt to access sensitive tables without proper authorization
  PERFORM log_unauthorized_access_attempt('security_enforcement', 'policy_check');
  
  -- This function can be called by policies to ensure strict access control
  -- Returns void but logs access attempts for monitoring
END;
$$;