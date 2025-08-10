-- FINAL SECURITY LOCKDOWN - Fixed version without SELECT triggers

-- 1. Complete lockdown of enrollment_requests
DROP POLICY IF EXISTS "Admins can view all enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Admins can update enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Only admins can delete enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Only admins can update enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Secure admin enrollment management" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Ultra secure admin-only enrollment management" ON public.enrollment_requests;

-- Create single restrictive policy for enrollment_requests
CREATE POLICY "SECURE: Admin-only access to enrollment requests"
ON public.enrollment_requests
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Complete lockdown of newsletter_subscriptions  
DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Secure admin newsletter management" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Ultra secure admin-only newsletter management" ON public.newsletter_subscriptions;

-- Create single restrictive policy for newsletter_subscriptions
CREATE POLICY "SECURE: Admin-only access to newsletter subscriptions"
ON public.newsletter_subscriptions
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Complete lockdown of orders table
DROP POLICY IF EXISTS "Authenticated users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only authenticated users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Secure authenticated order access" ON public.orders;
DROP POLICY IF EXISTS "Orders: Authenticated users only see their own orders" ON public.orders;
DROP POLICY IF EXISTS "Orders: Secure guest order lookup with full validation" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update their orders" ON public.orders;

-- Create single restrictive policy for orders
CREATE POLICY "SECURE: User-owned and admin-only order access"
ON public.orders
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
);

CREATE POLICY "SECURE: Admin-only order management"
ON public.orders
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Complete lockdown of chat_conversations
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Chat: Admin-only conversation management" ON public.chat_conversations;
DROP POLICY IF EXISTS "Chat: Users can only access their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Chat conversations: Strict user and admin access only" ON public.chat_conversations;
DROP POLICY IF EXISTS "Chat: Authenticated users can create their own conversations" ON public.chat_conversations;

-- Create single restrictive policy for chat_conversations
CREATE POLICY "SECURE: Authenticated user-owned and admin-only chat access"
ON public.chat_conversations
FOR ALL
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
);

-- 5. Complete lockdown of chat_messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages: Strict conversation participant access only" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages: Authenticated users can only add to their conversations" ON public.chat_messages;

-- Create single restrictive policy for chat_messages
CREATE POLICY "SECURE: Authenticated conversation participant and admin-only access"
ON public.chat_messages
FOR ALL
USING (
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND chat_conversations.user_id = auth.uid()
  )) OR 
  is_admin()
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND chat_conversations.user_id = auth.uid()
  )) OR 
  is_admin()
);

-- 6. Complete lockdown of profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Secure user profile view access" ON public.profiles;
DROP POLICY IF EXISTS "Secure user profile creation access" ON public.profiles;
DROP POLICY IF EXISTS "Secure user profile update access" ON public.profiles;

-- Create single restrictive policy for profiles
CREATE POLICY "SECURE: User-owned and admin-only profile access"
ON public.profiles
FOR ALL
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  is_admin()
);

-- 7. Ensure order_items is also locked down
DROP POLICY IF EXISTS "Authenticated users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Only authenticated users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Secure authenticated order items access" ON public.order_items;
DROP POLICY IF EXISTS "Order Items: Secure guest access with full validation" ON public.order_items;

-- Create single restrictive policy for order_items
CREATE POLICY "SECURE: User-owned order items and admin-only access"
ON public.order_items
FOR ALL
USING (
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )) OR 
  is_admin()
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )) OR 
  is_admin()
);