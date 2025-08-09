-- Complete Order Security Fixes - Add Missing Functions Only

-- 1. Create function to generate secure order session ID (if not exists)
CREATE OR REPLACE FUNCTION public.generate_order_session_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- 2. Create function to validate order access (if not exists)
CREATE OR REPLACE FUNCTION public.validate_order_access(
  p_order_id UUID,
  p_session_id TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  order_record RECORD;
BEGIN
  SELECT user_id, order_session_id, created_at
  INTO order_record
  FROM public.orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Admin access
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Authenticated user access
  IF order_record.user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Guest access with valid session
  IF order_record.user_id IS NULL AND 
     order_record.order_session_id = p_session_id AND
     order_record.created_at > (now() - INTERVAL '24 hours') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 3. Add audit logging for order access (if not exists)
CREATE OR REPLACE FUNCTION public.log_order_access(
  p_order_id UUID,
  p_action TEXT,
  p_success BOOLEAN
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action || CASE WHEN p_success THEN '_success' ELSE '_denied' END,
    'orders',
    p_order_id::TEXT,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Don't fail operations if logging fails
  NULL;
END;
$$;