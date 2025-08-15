-- Create user_preferences table for language and other preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  preferred_language TEXT DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences (device-based, no auth required)
CREATE POLICY "Anyone can view preferences by device_id" 
ON public.user_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create their own device preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own device preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_device_id ON public.user_preferences(device_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();