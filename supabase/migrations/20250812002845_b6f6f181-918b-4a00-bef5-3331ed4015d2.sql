-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  service_interest TEXT,
  status TEXT NOT NULL DEFAULT 'unread',
  admin_notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE,
  replied_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact messages
CREATE POLICY "LOCKDOWN: Admin only contact message access" 
ON public.contact_messages 
FOR ALL 
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

-- Allow service role to insert contact messages (for edge functions)
CREATE POLICY "SERVICE: Edge function contact message insertion" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (
  current_setting('app.contact_context', true) = 'secure_contact_creation' AND
  current_setting('app.security_validated', true) = 'true'
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();