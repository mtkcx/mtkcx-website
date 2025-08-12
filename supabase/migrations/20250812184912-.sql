-- Create table for customer notifications
CREATE TABLE public.customer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  title_ar TEXT,
  message_ar TEXT,
  title_he TEXT,
  message_he TEXT,
  notification_type TEXT NOT NULL DEFAULT 'general', -- 'order_reminder', 'delivery_update', 'general', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for user preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT, -- For guest users
  preferred_language TEXT NOT NULL DEFAULT 'en',
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  order_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  marketing_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(device_id)
);

-- Create table for sent notifications log
CREATE TABLE public.sent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT,
  notification_id UUID REFERENCES customer_notifications(id),
  order_id UUID REFERENCES orders(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for customer_notifications
CREATE POLICY "Only admins can manage notifications" 
ON public.customer_notifications 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Policies for user_preferences
CREATE POLICY "Users can view and update their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id OR device_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id OR device_id IS NOT NULL);

CREATE POLICY "Admins can view all preferences" 
ON public.user_preferences 
FOR SELECT 
USING (is_admin());

-- Policies for sent_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.sent_notifications 
FOR SELECT 
USING (auth.uid() = user_id OR device_id IS NOT NULL);

CREATE POLICY "Admins can view all sent notifications" 
ON public.sent_notifications 
FOR ALL 
USING (is_admin());

CREATE POLICY "System can insert notification logs" 
ON public.sent_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customer_notifications_updated_at
BEFORE UPDATE ON public.customer_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();