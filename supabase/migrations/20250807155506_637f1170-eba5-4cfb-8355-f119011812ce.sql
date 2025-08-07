-- Add multilingual support to products table
ALTER TABLE products 
ADD COLUMN name_ar TEXT,
ADD COLUMN name_he TEXT,
ADD COLUMN description_ar TEXT,
ADD COLUMN description_he TEXT,
ADD COLUMN keywords TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN meta_description_ar TEXT,
ADD COLUMN meta_description_he TEXT,
ADD COLUMN seo_title TEXT,
ADD COLUMN seo_title_ar TEXT,
ADD COLUMN seo_title_he TEXT;

-- Add multilingual support to categories table
ALTER TABLE categories 
ADD COLUMN name_ar TEXT,
ADD COLUMN name_he TEXT,
ADD COLUMN description_ar TEXT,
ADD COLUMN description_he TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN meta_description_ar TEXT,
ADD COLUMN meta_description_he TEXT;

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_keywords_trgm ON products USING gin(keywords gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Add full-text search capabilities
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.keywords, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.product_code, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_search_vector();

-- Create index on search vector
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);

-- Update existing products search vectors
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(keywords, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(product_code, '')), 'A');

-- Add some sample SEO data for Koch-Chemie products
UPDATE products SET 
  keywords = 'koch chemie, car detailing, automotive cleaning, professional car care, german car products',
  meta_description = 'Professional Koch-Chemie ' || name || ' for automotive detailing and car care. German engineering quality for professional results.',
  seo_title = name || ' - Koch-Chemie Professional Car Care | MT Wraps'
WHERE keywords IS NULL;

-- Add Arabic translations for categories (basic examples)
UPDATE categories SET 
  name_ar = CASE 
    WHEN name ILIKE '%clean%' THEN 'منتجات التنظيف'
    WHEN name ILIKE '%polish%' THEN 'منتجات التلميع'
    WHEN name ILIKE '%protect%' THEN 'منتجات الحماية'
    WHEN name ILIKE '%wash%' THEN 'منتجات الغسيل'
    ELSE 'منتجات العناية بالسيارات'
  END,
  name_he = CASE 
    WHEN name ILIKE '%clean%' THEN 'מוצרי ניקוי'
    WHEN name ILIKE '%polish%' THEN 'מוצרי הברקה'
    WHEN name ILIKE '%protect%' THEN 'מוצרי הגנה'
    WHEN name ILIKE '%wash%' THEN 'מוצרי שטיפה'
    ELSE 'מוצרי טיפוח רכב'
  END;