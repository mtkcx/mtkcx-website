-- Enable RLS on products table but allow public read access
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products (for browsing)
CREATE POLICY "Public can read products" 
ON public.products 
FOR SELECT 
USING (true);

-- Only authenticated users can manage products
CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on product_variants table but allow public read access
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read product variants (for pricing/options)
CREATE POLICY "Public can read product variants" 
ON public.product_variants 
FOR SELECT 
USING (true);

-- Only authenticated users can manage product variants
CREATE POLICY "Authenticated users can manage product variants" 
ON public.product_variants 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');