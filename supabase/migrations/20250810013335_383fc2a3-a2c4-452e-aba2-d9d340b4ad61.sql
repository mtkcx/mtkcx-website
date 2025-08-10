-- Fix Critical Security Issues - Strengthen RLS Policies

-- 1. Fix enrollment_requests - Make admin-only with secure edge function validation
DROP POLICY IF EXISTS "Secure enrollment creation via edge function" ON public.enrollment_requests;
DROP POLICY IF EXISTS "Ultra secure enrollment creation via edge function" ON public.enrollment_requests;

CREATE POLICY "Ultra secure admin-only enrollment management" 
ON public.enrollment_requests 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Secure enrollment creation via validated edge function" 
ON public.enrollment_requests 
FOR INSERT 
WITH CHECK (
  -- Only allow through secure edge function with comprehensive validation
  current_setting('app.enrollment_context', true) = 'secure_enrollment_endpoint' AND
  current_setting('app.enrollment_validated', true) = 'true' AND
  current_setting('app.enrollment_ip_validated', true) = 'true' AND
  current_setting('app.enrollment_rate_limit_passed', true) = 'true' AND
  -- Data validation
  name IS NOT NULL AND
  char_length(TRIM(BOTH FROM name)) >= 2 AND
  char_length(TRIM(BOTH FROM name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  phone IS NOT NULL AND
  phone ~* '^[\+]?[1-9][\d]{0,15}$' AND
  course_type = ANY (ARRAY['professional_detailing', 'basic_detailing', 'advanced_techniques'])
);

-- 2. Fix newsletter_subscriptions - Make admin-only with secure edge function validation
DROP POLICY IF EXISTS "Secure newsletter registration via edge function" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Secure newsletter subscription via edge function" ON public.newsletter_subscriptions;

CREATE POLICY "Ultra secure admin-only newsletter management" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Secure newsletter subscription via validated edge function" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (
  -- Only allow through secure edge function with comprehensive validation
  current_setting('app.newsletter_context', true) = 'secure_newsletter_signup' AND
  current_setting('app.newsletter_validated', true) = 'true' AND
  current_setting('app.newsletter_ip_validated', true) = 'true' AND
  current_setting('app.newsletter_rate_limit_passed', true) = 'true' AND
  -- Data validation
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  char_length(email) <= 254
);

-- 3. Strengthen orders table policies - Remove complex guest access, simplify and secure
DROP POLICY IF EXISTS "Secure guest order verification" ON public.orders;
DROP POLICY IF EXISTS "Ultra secure guest order verification" ON public.orders;
DROP POLICY IF EXISTS "Emergency guest access for immediate checkout confirmation" ON public.orders;

-- Keep only authenticated users and secure admin access
CREATE POLICY "Orders: Authenticated users only see their own orders" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  is_admin()
);

-- Secure guest order access only through validated secure lookup
CREATE POLICY "Orders: Secure guest order lookup with full validation" 
ON public.orders 
FOR SELECT 
USING (
  user_id IS NULL AND
  order_session_id IS NOT NULL AND
  created_at > (now() - INTERVAL '24 hours') AND
  current_setting('app.secure_guest_validated', true) = 'true' AND
  current_setting('app.guest_order_id_validated', true)::uuid = id AND
  current_setting('app.ip_security_passed', true) = 'true' AND
  current_setting('app.rate_limit_security_passed', true) = 'true'
);

-- 4. Strengthen order_items policies to match orders
DROP POLICY IF EXISTS "Secure guest order items verification" ON public.order_items;
DROP POLICY IF EXISTS "Ultra secure guest order items" ON public.order_items;
DROP POLICY IF EXISTS "Ultra secure guest order items access" ON public.order_items;
DROP POLICY IF EXISTS "Emergency guest order items for immediate confirmation" ON public.order_items;

CREATE POLICY "Order Items: Secure guest access with full validation" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id AND (
      (orders.user_id = auth.uid()) OR
      is_admin() OR
      (
        orders.user_id IS NULL AND
        orders.order_session_id IS NOT NULL AND
        orders.created_at > (now() - INTERVAL '24 hours') AND
        current_setting('app.secure_guest_validated', true) = 'true' AND
        current_setting('app.guest_order_id_validated', true)::uuid = orders.id AND
        current_setting('app.ip_security_passed', true) = 'true' AND
        current_setting('app.rate_limit_security_passed', true) = 'true'
      )
    )
  )
);

-- 5. Strengthen chat_conversations - Remove service role access, admin and user only
DROP POLICY IF EXISTS "Only admins and service role can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Secure admin conversation management" ON public.chat_conversations;

CREATE POLICY "Chat: Admin-only conversation management" 
ON public.chat_conversations 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Chat: Users can only access their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  is_admin()
);

-- Create secure conversation creation for authenticated users only
CREATE POLICY "Chat: Authenticated users can create their own conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  customer_email IS NOT NULL AND
  customer_name IS NOT NULL
);

-- 6. Add data masking function for sensitive data logging
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data_value text, data_type text DEFAULT 'email')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  CASE data_type
    WHEN 'email' THEN
      RETURN CASE 
        WHEN data_value IS NULL THEN NULL
        WHEN char_length(data_value) <= 3 THEN '***'
        ELSE left(data_value, 3) || '***@***'
      END;
    WHEN 'phone' THEN
      RETURN CASE 
        WHEN data_value IS NULL THEN NULL
        WHEN char_length(data_value) <= 4 THEN '***'
        ELSE '***' || right(data_value, 4)
      END;
    WHEN 'name' THEN
      RETURN CASE 
        WHEN data_value IS NULL THEN NULL
        WHEN char_length(data_value) <= 2 THEN '***'
        ELSE left(data_value, 2) || '***'
      END;
    ELSE 
      RETURN '***';
  END CASE;
END;
$$;

-- 7. Create enhanced security validation function for edge functions
CREATE OR REPLACE FUNCTION public.validate_edge_function_security(
  operation_type text,
  client_ip inet DEFAULT inet_client_addr(),
  user_agent text DEFAULT current_setting('request.headers', true)::json->>'user-agent'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rate_limit_passed boolean;
  ip_validated boolean;
BEGIN
  -- Check rate limiting for the operation
  SELECT check_rate_limit(
    client_ip::text, 
    operation_type, 
    CASE operation_type 
      WHEN 'enrollment' THEN 3  -- Max 3 enrollment attempts per hour
      WHEN 'newsletter' THEN 5  -- Max 5 newsletter signups per hour
      WHEN 'order_lookup' THEN 10  -- Max 10 order lookups per hour
      ELSE 5
    END,
    60  -- 1 hour window
  ) INTO rate_limit_passed;
  
  IF NOT rate_limit_passed THEN
    PERFORM log_sensitive_data_access('rate_limit_exceeded', operation_type, client_ip::text);
    RETURN false;
  END IF;
  
  -- Basic IP validation (not from obviously malicious ranges)
  -- In production, integrate with IP reputation services
  ip_validated := true;  -- Simplified for demo
  
  -- Log the validation attempt
  PERFORM log_sensitive_data_access('security_validation', operation_type, 
    json_build_object(
      'ip', mask_sensitive_data(client_ip::text, 'name'),
      'user_agent', left(COALESCE(user_agent, 'unknown'), 100)
    )::text);
  
  RETURN rate_limit_passed AND ip_validated;
END;
$$;