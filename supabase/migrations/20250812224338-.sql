-- Fix user_preferences RLS policy to prevent unauthorized access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view and update their own preferences" ON public.user_preferences;

-- Create a secure policy that only allows users to access their own data
CREATE POLICY "Users can only access their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Keep the admin policy as-is since admins need full access
-- The "Admins can view all preferences" policy remains unchanged