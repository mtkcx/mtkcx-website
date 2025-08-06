-- Drop the check constraint that's blocking the import
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS check_size_variants;