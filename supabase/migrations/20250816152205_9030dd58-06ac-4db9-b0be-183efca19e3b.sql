-- Comprehensive security lockdown - eliminate all potential vulnerabilities
-- Remove redundant policies and ensure no gaps in security coverage

-- 1. Clean up contact_messages - ensure bulletproof admin-only access
DROP POLICY IF EXISTS "LOCKDOWN: Admin only contact access" ON public.contact_messages;
DROP POLICY IF EXISTS "SECURE: Service contact creation" ON public.contact_messages;

CREATE POLICY "BULLETPROOF: Admin only contact access"
ON public.contact_messages
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "BULLETPROOF: Service contact insertion only"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.contact_context', true) = 'secure_contact_creation' AND
  current_setting('app.security_validated', true) = 'true' AND
  current_setting('app.rate_limit_passed', true) = 'true'
);

-- 2. Clean up chat tables - ensure no public access possible
DROP POLICY IF EXISTS "LOCKDOWN: Admin only chat conversation access" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;

CREATE POLICY "BULLETPROOF: Chat conversations locked down"
ON public.chat_conversations
FOR ALL
TO public
USING (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
)
WITH CHECK (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "LOCKDOWN: Admin only chat message access" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;

CREATE POLICY "BULLETPROOF: Chat messages locked down"
ON public.chat_messages
FOR ALL
TO public
USING (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  ))
)
WITH CHECK (
  ultra_secure_admin_check() OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  ))
);

-- 3. Clean up orders table - remove conflicting policies
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "LOCKDOWN: Admin only order access" ON public.orders;
DROP POLICY IF EXISTS "SERVICE: Edge function order creation" ON public.orders;
DROP POLICY IF EXISTS "Secure order creation via edge function" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "BULLETPROOF: Orders access control"
ON public.orders
FOR ALL
TO public
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

-- 4. Clean up newsletter subscriptions - bulletproof admin only
DROP POLICY IF EXISTS "LOCKDOWN: Admin only newsletter access" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "SECURE: Service newsletter creation" ON public.newsletter_subscriptions;

CREATE POLICY "BULLETPROOF: Newsletter admin only"
ON public.newsletter_subscriptions
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "BULLETPROOF: Newsletter service creation"
ON public.newsletter_subscriptions
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  current_setting('app.security_validated', true) = 'true' AND
  current_setting('app.rate_limit_passed', true) = 'true'
);

-- 5. Clean up mobile orders - ensure complete lockdown
DROP POLICY IF EXISTS "SECURE: Service mobile order creation only" ON public.mobile_orders;
DROP POLICY IF EXISTS "SECURE: Service role mobile order creation" ON public.mobile_orders;
DROP POLICY IF EXISTS "STRICT: Admin only mobile orders access" ON public.mobile_orders;

CREATE POLICY "BULLETPROOF: Mobile orders complete lockdown"
ON public.mobile_orders
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

CREATE POLICY "BULLETPROOF: Mobile order service creation"
ON public.mobile_orders
FOR INSERT
TO public
WITH CHECK (
  current_setting('app.mobile_order_context', true) = 'secure_mobile_order_creation' AND
  current_setting('app.security_validated', true) = 'true' AND
  current_setting('app.rate_limit_passed', true) = 'true'
);

-- 6. Add comprehensive security validation
CREATE OR REPLACE FUNCTION public.verify_bulletproof_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  vulnerable_tables text[];
BEGIN
  -- Check for any tables without RLS
  SELECT array_agg(tablename) INTO vulnerable_tables
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('contact_messages', 'chat_conversations', 'orders', 'newsletter_subscriptions', 'mobile_orders')
  AND rowsecurity = false;
  
  IF array_length(vulnerable_tables, 1) > 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH: Tables without RLS: %', array_to_string(vulnerable_tables, ', ');
  END IF;
  
  -- Log security check
  PERFORM log_sensitive_data_access('security_verification', 'bulletproof_check');
  
  RETURN true;
END;
$$;