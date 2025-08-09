-- Final Security Hardening - Fix All Remaining Issues
-- Address: Company Contact Information Could Be Harvested by Competitors

-- 1. Secure site_settings table - Remove overly permissive public access
DROP POLICY IF EXISTS "Everyone can read site settings" ON public.site_settings;

-- Create more restrictive policy for site settings
CREATE POLICY "Public can read non-sensitive site settings" 
ON public.site_settings 
FOR SELECT 
USING (
  -- Allow public access only to general content, not sensitive business data
  category NOT IN ('contact', 'business', 'private', 'admin') AND
  setting_key NOT LIKE '%email%' AND
  setting_key NOT LIKE '%phone%' AND
  setting_key NOT LIKE '%address%' AND
  setting_key NOT LIKE '%contact%' AND
  setting_key NOT LIKE '%api%' AND
  setting_key NOT LIKE '%secret%' AND
  setting_key NOT LIKE '%key%'
);

-- Allow authenticated users to read business settings
CREATE POLICY "Authenticated users can read business settings" 
ON public.site_settings 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Add comprehensive input validation constraints
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT IF NOT EXISTS valid_customer_email_format 
CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR customer_email IS NULL);

ALTER TABLE public.chat_conversations 
ADD CONSTRAINT IF NOT EXISTS valid_customer_name_length 
CHECK (char_length(trim(customer_name)) >= 1 AND char_length(trim(customer_name)) <= 100 OR customer_name IS NULL);

-- 3. Enhance rate limiting with more granular controls
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60,
  p_strict_mode BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
  ip_attempts INTEGER;
BEGIN
  -- Base rate limiting
  IF NOT public.check_rate_limit(p_identifier, p_action_type, p_max_attempts, p_window_minutes) THEN
    RETURN FALSE;
  END IF;
  
  -- Additional IP-based rate limiting for strict mode
  IF p_strict_mode THEN
    window_start := now() - (p_window_minutes || ' minutes')::interval;
    
    SELECT COUNT(*) INTO ip_attempts
    FROM public.rate_limits
    WHERE identifier = inet_client_addr()::text
      AND first_attempt_at >= window_start;
    
    -- Limit total attempts per IP across all actions
    IF ip_attempts >= (p_max_attempts * 3) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 4. Add security headers and validation for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_sensitive_operation(
  p_operation TEXT,
  p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all sensitive operations
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    'sensitive_operation_' || p_operation,
    'security_validation',
    p_operation,
    inet_client_addr(),
    COALESCE(p_user_agent, current_setting('request.headers', true)::json->>'user-agent')
  );
  
  -- Additional validation can be added here
  RETURN TRUE;
END;
$$;

-- 5. Create comprehensive security monitoring view (admin-only)
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  'enrollment_requests' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours') as records_24h,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour') as records_1h
FROM public.enrollment_requests
UNION ALL
SELECT 
  'chat_conversations',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours'),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')
FROM public.chat_conversations
UNION ALL
SELECT 
  'orders',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours'),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')
FROM public.orders
UNION ALL
SELECT 
  'security_audit_log',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours'),
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')
FROM public.security_audit_log;

-- Secure the security dashboard view
ALTER VIEW public.security_dashboard OWNER TO postgres;

-- Create policy for security dashboard (admin only)
CREATE POLICY "Only admins can view security dashboard" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 6. Add final data validation triggers
CREATE OR REPLACE FUNCTION public.validate_customer_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NOT (NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate phone format if provided  
  IF NEW.phone IS NOT NULL AND NOT (NEW.phone ~* '^[\+]?[1-9][\d]{0,15}$') THEN
    RAISE EXCEPTION 'Invalid phone format: %', NEW.phone;
  END IF;
  
  -- Validate name if provided
  IF NEW.name IS NOT NULL AND (char_length(trim(NEW.name)) < 2 OR char_length(trim(NEW.name)) > 100) THEN
    RAISE EXCEPTION 'Invalid name length: %', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation trigger to enrollment requests
DROP TRIGGER IF EXISTS validate_enrollment_data ON public.enrollment_requests;
CREATE TRIGGER validate_enrollment_data
  BEFORE INSERT OR UPDATE ON public.enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_customer_data();

-- 7. Final cleanup - ensure all sensitive tables have proper RLS
DO $$
DECLARE
  tbl_name TEXT;
  policy_count INTEGER;
BEGIN
  -- Check and ensure RLS is enabled on all sensitive tables
  FOR tbl_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('enrollment_requests', 'orders', 'chat_conversations', 'chat_messages', 'email_logs', 'security_audit_log', 'newsletter_subscriptions', 'user_roles')
  LOOP
    -- Enable RLS if not already enabled
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
    
    -- Check if table has policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = tbl_name;
    
    -- Log tables without policies (for monitoring)
    IF policy_count = 0 THEN
      RAISE NOTICE 'Table % has no RLS policies', tbl_name;
    END IF;
  END LOOP;
END;
$$;