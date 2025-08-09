-- Create enrollment requests table
CREATE TABLE public.enrollment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course_type TEXT NOT NULL DEFAULT 'professional_detailing',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create enrollment requests" 
ON public.enrollment_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all enrollment requests" 
ON public.enrollment_requests 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update enrollment requests" 
ON public.enrollment_requests 
FOR UPDATE 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enrollment_requests_updated_at
BEFORE UPDATE ON public.enrollment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();