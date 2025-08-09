-- Fix Critical Order Security Vulnerabilities (Part 3)
-- Continue with remaining security enhancements

-- 1. Add order_session_id for guest order security (if not exists)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_session_id TEXT;

-- 2. Secure order items access
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow order item creation" ON public.order_items;

-- Policy for viewing order items (linked to order access)
CREATE POLICY "Users can view order items for accessible orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (
      -- Authenticated user owns the order
      (auth.role() = 'authenticated' AND auth.uid() = orders.user_id) OR
      -- Guest user with valid session
      (auth.role() = 'anon' AND orders.user_id IS NULL AND 
       orders.order_session_id = current_setting('app.order_session_id', true) AND
       orders.created_at > (now() - INTERVAL '24 hours')) OR
      -- Admin access
      (auth.role() = 'authenticated' AND is_admin())
    )
  )
);

-- Policy for creating order items via secure endpoint
CREATE POLICY "Secure order item creation" 
ON public.order_items 
FOR INSERT
TO service_role
WITH CHECK (
  current_setting('app.order_context', true) = 'secure_order_creation' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id
  )
);

-- Policy for admins to manage order items
CREATE POLICY "Admins can manage order items" 
ON public.order_items 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Create function to generate secure order session ID
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

-- 4. Create function to validate order access
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

-- 5. Add audit logging for order access
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