-- Create orders table to track all payments (products and services)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL DEFAULT CONCAT('ORD-', EXTRACT(EPOCH FROM now())::TEXT),
  
  -- Payment details
  payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('stripe', 'paypal')),
  payment_session_id TEXT,
  payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  
  -- Order details
  order_type TEXT NOT NULL CHECK (order_type IN ('product', 'service')),
  items JSONB NOT NULL, -- Store order items as JSON
  
  -- Customer details (for guest checkout)
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_country TEXT DEFAULT 'Israel',
  
  -- Service-specific fields
  service_type TEXT, -- 'wrapping', 'ppf', 'training', 'detailing'
  service_description TEXT,
  preferred_date TIMESTAMP,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table for detailed product orders
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,
  variant_size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    (user_id IS NULL AND email = auth.email())
  );

CREATE POLICY "Allow order creation" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow order updates" ON public.orders
  FOR UPDATE USING (true);

-- RLS Policies for order_items  
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND ((orders.user_id IS NOT NULL AND auth.uid() = orders.user_id) OR 
           (orders.user_id IS NULL AND orders.email = auth.email()))
    )
  );

CREATE POLICY "Allow order item creation" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_session_id ON public.orders(payment_session_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();