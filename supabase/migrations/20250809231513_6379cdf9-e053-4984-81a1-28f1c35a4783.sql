-- Final Security Hardening - Fix Syntax and Complete Security
-- Address remaining issues and harden everything

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

-- 2. Add email validation constraint to chat_conversations (without IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'chat_conversations' 
    AND constraint_name = 'valid_customer_email_format'
  ) THEN
    ALTER TABLE public.chat_conversations 
    ADD CONSTRAINT valid_customer_email_format 
    CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR customer_email IS NULL);
  END IF;
END
$$;

-- 3. Add name validation constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'chat_conversations' 
    AND constraint_name = 'valid_customer_name_length'
  ) THEN
    ALTER TABLE public.chat_conversations 
    ADD CONSTRAINT valid_customer_name_length 
    CHECK (char_length(trim(customer_name)) >= 1 AND char_length(trim(customer_name)) <= 100 OR customer_name IS NULL);
  END IF;
END
$$;

-- 4. Create comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS TABLE (
  table_name TEXT,
  total_records BIGINT,
  records_24h BIGINT,
  records_1h BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 'enrollment_requests'::TEXT, 
         COUNT(*)::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')::BIGINT
  FROM public.enrollment_requests
  UNION ALL
  SELECT 'chat_conversations'::TEXT,
         COUNT(*)::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')::BIGINT
  FROM public.chat_conversations
  UNION ALL
  SELECT 'orders'::TEXT,
         COUNT(*)::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')::BIGINT
  FROM public.orders
  UNION ALL
  SELECT 'security_audit_log'::TEXT,
         COUNT(*)::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')::BIGINT,
         COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 hour')::BIGINT
  FROM public.security_audit_log;
$$;