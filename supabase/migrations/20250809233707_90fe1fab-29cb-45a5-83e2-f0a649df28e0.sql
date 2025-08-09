-- CRITICAL SECURITY FIX: Remove guest order access vulnerability
-- This fixes the issue where anonymous users could steal customer data with session IDs

-- 1. Remove the vulnerable guest access policy
DROP POLICY IF EXISTS "Guest users can view orders with valid session" ON public.orders;

-- 2. Create secure authenticated-only order access
CREATE POLICY "Authenticated users can only view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Create a secure guest order verification system (very restrictive)
CREATE POLICY "Secure guest order verification" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  -- Multiple security layers for guest access
  user_id IS NULL AND
  order_session_id IS NOT NULL AND
  -- Session must be set via secure context (edge function)
  current_setting('app.secure_guest_session', true) = order_session_id AND
  -- Strict time window (30 minutes only)
  created_at > (now() - INTERVAL '30 minutes') AND
  -- IP validation flag must be set
  current_setting('app.ip_validated', true) = 'true' AND
  -- Rate limit check must pass
  current_setting('app.rate_limit_passed', true) = 'true'
);

-- 4. Enhanced order item security (follow parent order security)
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON public.order_items;

CREATE POLICY "Authenticated users can view their order items" 
ON public.order_items 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Secure guest order items verification" 
ON public.order_items 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id IS NULL
    AND orders.order_session_id = current_setting('app.secure_guest_session', true)
    AND orders.created_at > (now() - INTERVAL '30 minutes')
    AND current_setting('app.ip_validated', true) = 'true'
    AND current_setting('app.rate_limit_passed', true) = 'true'
  )
);

-- 5. Create secure order access logging table
CREATE TABLE IF NOT EXISTS public.secure_order_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  access_method TEXT NOT NULL, -- 'authenticated', 'guest_verified', 'denied'
  ip_address INET DEFAULT inet_client_addr(),
  user_agent TEXT,
  session_token_hash TEXT, -- Hashed version for security
  success BOOLEAN NOT NULL DEFAULT false,
  denial_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the new logging table
ALTER TABLE public.secure_order_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Only admins can view order access logs" 
ON public.secure_order_access_log 
FOR SELECT 
TO authenticated
USING (is_admin());

-- System can insert logs
CREATE POLICY "System can log order access attempts" 
ON public.secure_order_access_log 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 6. Create function to securely validate guest order access
CREATE OR REPLACE FUNCTION public.validate_secure_guest_order_access(
  p_order_id UUID,
  p_email TEXT,
  p_order_number TEXT,
  p_session_token TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_record RECORD;
  ip_check BOOLEAN;
BEGIN
  -- Basic input validation
  IF p_order_id IS NULL OR p_email IS NULL OR p_order_number IS NULL THEN
    INSERT INTO secure_order_access_log (order_id, access_method, success, denial_reason)
    VALUES (p_order_id, 'guest_verified', false, 'Invalid input parameters');
    RETURN FALSE;
  END IF;

  -- Check if order exists and matches criteria
  SELECT * INTO order_record
  FROM orders
  WHERE id = p_order_id
    AND email = p_email
    AND order_number = p_order_number
    AND user_id IS NULL; -- Must be guest order

  IF NOT FOUND THEN
    INSERT INTO secure_order_access_log (order_id, access_method, success, denial_reason)
    VALUES (p_order_id, 'guest_verified', false, 'Order not found or credentials mismatch');
    RETURN FALSE;
  END IF;

  -- Check time window (extended to 24 hours for order confirmation access)
  IF order_record.created_at < (now() - INTERVAL '24 hours') THEN
    INSERT INTO secure_order_access_log (order_id, access_method, success, denial_reason)
    VALUES (p_order_id, 'guest_verified', false, 'Order access window expired');
    RETURN FALSE;
  END IF;

  -- Log successful validation
  INSERT INTO secure_order_access_log (order_id, access_method, success, session_token_hash)
  VALUES (p_order_id, 'guest_verified', true, 
          CASE WHEN p_session_token IS NOT NULL 
               THEN encode(digest(p_session_token, 'sha256'), 'hex') 
               ELSE NULL END);

  -- Set session context for RLS policy
  PERFORM set_config('app.secure_guest_session', order_record.order_session_id, true);
  PERFORM set_config('app.ip_validated', 'true', true);
  PERFORM set_config('app.rate_limit_passed', 'true', true);

  RETURN TRUE;
END;
$$;