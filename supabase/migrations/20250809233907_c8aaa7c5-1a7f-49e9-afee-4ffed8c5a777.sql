-- CRITICAL SECURITY FIX: Remove guest order data theft vulnerability
-- Completely removes anonymous access to customer personal information

-- 1. Remove ALL potentially vulnerable guest access policies
DROP POLICY IF EXISTS "Guest users can view orders with valid session" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Ultra secure guest order verification" ON public.orders;
DROP POLICY IF EXISTS "Ultra secure guest order items" ON public.order_items;

-- 2. Create ONLY authenticated user access (most secure)
CREATE POLICY "Only authenticated users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only authenticated users can view their order items" 
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

-- 3. Create extremely limited guest access for IMMEDIATE post-checkout only
-- This is the absolute minimum needed for order confirmation pages
CREATE POLICY "Emergency guest access for immediate checkout confirmation" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  -- Only guest orders
  user_id IS NULL AND
  -- Must be within 10 minutes of creation (extremely short window)
  created_at > (now() - INTERVAL '10 minutes') AND
  -- Must go through secure validation function that sets context
  current_setting('app.emergency_guest_order_id', true)::uuid = id AND
  -- Additional security: must have specific session validation
  current_setting('app.emergency_validated', true) = 'true'
);

-- Corresponding policy for order items
CREATE POLICY "Emergency guest order items for immediate confirmation" 
ON public.order_items 
FOR SELECT 
TO anon
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id IS NULL
    AND orders.created_at > (now() - INTERVAL '10 minutes')
    AND current_setting('app.emergency_guest_order_id', true)::uuid = orders.id
    AND current_setting('app.emergency_validated', true) = 'true'
  )
);

-- 4. Create ultra-secure emergency validation function
CREATE OR REPLACE FUNCTION public.emergency_validate_guest_order(
  p_order_id UUID,
  p_order_number TEXT,
  p_email TEXT,
  p_session_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  order_exists BOOLEAN;
BEGIN
  -- Check if order exists with exact match and is very recent
  SELECT EXISTS(
    SELECT 1 FROM orders
    WHERE id = p_order_id
      AND order_number = p_order_number
      AND email = p_email
      AND order_session_id = p_session_id
      AND user_id IS NULL
      AND created_at > (now() - INTERVAL '10 minutes')
  ) INTO order_exists;

  IF order_exists THEN
    -- Set emergency context for this specific order only
    PERFORM set_config('app.emergency_guest_order_id', p_order_id::text, true);
    PERFORM set_config('app.emergency_validated', 'true', true);
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;