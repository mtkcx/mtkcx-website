-- Add multilingual support to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS name_he TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_he TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_description_he TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_title_ar TEXT,
ADD COLUMN IF NOT EXISTS seo_title_he TEXT;

-- Add multilingual support to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS name_he TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS description_he TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ar TEXT,
ADD COLUMN IF NOT EXISTS meta_description_he TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Add some sample SEO data for Koch-Chemie products
UPDATE products SET 
  keywords = 'koch chemie, car detailing, automotive cleaning, professional car care, german car products, ' || LOWER(name),
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
    WHEN name ILIKE '%wax%' THEN 'منتجات الشمع'
    WHEN name ILIKE '%interior%' THEN 'منتجات الداخلية'
    ELSE 'منتجات العناية بالسيارات'
  END,
  name_he = CASE 
    WHEN name ILIKE '%clean%' THEN 'מוצרי ניקוי'
    WHEN name ILIKE '%polish%' THEN 'מוצרי הברקה'
    WHEN name ILIKE '%protect%' THEN 'מוצרי הגנה'
    WHEN name ILIKE '%wash%' THEN 'מוצרי שטיפה'
    WHEN name ILIKE '%wax%' THEN 'מוצרי שעווה'
    WHEN name ILIKE '%interior%' THEN 'מוצרים פנימיים'
    ELSE 'מוצרי טיפוח רכב'
  END
WHERE name_ar IS NULL;