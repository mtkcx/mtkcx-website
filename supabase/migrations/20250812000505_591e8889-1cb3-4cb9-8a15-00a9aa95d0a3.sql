-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to view order items for their own orders
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

-- Create an index for better performance on user order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at 
ON public.orders (user_id, created_at DESC);

-- Create an index for order items performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON public.order_items (order_id);