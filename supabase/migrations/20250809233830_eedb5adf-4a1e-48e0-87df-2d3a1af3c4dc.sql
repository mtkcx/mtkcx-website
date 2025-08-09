-- CRITICAL SECURITY FIX: Remove guest order access vulnerability (Fixed)
-- This fixes the issue where anonymous users could steal customer data with session IDs

-- 1. Remove ALL existing vulnerable guest access policies
DROP POLICY IF EXISTS "Guest users can view orders with valid session" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON public.order_items;

-- 2. Create secure authenticated-only order access
CREATE POLICY "Authenticated users can only view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Create HIGHLY restrictive guest access (only for immediate post-checkout)
CREATE POLICY "Ultra secure guest order verification" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  -- Guest orders only
  user_id IS NULL AND
  order_session_id IS NOT NULL AND
  -- Must be very recent (30 minutes max)
  created_at > (now() - INTERVAL '30 minutes') AND
  -- Session context must be validated via secure function
  current_setting('app.validated_guest_order_id', true)::uuid = id
);

-- 4. Secure order items access
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

CREATE POLICY "Ultra secure guest order items" 
ON public.order_items 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id IS NULL
    AND orders.created_at > (now() - INTERVAL '30 minutes')
    AND current_setting('app.validated_guest_order_id', true)::uuid = orders.id
  )
);

-- 5. Create secure order access validation function
CREATE OR REPLACE FUNCTION public.validate_guest_order_access(
  p_order_number TEXT,
  p_email TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_id UUID;
  order_record RECORD;
BEGIN
  -- Input validation
  IF p_order_number IS NULL OR p_email IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find order with strict criteria
  SELECT id, created_at INTO order_record
  FROM orders
  WHERE order_number = p_order_number
    AND email = p_email
    AND user_id IS NULL  -- Guest orders only
    AND created_at > (now() - INTERVAL '30 minutes'); -- Very recent only

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Set the validated order ID in session context
  PERFORM set_config('app.validated_guest_order_id', order_record.id::text, true);
  
  RETURN order_record.id;
END;
$$;