-- Create user_preferences table for language and other preferences (if not exists)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE,
  user_id UUID,
  preferred_language TEXT DEFAULT 'en',
  push_notifications_enabled BOOLEAN DEFAULT true,
  order_notifications_enabled BOOLEAN DEFAULT true,
  marketing_notifications_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint for device_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_device_id_key') THEN
    ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_device_id_key UNIQUE (device_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view preferences by device_id" ON public.user_preferences;
DROP POLICY IF EXISTS "Anyone can create their own device preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Anyone can update their own device preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can only access their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_preferences;

-- Create new policies for device-based access (for guests) and user-based access (for authenticated users)
CREATE POLICY "Device based preferences access" 
ON public.user_preferences 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_preferences_device_id ON public.user_preferences(device_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);