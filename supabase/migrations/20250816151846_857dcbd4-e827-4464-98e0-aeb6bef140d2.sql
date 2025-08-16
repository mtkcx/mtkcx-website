-- Comprehensive security fix: Add user-specific access while maintaining admin security
-- This resolves all remaining security warnings by allowing users to access their own data

-- 1. Fix profiles table - allow users to access their own profiles
DROP POLICY IF EXISTS "LOCKDOWN: Admin only profile access" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

-- 2. Add user-specific access to orders table (for authenticated users to see their own orders)
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Add user-specific access to order_items (via orders relationship)
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 4. Add user-specific chat access
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE chat_conversations.id = chat_messages.conversation_id 
    AND chat_conversations.user_id = auth.uid()
  )
);

-- 5. Create secure user preferences access
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Add quote access for users
DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can create their own quotes" ON public.quotes;

CREATE POLICY "Users can manage their own quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all quotes"
ON public.quotes
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

-- 7. Create function to validate user context for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_user_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Log the access for security monitoring
  PERFORM log_sensitive_data_access('user_validation', 'user_context_check', auth.uid()::text);
  
  RETURN TRUE;
END;
$$;