-- Fix site_settings table security vulnerabilities
-- Remove overly permissive policies and implement granular access control

-- Drop the dangerous policy that allows all authenticated users to read business settings
DROP POLICY IF EXISTS "Authenticated users can read business settings" ON public.site_settings;

-- Drop existing policies to rebuild them properly  
DROP POLICY IF EXISTS "Public can read non-sensitive site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only admins can manage site settings" ON public.site_settings;

-- 1. Public can only read truly safe, non-sensitive display settings
CREATE POLICY "Public: Safe display settings only"
ON public.site_settings
FOR SELECT
TO public
USING (
  category IN ('theme', 'display', 'ui', 'public') AND
  setting_key NOT LIKE '%email%' AND
  setting_key NOT LIKE '%phone%' AND
  setting_key NOT LIKE '%address%' AND
  setting_key NOT LIKE '%contact%' AND
  setting_key NOT LIKE '%api%' AND
  setting_key NOT LIKE '%secret%' AND
  setting_key NOT LIKE '%key%' AND
  setting_key NOT LIKE '%password%' AND
  setting_key NOT LIKE '%token%' AND
  setting_key NOT LIKE '%private%' AND
  setting_key NOT LIKE '%internal%' AND
  category NOT IN ('contact', 'business', 'private', 'admin', 'security', 'payment', 'integration')
);

-- 2. Authenticated users can read general business info (but not sensitive details)
CREATE POLICY "Authenticated: General business info"
ON public.site_settings
FOR SELECT
TO authenticated
USING (
  category IN ('general', 'about', 'services') AND
  setting_key NOT LIKE '%email%' AND
  setting_key NOT LIKE '%phone%' AND
  setting_key NOT LIKE '%address%' AND
  setting_key NOT LIKE '%api%' AND
  setting_key NOT LIKE '%secret%' AND
  setting_key NOT LIKE '%key%' AND
  setting_key NOT LIKE '%password%' AND
  setting_key NOT LIKE '%token%' AND
  setting_key NOT LIKE '%private%'
);

-- 3. Only admins can access sensitive business data and all management
CREATE POLICY "Admin: Full access to all settings"
ON public.site_settings
FOR ALL
TO public
USING (ultra_secure_admin_check())
WITH CHECK (ultra_secure_admin_check());

-- 4. Create function to safely get public settings
CREATE OR REPLACE FUNCTION public.get_public_setting(setting_name text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT setting_value 
  FROM public.site_settings 
  WHERE setting_key = setting_name
    AND category IN ('theme', 'display', 'ui', 'public')
    AND setting_key NOT LIKE '%email%'
    AND setting_key NOT LIKE '%phone%'
    AND setting_key NOT LIKE '%contact%'
    AND setting_key NOT LIKE '%api%'
    AND setting_key NOT LIKE '%secret%'
    AND setting_key NOT LIKE '%key%';
$$;

-- 5. Log access to sensitive settings
CREATE OR REPLACE FUNCTION public.audit_settings_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to potentially sensitive settings
  IF OLD.category IN ('contact', 'business', 'private', 'admin', 'security') OR
     OLD.setting_key LIKE '%email%' OR 
     OLD.setting_key LIKE '%phone%' OR
     OLD.setting_key LIKE '%api%' OR
     OLD.setting_key LIKE '%secret%' THEN
    
    PERFORM log_sensitive_data_access('site_settings', 'sensitive_setting_access', OLD.setting_key);
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger for auditing sensitive settings access
DROP TRIGGER IF EXISTS audit_sensitive_settings ON public.site_settings;
CREATE TRIGGER audit_sensitive_settings
  AFTER SELECT ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION audit_settings_access();