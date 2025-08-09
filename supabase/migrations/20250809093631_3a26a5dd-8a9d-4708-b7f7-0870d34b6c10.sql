-- Check if product-images bucket exists and ensure it's public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create RLS policies for product images storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Allow public viewing of product images
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- Allow admins to update product images
CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND is_admin());