-- Add additional security enhancements for enrollment_requests table

-- Add constraint to validate email format
ALTER TABLE public.enrollment_requests 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint to validate phone format (basic validation)
ALTER TABLE public.enrollment_requests 
ADD CONSTRAINT valid_phone_format 
CHECK (phone ~* '^[\+]?[1-9][\d]{0,15}$');

-- Add constraint to validate name is not empty
ALTER TABLE public.enrollment_requests 
ADD CONSTRAINT valid_name_length 
CHECK (char_length(trim(name)) >= 2 AND char_length(trim(name)) <= 100);

-- Update the INSERT policy to include basic rate limiting check
DROP POLICY IF EXISTS "Anyone can create enrollment requests" ON public.enrollment_requests;

CREATE POLICY "Rate limited enrollment creation" 
ON public.enrollment_requests 
FOR INSERT 
WITH CHECK (
  -- Allow creation but with rate limiting
  public.check_rate_limit(
    COALESCE(auth.email(), inet_client_addr()::text), 
    'enrollment_request', 
    3, -- max 3 attempts
    60 -- per 60 minutes
  )
);

-- Add policy to prevent viewing by unauthorized users (extra security)
CREATE POLICY "Prevent unauthorized enrollment access" 
ON public.enrollment_requests 
FOR ALL
TO public
USING (false);

-- Add admin-only policies that override the restrictive policy above
CREATE POLICY "Admins can manage all enrollment requests" 
ON public.enrollment_requests 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add policy for service role (for edge functions)
CREATE POLICY "Service role can insert enrollment requests" 
ON public.enrollment_requests 
FOR INSERT
TO service_role
WITH CHECK (true);