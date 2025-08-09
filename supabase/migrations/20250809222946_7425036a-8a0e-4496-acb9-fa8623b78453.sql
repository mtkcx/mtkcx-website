-- Fix Critical Order Security Vulnerabilities
-- Address: Customer Order Information Could Be Accessed

-- 1. Remove overly permissive order policies
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders and admins can update all" ON public.orders;

-- 2. Add order_type validation constraint
ALTER TABLE public.orders 
ADD CONSTRAINT valid_order_type 
CHECK (order_type IN ('product', 'service', 'enrollment'));

-- 3. Add order_session_id for guest order security
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_session_id TEXT;

-- 4. Create secure policies with proper separation of authenticated vs guest orders

-- Policy for authenticated users to view their own orders
CREATE POLICY "Authenticated users can view their orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR 
  is_admin()
);

-- Policy for guest users to view their orders with session validation
CREATE POLICY "Guest users can view orders with valid session" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  user_id IS NULL AND
  order_session_id IS NOT NULL AND
  order_session_id = current_setting('app.order_session_id', true) AND
  created_at > (now() - INTERVAL '24 hours') -- Expire guest access after 24h
);

-- Policy for authenticated users to update their orders (limited fields)
CREATE POLICY "Authenticated users can update their orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR is_admin())
WITH CHECK (auth.uid() = user_id OR is_admin());

-- Policy for service role to create orders with proper context
CREATE POLICY "Secure order creation via edge function" 
ON public.orders 
FOR INSERT
TO service_role
WITH CHECK (
  -- Only allow if called through secure order creation endpoint
  current_setting('app.order_context', true) = 'secure_order_creation' AND
  -- Validate required fields
  email IS NOT NULL AND
  customer_name IS NOT NULL AND
  amount > 0 AND
  currency IS NOT NULL AND
  order_type IS NOT NULL AND
  payment_gateway IS NOT NULL
);

-- Policy for admins to manage all orders
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 5. Secure order items access
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

-- 6. Create function to generate secure order session ID
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

-- 7. Create function to validate order access
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

-- 8. Add audit logging for order access
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