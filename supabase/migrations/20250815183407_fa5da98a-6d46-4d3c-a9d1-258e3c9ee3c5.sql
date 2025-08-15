-- Create site_settings table for storing SEO and other site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Only admins can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can create site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete site settings" 
ON public.site_settings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default SEO settings
INSERT INTO public.site_settings (key, value) VALUES (
  'seo_settings',
  '{
    "site_title": "MTKCx | Koch-Chemie Distribution Partner",
    "site_description": "Official Koch-Chemie distributor offering premium German car detailing products, professional training courses, and expert car wrapping services. Shop authentic Koch-Chemie products online.",
    "site_keywords": "koch chemie, car detailing, automotive cleaning, professional car care, german car products, car wrapping, detailing training, MT Wraps",
    "favicon_url": "/favicon.png",
    "og_image_url": "https://kochchemie-east-hub.lovable.app/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;