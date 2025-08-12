-- Create mobile_orders table for mobile app orders
CREATE TABLE public.mobile_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_city TEXT,
  shipping_address TEXT,
  shipping_location TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
  order_notes TEXT,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_items JSONB NOT NULL,
  order_source TEXT NOT NULL DEFAULT 'mobile_app',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mobile_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile orders
CREATE POLICY "Only admins can view mobile orders" 
ON public.mobile_orders 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Only admins can manage mobile orders" 
ON public.mobile_orders 
FOR ALL 
USING (is_admin());

-- Allow service role to insert mobile orders
CREATE POLICY "Service role can insert mobile orders" 
ON public.mobile_orders 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mobile_orders_updated_at
BEFORE UPDATE ON public.mobile_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();