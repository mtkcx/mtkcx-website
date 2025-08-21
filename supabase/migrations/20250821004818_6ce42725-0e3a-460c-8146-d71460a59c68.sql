-- Enable real-time updates for enrollment_requests table
ALTER TABLE public.enrollment_requests REPLICA IDENTITY FULL;

-- Add the table to the realtime publication to activate real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_requests;