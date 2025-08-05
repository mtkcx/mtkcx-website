-- First, let's add the missing categories from your catalog
INSERT INTO categories (name, description, slug, display_order) VALUES
('Tools & Equipment', 'Professional tools and equipment for detailing', 'tools-equipment', 11),
('Uncategorized', 'Products not yet categorized', 'uncategorized', 12)
ON CONFLICT (slug) DO NOTHING;

-- Insert all products from your catalog
INSERT INTO products (name, description, product_code, image_url, category_id, status) VALUES
-- 1K Nano Polymer
('1K Nano Polymer', 'This is the official KochChemie product description', '245001', 'https://kochchemie.com/assets/images/products/245001.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),

-- Fur Brooms and Brushes  
('Large Fur Broom 80X250mm', 'This is the official KochChemie product description', '999457', 'https://kochchemie.com/assets/images/products/999457.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),
('Small Fur Brush 60X400mm', 'This is the official KochChemie product description', '999458', 'https://kochchemie.com/assets/images/products/999458.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),

-- Adapters and Tools
('Adapter For Cork', 'This is the official KochChemie product description', '999175', 'https://kochchemie.com/assets/images/products/999175.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),

-- AF Product Line (Exterior Cleaners)
('AF - All Purpose Exterior Cleaner', 'This is the official KochChemie product description', '282010', 'https://kochchemie.com/assets/images/products/282010.jpg', (SELECT id FROM categories WHERE slug = 'exterior-cleaning'), 'active'),

-- AFO Product
('AFO - Exterior Cleaner Concentrate', 'This is the official KochChemie product description', '459021', 'https://kochchemie.com/assets/images/products/459021.jpg', (SELECT id FROM categories WHERE slug = 'exterior-cleaning'), 'active'),

-- AFS Product  
('AFS - Exterior Surface Cleaner', 'This is the official KochChemie product description', '320021', 'https://kochchemie.com/assets/images/products/320021.jpg', (SELECT id FROM categories WHERE slug = 'exterior-cleaning'), 'active'),

-- AFX Product
('AFX - Premium Exterior Cleaner', 'This is the official KochChemie product description', '293010', 'https://kochchemie.com/assets/images/products/293010.jpg', (SELECT id FROM categories WHERE slug = 'exterior-cleaning'), 'active'),

-- Alkali-resistant Spray
('Alkali-resistant Spray', 'This is the official KochChemie product description', '999462', 'https://kochchemie.com/assets/images/products/999462.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),

-- Allround Products
('Allround Quick Shine', 'This is the official KochChemie product description', '777085000', 'https://kochchemie.com/assets/images/products/777085000.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),
('Allrounder Brush 60X195mm', 'This is the official KochChemie product description', '999488', 'https://kochchemie.com/assets/images/products/999488.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),
('Allrounder Towel Green 5 Pack', 'This is the official KochChemie product description', '999829*', 'https://kochchemie.com/assets/images/products/999829.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),
('Aluminum Work Surface Stand', 'This is the official KochChemie product description', 'KTR13001-1', 'https://kochchemie.com/assets/images/products/KTR13001-1.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),
('Application Towel 10X10cm', 'This is the official KochChemie product description', '999620', 'https://kochchemie.com/assets/images/products/999620.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),

-- AS Product Line (Acidic Cleaners)
('AS - Acidic Surface Cleaner', 'This is the official KochChemie product description', '13010', 'https://kochchemie.com/assets/images/products/13010.jpg', (SELECT id FROM categories WHERE slug = 'acidic-cleaners'), 'active'),

-- ASC Product
('ASC - Acidic Special Cleaner', 'This is the official KochChemie product description', '367010', 'https://kochchemie.com/assets/images/products/367010.jpg', (SELECT id FROM categories WHERE slug = 'acidic-cleaners'), 'active'),

-- B9 Products (Polishing Compounds)
('B9.01 - Polishing Compound', 'This is the official KochChemie product description', '419001', 'https://kochchemie.com/assets/images/products/419001.jpg', (SELECT id FROM categories WHERE slug = 'polishing-compounds'), 'active'),

-- Interior Products
('Black Interior Brush For Engine', 'This is the official KochChemie product description', '999452', 'https://kochchemie.com/assets/images/products/999452.jpg', (SELECT id FROM categories WHERE slug = 'interior-cleaning'), 'active'),
('Bottle & Equipment Holder', 'This is the official KochChemie product description', '999822*', 'https://kochchemie.com/assets/images/products/999822.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),

-- Brushes and Tools
('Broomstick 140cm', 'This is the official KochChemie product description', '999459', 'https://kochchemie.com/assets/images/products/999459.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active'),
('Brush Cover', 'This is the official KochChemie product description', '999816*', 'https://kochchemie.com/assets/images/products/999816.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),
('Brush With A Large Rubber Handle', 'This is the official KochChemie product description', '999225', 'https://kochchemie.com/assets/images/products/999225.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),
('Brush With A Wide Rubber Handle', 'This is the official KochChemie product description', '999226', 'https://kochchemie.com/assets/images/products/999226.jpg', (SELECT id FROM categories WHERE slug = 'tools-equipment'), 'active'),

-- CB0.01 Ceramic Body
('CB0.01 Ceramic Body', 'This is the official KochChemie product description', '807001', 'https://kochchemie.com/assets/images/products/807001.jpg', (SELECT id FROM categories WHERE slug = 'uncategorized'), 'active');

-- Now let's add product variants for each product
-- 1K Nano Polymer (only one size from the data)
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '245001'), 'Standard', 472.0, '245001-STD');

-- Large Fur Broom 
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999457'), 'Standard', 472.0, '999457-STD');

-- Small Fur Brush
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999458'), 'Standard', 236.0, '999458-STD');

-- Adapter For Cork
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999175'), 'Standard', 14.16, '999175-STD');

-- AF Product (multiple sizes)
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '282010'), '10L', 354.0, '282010-10L'),
((SELECT id FROM products WHERE product_code = '282010'), '1L', 118.0, '282010-1L'),
((SELECT id FROM products WHERE product_code = '282010'), '20L', 472.0, '282010-20L');

-- AFO Product
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '459021'), '20L', 472.0, '459021-20L');

-- AFS Product  
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '320021'), '20L', 472.0, '320021-20L');

-- AFX Product
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '293010'), '10L', 472.0, '293010-10L');

-- Alkali-resistant Spray
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999462'), '6L', 531.0, '999462-6L');

-- Allround Quick Shine
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '777085000'), '500ml', 94.4, '777085000-500ML');

-- Allrounder Brush
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999488'), 'Standard', 88.5, '999488-STD');

-- Allrounder Towel Green 5 Pack
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999829*'), 'Standard', 88.5, '999829-STD');

-- Aluminum Work Surface Stand
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = 'KTR13001-1'), 'Standard', 708.0, 'KTR13001-1-STD');

-- Application Towel
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999620'), 'Standard', 10.62, '999620-STD');

-- AS Product (multiple sizes)
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '13010'), '10L', 177.0, '13010-10L'),
((SELECT id FROM products WHERE product_code = '13010'), '1L', 82.6, '13010-1L'),
((SELECT id FROM products WHERE product_code = '13010'), '20L', 354.0, '13010-20L');

-- ASC Product (multiple sizes)  
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '367010'), '10L', 295.0, '367010-10L'),
((SELECT id FROM products WHERE product_code = '367010'), '500ml', 70.8, '367010-500ML');

-- B9.01 Products (multiple sizes)
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '419001'), '1L', 236.0, '419001-1L'),
((SELECT id FROM products WHERE product_code = '419001'), '250ml', 76.7, '419001-250ML');

-- Black Interior Brush
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999452'), 'Standard', 53.1, '999452-STD');

-- Bottle & Equipment Holder
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999822*'), 'Standard', 413.0, '999822-STD');

-- Broomstick 140cm
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999459'), 'Standard', 118.0, '999459-STD');

-- Brush Cover
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999816*'), 'Standard', 118.0, '999816-STD');

-- Brush With A Large Rubber Handle
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999225'), 'Standard', 59.0, '999225-STD');

-- Brush With A Wide Rubber Handle
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '999226'), 'Standard', 82.6, '999226-STD');

-- CB0.01 Ceramic Body
INSERT INTO product_variants (product_id, size, price, sku) VALUES
((SELECT id FROM products WHERE product_code = '807001'), 'Standard', 413.0, '807001-STD');

-- Add primary images for all products
INSERT INTO product_images (product_id, image_url, is_primary, alt_text) 
SELECT 
  p.id,
  p.image_url,
  true,
  p.name || ' - Official KochChemie Product Image'
FROM products p 
WHERE p.image_url IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM product_images pi 
  WHERE pi.product_id = p.id AND pi.is_primary = true
);