-- Add is_primary field to product_variants table
ALTER TABLE public.product_variants 
ADD COLUMN is_primary boolean DEFAULT false;

-- Add constraint to ensure only one primary variant per product
CREATE UNIQUE INDEX idx_product_variants_primary_unique 
ON public.product_variants (product_id) 
WHERE is_primary = true;

-- Update existing 1L variants to be primary (as an example)
UPDATE public.product_variants 
SET is_primary = true 
WHERE size = '1L' OR size = '1l' OR size = '1 L';

-- If no 1L variant exists, make the first variant primary for each product
WITH first_variants AS (
  SELECT DISTINCT ON (product_id) id, product_id 
  FROM public.product_variants 
  WHERE product_id NOT IN (
    SELECT product_id 
    FROM public.product_variants 
    WHERE is_primary = true
  )
  ORDER BY product_id, created_at
)
UPDATE public.product_variants 
SET is_primary = true 
WHERE id IN (SELECT id FROM first_variants);