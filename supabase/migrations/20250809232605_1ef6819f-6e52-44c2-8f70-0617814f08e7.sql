-- ABSOLUTE FINAL SECURITY FIX - Remove ALL public access to enrollment_requests

-- Remove ALL existing policies that might allow public read access
DROP POLICY IF EXISTS "Prevent unauthorized enrollment access" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Admins can manage all enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Authenticated users can create enrollment requests" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Ultra secure enrollment creation" ON public.enrollment_requests;

-- Create ONLY admin access policies for enrollment_requests
CREATE POLICY "Only admins can view enrollment requests" 
ON public.enrollment_requests 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can update enrollment requests" 
ON public.enrollment_requests 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete enrollment requests" 
ON public.enrollment_requests 
FOR DELETE 
TO authenticated
USING (is_admin());

-- Ultra-secure enrollment creation (service role only with strict validation)
CREATE POLICY "Ultra secure enrollment creation via edge function" 
ON public.enrollment_requests 
FOR INSERT
TO service_role
WITH CHECK (
  -- Multiple layers of validation
  current_setting('app.enrollment_context', true) = 'secure_enrollment_endpoint' AND
  current_setting('app.enrollment_validated', true) = 'true' AND
  -- Validate all required fields
  name IS NOT NULL AND char_length(trim(name)) >= 2 AND char_length(trim(name)) <= 100 AND
  email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  phone IS NOT NULL AND phone ~* '^[\+]?[1-9][\d]{0,15}$' AND
  course_type IN ('professional_detailing', 'basic_detailing', 'advanced_techniques')
);