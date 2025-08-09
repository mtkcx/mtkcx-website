-- Create website content management tables for admin editing

-- Table for general site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'text', -- text, textarea, image, boolean, json
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for page content sections
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL, -- homepage, about, contact, etc.
  section_name text NOT NULL, -- hero, services, features, etc.
  content_key text NOT NULL, -- title, description, image_url, etc.
  content_value text,
  content_type text NOT NULL DEFAULT 'text',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(page_name, section_name, content_key)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can manage content
CREATE POLICY "Only admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Only admins can manage page content" 
ON public.page_content 
FOR ALL 
USING (is_admin());

-- Everyone can read content for displaying on pages
CREATE POLICY "Everyone can read site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can read page content" 
ON public.page_content 
FOR SELECT 
USING (is_active = true);

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description, category) VALUES
('site_title', 'MT KCx', 'text', 'Main site title', 'general'),
('site_description', 'Professional automotive detailing products and services', 'textarea', 'Site meta description', 'general'),
('company_name', 'MT KCx', 'text', 'Company name', 'company'),
('company_email', 'info@mtkc.com', 'text', 'Company contact email', 'company'),
('company_phone', '+1 (555) 123-4567', 'text', 'Company contact phone', 'company'),
('company_address', '123 Business St, City, State 12345', 'textarea', 'Company physical address', 'company'),
('hero_background_image', '/lovable-uploads/hero-bg.jpg', 'image', 'Hero section background image', 'homepage'),
('footer_copyright', '© 2024 MT KCx. All rights reserved.', 'text', 'Footer copyright text', 'footer')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default page content
INSERT INTO public.page_content (page_name, section_name, content_key, content_value, content_type) VALUES
('homepage', 'hero', 'title', 'Professional Automotive Detailing', 'text'),
('homepage', 'hero', 'subtitle', 'Transform your vehicle with our premium detailing products and expert services', 'text'),
('homepage', 'hero', 'cta_text', 'Explore Products', 'text'),
('homepage', 'services', 'title', 'Our Services', 'text'),
('homepage', 'services', 'description', 'We offer comprehensive automotive detailing solutions', 'text'),
('about', 'hero', 'title', 'About MT KCx', 'text'),
('about', 'hero', 'description', 'Learn about our commitment to automotive excellence', 'text'),
('contact', 'hero', 'title', 'Contact Us', 'text'),
('contact', 'hero', 'description', 'Get in touch with our team', 'text')
ON CONFLICT (page_name, section_name, content_key) DO NOTHING;

-- Create updated_at triggers
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();