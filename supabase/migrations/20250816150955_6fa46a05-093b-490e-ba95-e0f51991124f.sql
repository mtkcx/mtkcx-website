-- Fix user_preferences table RLS policies to prevent unauthorized data access
-- Current policies allow anonymous users to access device preferences, which could expose tracking data

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Anonymous users can manage device preferences" ON public.user_preferences;

-- Create more restrictive policy for device-only preferences
-- Only allow access to preferences where user owns the device session
CREATE POLICY "Device owners can manage preferences"
ON public.user_preferences
FOR ALL
TO public
USING (
  (user_id IS NULL AND device_id IS NOT NULL AND 
   current_setting('app.device_session', true) = device_id)
  OR 
  (user_id = auth.uid())
)
WITH CHECK (
  (user_id IS NULL AND device_id IS NOT NULL AND 
   current_setting('app.device_session', true) = device_id)
  OR 
  (user_id = auth.uid())
);