-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Update RLS policies for admin access to product management
CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage product variants" 
ON public.product_variants 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage product images" 
ON public.product_images 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.uid() IS NOT NULL);