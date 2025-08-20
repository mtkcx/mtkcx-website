-- Strengthen RLS policies for maximum security

-- Enhance contact messages security
DROP POLICY IF EXISTS "BULLETPROOF: Admin only contact access" ON public.contact_messages;
CREATE POLICY "MAXIMUM_SECURITY: Contact messages admin only" 
ON public.contact_messages 
FOR ALL 
USING (ultra_secure_admin_check()) 
WITH CHECK (ultra_secure_admin_check());

-- Enhance newsletter security  
DROP POLICY IF EXISTS "BULLETPROOF: Newsletter admin only" ON public.newsletter_subscriptions;
CREATE POLICY "MAXIMUM_SECURITY: Newsletter admin only" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (ultra_secure_admin_check()) 
WITH CHECK (ultra_secure_admin_check());

-- Enhance enrollment security
DROP POLICY IF EXISTS "LOCKDOWN: Admin only enrollment access" ON public.enrollment_requests;
CREATE POLICY "MAXIMUM_SECURITY: Enrollment admin only" 
ON public.enrollment_requests 
FOR ALL 
USING (ultra_secure_admin_check()) 
WITH CHECK (ultra_secure_admin_check());

-- Enhance chat security with user-specific access
DROP POLICY IF EXISTS "BULLETPROOF: Chat conversations locked down" ON public.chat_conversations;
CREATE POLICY "MAXIMUM_SECURITY: Chat conversations restricted" 
ON public.chat_conversations 
FOR ALL 
USING (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
) 
WITH CHECK (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "BULLETPROOF: Chat messages locked down" ON public.chat_messages;
CREATE POLICY "MAXIMUM_SECURITY: Chat messages restricted" 
ON public.chat_messages 
FOR ALL 
USING (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  ))
) 
WITH CHECK (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  ))
);

-- Enhance order security with stricter user access
DROP POLICY IF EXISTS "BULLETPROOF: Orders access control" ON public.orders;
CREATE POLICY "MAXIMUM_SECURITY: Orders restricted access" 
ON public.orders 
FOR ALL 
USING (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
) 
WITH CHECK (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
  (current_setting('app.order_context', true) = 'secure_order_creation' AND 
   current_setting('app.security_validated', true) = 'true')
);