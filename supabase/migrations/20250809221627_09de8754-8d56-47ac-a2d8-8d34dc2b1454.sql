-- Fix Customer Contact Information Security Issue
-- Remove insecure service role policy and implement proper authentication

-- 1. Remove the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can insert enrollment requests" ON public.enrollment_requests;

-- 2. Remove the rate limited policy that allows public access
DROP POLICY IF EXISTS "Rate limited enrollment creation" ON public.enrollment_requests;

-- 3. Create a more secure policy that requires authentication OR uses a specific edge function context
CREATE POLICY "Authenticated users can create enrollment requests" 
ON public.enrollment_requests 
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow authenticated users to create their own enrollment requests
  auth.uid() IS NOT NULL AND
  -- Apply rate limiting for authenticated users
  public.check_rate_limit(
    auth.uid()::text, 
    'enrollment_request', 
    3, -- max 3 attempts
    60 -- per 60 minutes
  )
);

-- 4. Create a secure service role policy only for the specific edge function
CREATE POLICY "Secure enrollment creation via edge function" 
ON public.enrollment_requests 
FOR INSERT
TO service_role
WITH CHECK (
  -- Only allow if called through our secure edge function with proper validation
  current_setting('app.enrollment_context', true) = 'secure_enrollment_endpoint' AND
  -- Apply additional validation
  char_length(trim(name)) >= 2 AND 
  char_length(trim(name)) <= 100 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  phone ~* '^[\+]?[1-9][\d]{0,15}$'
);

-- 5. Add additional security logging for enrollment attempts
CREATE OR REPLACE FUNCTION public.log_enrollment_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_failure_reason TEXT DEFAULT NULL
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
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    CASE WHEN p_success THEN 'enrollment_success' ELSE 'enrollment_failure' END,
    'enrollment_requests',
    CASE WHEN p_success THEN p_email ELSE p_failure_reason END,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail enrollment if logging fails
  NULL;
END;
$$;