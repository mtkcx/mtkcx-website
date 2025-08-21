-- Fix enrollment status constraint to allow all valid status values
ALTER TABLE public.enrollment_requests 
DROP CONSTRAINT IF EXISTS valid_enrollment_status;

-- Add updated constraint that includes all status options
ALTER TABLE public.enrollment_requests
ADD CONSTRAINT valid_enrollment_status 
CHECK (status IN ('pending', 'contacted', 'enrolled', 'declined'));