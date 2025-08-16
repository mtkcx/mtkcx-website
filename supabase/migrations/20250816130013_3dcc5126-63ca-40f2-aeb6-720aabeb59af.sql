-- Security Fix 1: Fix User Preferences RLS Policy - Corrected Version
-- First, drop all existing policies on user_preferences
DROP POLICY IF EXISTS "Device based preferences access" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Admins can manage all user preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Anonymous users can manage device preferences" ON public.user_preferences;

-- Create proper user-specific RLS policies
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create admin policy for management
CREATE POLICY "Admins can manage all user preferences"
ON public.user_preferences
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create anonymous device-based policy for non-authenticated users
CREATE POLICY "Anonymous users can manage device preferences"
ON public.user_preferences
FOR ALL
USING (user_id IS NULL AND device_id IS NOT NULL)
WITH CHECK (user_id IS NULL AND device_id IS NOT NULL);