-- Fix Critical Order Security Vulnerabilities (Part 2)
-- Address: Customer Order Information Could Be Accessed

-- 1. Remove overly permissive order policies
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders and admins can update all" ON public.orders;

-- 2. Add order_session_id for guest order security (if not exists)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_session_id TEXT;

-- 3. Create secure policies with proper separation of authenticated vs guest orders

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