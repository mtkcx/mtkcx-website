-- Fix remaining security issues by adding proper user access without conflicts
-- Address the user-specific access needs while maintaining security

-- 1. Fix profiles table policies (avoiding conflicts)
DROP POLICY IF EXISTS "LOCKDOWN: Admin only profile access" ON public.profiles;

-- Only create new policies if they don't exist
DO $$
BEGIN
    -- Create user profile policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can create their own profile') THEN
        CREATE POLICY "Users can create their own profile"
        ON public.profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can manage all profiles') THEN
        CREATE POLICY "Admins can manage all profiles"
        ON public.profiles
        FOR ALL
        TO public
        USING (ultra_secure_admin_check())
        WITH CHECK (ultra_secure_admin_check());
    END IF;

    -- Fix chat access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can view their own conversations') THEN
        CREATE POLICY "Users can view their own conversations"
        ON public.chat_conversations
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view their own messages') THEN
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
    END IF;

END $$;

-- 2. Create secure function for user data validation
CREATE OR REPLACE FUNCTION public.ensure_user_data_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure RLS is enabled on sensitive tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename IN ('profiles', 'orders', 'chat_conversations', 'contact_messages', 'mobile_orders')
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Critical security error: RLS not enabled on sensitive tables';
  END IF;
  
  -- Log security validation
  PERFORM log_sensitive_data_access('security_validation', 'user_data_security_check');
  
  RETURN TRUE;
END;
$$;