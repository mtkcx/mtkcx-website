-- CRITICAL SECURITY FIX: Remove guest order access vulnerability (Fixed Version)
-- This fixes the issue where anonymous users could steal customer data with session IDs

-- 1. Remove ALL existing vulnerable policies
DROP POLICY IF EXISTS "Guest users can view orders with valid session" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view their order items" ON public.order_items;

-- 2. Create NEW secure authenticated-only order access
CREATE POLICY "Secure authenticated order access" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Create secure guest order verification with multiple security layers
CREATE POLICY "Ultra secure guest order verification" 
ON public.orders 
FOR SELECT 
TO anon
USING (
  user_id IS NULL AND
  order_session_id IS NOT NULL AND
  -- Must be validated via secure function first
  current_setting('app.secure_guest_session', true) = order_session_id AND
  -- Strict 30-minute window for new orders
  created_at > (now() - INTERVAL '30 minutes') AND
  current_setting('app.ip_validated', true) = 'true' AND
  current_setting('app.rate_limit_passed', true) = 'true'
);

-- 4. Secure order items access
CREATE POLICY "Secure authenticated order items access" 
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

CREATE POLICY "Ultra secure guest order items access" 
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

-- 5. Create secure access logging (if not exists)
CREATE TABLE IF NOT EXISTS public.secure_order_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  access_method TEXT NOT NULL,
  ip_address INET DEFAULT inet_client_addr(),
  user_agent TEXT,
  session_token_hash TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  denial_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on logging table
ALTER TABLE public.secure_order_access_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on logging table if they exist
DROP POLICY IF EXISTS "Only admins can view order access logs" ON public.secure_order_access_log;
DROP POLICY IF EXISTS "System can log order access attempts" ON public.secure_order_access_log;

-- Create new logging policies
CREATE POLICY "Admins only view access logs" 
ON public.secure_order_access_log 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "System logs access attempts" 
ON public.secure_order_access_log 
FOR INSERT 
WITH CHECK (true);