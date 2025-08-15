-- Update the site_settings table insert to match current schema
INSERT INTO public.site_settings (setting_key, setting_value, category, description, setting_type) VALUES (
  'seo_settings',
  '{
    "site_title": "MTKCx | Koch-Chemie Distribution Partner",
    "site_description": "Official Koch-Chemie distributor offering premium German car detailing products, professional training courses, and expert car wrapping services. Shop authentic Koch-Chemie products online.",
    "site_keywords": "koch chemie, car detailing, automotive cleaning, professional car care, german car products, car wrapping, detailing training, MT Wraps",
    "favicon_url": "/favicon.png",
    "og_image_url": "https://kochchemie-east-hub.lovable.app/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png"
  }',
  'seo',
  'SEO configuration including title, description, keywords, favicon and og image',
  'json'
) ON CONFLICT (setting_key) DO NOTHING;