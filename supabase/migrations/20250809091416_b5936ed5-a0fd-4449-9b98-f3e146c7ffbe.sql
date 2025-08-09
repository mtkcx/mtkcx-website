-- Create table for product upsells/related products
CREATE TABLE public.product_upsells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, upsell_product_id)
);

-- Enable RLS
ALTER TABLE public.product_upsells ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Product upsells are viewable by everyone" 
ON public.product_upsells 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage product upsells" 
ON public.product_upsells 
FOR ALL
USING (is_admin());

-- Create index for better performance
CREATE INDEX idx_product_upsells_product_id ON public.product_upsells(product_id);
CREATE INDEX idx_product_upsells_display_order ON public.product_upsells(display_order);