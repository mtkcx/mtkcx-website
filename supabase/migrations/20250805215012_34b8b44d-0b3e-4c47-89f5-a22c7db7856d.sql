-- First, drop the restrictive size constraint
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS check_size_variants;

-- Add a more flexible constraint that allows standard sizes plus common variations
ALTER TABLE product_variants ADD CONSTRAINT check_size_variants 
CHECK (size = ANY (ARRAY[
  '1L', '5L', '10L', '20L', '25L', '50L',
  '250ml', '500ml', '750ml', '1000ml',
  '6L', '2L', '3L', '4L', '15L', '30L',
  'Standard', 'Small', 'Medium', 'Large', 'XL',
  'Set', 'Pack', 'Kit', 'Unit', 'Piece'
]));

-- Now add the missing categories
INSERT INTO categories (name, description, slug, display_order) VALUES
('Tools & Equipment', 'Professional tools and equipment for detailing', 'tools-equipment', 11),
('Uncategorized', 'Products not yet categorized', 'uncategorized', 12)
ON CONFLICT (slug) DO NOTHING;

-- Clear any existing test products to avoid conflicts
DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE product_code IN (
    '245001', '999457', '999458', '999175', '282010', '459021', '320021', '293010',
    '999462', '777085000', '999488', '999829*', 'KTR13001-1', '999620', '13010', 
    '367010', '419001', '999452', '999822*', '999459', '999816*', '999225', '999226', '807001'
  )
);
DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE product_code IN (
    '245001', '999457', '999458', '999175', '282010', '459021', '320021', '293010',
    '999462', '777085000', '999488', '999829*', 'KTR13001-1', '999620', '13010', 
    '367010', '419001', '999452', '999822*', '999459', '999816*', '999225', '999226', '807001'
  )
);
DELETE FROM products WHERE product_code IN (
  '245001', '999457', '999458', '999175', '282010', '459021', '320021', '293010',
  '999462', '777085000', '999488', '999829*', 'KTR13001-1', '999620', '13010', 
  '367010', '419001', '999452', '999822*', '999459', '999816*', '999225', '999226', '807001'
);

-- Insert all products from your catalog
INSERT INTO products (name, description, product_code, image_url, category_id, status) VALUES
-- 1K Nano Polymer
('1K Nano Polymer', 'Professional ceramic coating with advanced nanotechnology for long-lasting protection and shine.', '245001', 'https://kochchemie.com/assets/images/products/245001.jpg', (SELECT id FROM categories WHERE slug = 'paint-sealants-protection'), 'active'),

-- Fur Brooms and Brushes  
('Large Fur Broom 80X250mm', 'Professional large fur broom for effective cleaning and debris removal.', '999457', 'https://kochchemie.com/assets/images/products/999457.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Small Fur Brush 60X400mm', 'Compact fur brush perfect for detailed cleaning in tight spaces.', '999458', 'https://kochchemie.com/assets/images/products/999458.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),

-- Adapters and Tools
('Adapter For Cork', 'Essential adapter accessory for cork-based cleaning tools.', '999175', 'https://kochchemie.com/assets/images/products/999175.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),

-- AF Product Line (Exterior Cleaners)
('AF - All Purpose Exterior Cleaner', 'Versatile alkaline cleaner for all exterior surfaces, providing excellent cleaning power.', '282010', 'https://kochchemie.com/assets/images/products/282010.jpg', (SELECT id FROM categories WHERE slug = 'alkaline-cleaners'), 'active'),

-- AFO Product
('AFO - Exterior Cleaner Concentrate', 'Concentrated alkaline cleaner for professional exterior cleaning applications.', '459021', 'https://kochchemie.com/assets/images/products/459021.jpg', (SELECT id FROM categories WHERE slug = 'alkaline-cleaners'), 'active'),

-- AFS Product  
('AFS - Exterior Surface Cleaner', 'Specialized alkaline surface cleaner for stubborn dirt and grime removal.', '320021', 'https://kochchemie.com/assets/images/products/320021.jpg', (SELECT id FROM categories WHERE slug = 'alkaline-cleaners'), 'active'),

-- AFX Product
('AFX - Premium Exterior Cleaner', 'Premium alkaline cleaner for the most demanding exterior cleaning tasks.', '293010', 'https://kochchemie.com/assets/images/products/293010.jpg', (SELECT id FROM categories WHERE slug = 'alkaline-cleaners'), 'active'),

-- Alkali-resistant Spray
('Alkali-resistant Spray', 'Protective spray resistant to alkaline chemicals for equipment protection.', '999462', 'https://kochchemie.com/assets/images/products/999462.jpg', (SELECT id FROM categories WHERE slug = 'specialty-products'), 'active'),

-- Allround Products
('Allround Quick Shine', 'Fast-acting polish for quick shine enhancement on all surfaces.', '777085000', 'https://kochchemie.com/assets/images/products/777085000.jpg', (SELECT id FROM categories WHERE slug = 'exterior-cleaning'), 'active'),
('Allrounder Brush 60X195mm', 'Versatile cleaning brush suitable for multiple detailing applications.', '999488', 'https://kochchemie.com/assets/images/products/999488.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Allrounder Towel Green 5 Pack', 'Set of 5 high-quality microfiber towels for general cleaning purposes.', '999829*', 'https://kochchemie.com/assets/images/products/999829.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Aluminum Work Surface Stand', 'Durable aluminum stand for organizing work surfaces and equipment.', 'KTR13001-1', 'https://kochchemie.com/assets/images/products/KTR13001-1.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Application Towel 10X10cm', 'Small precision towels for product application and detail work.', '999620', 'https://kochchemie.com/assets/images/products/999620.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),

-- AS Product Line (Acidic Cleaners)
('AS - Acidic Surface Cleaner', 'Professional acidic cleaner for removing mineral deposits and stubborn stains.', '13010', 'https://kochchemie.com/assets/images/products/13010.jpg', (SELECT id FROM categories WHERE slug = 'acidic-cleaners'), 'active'),

-- ASC Product
('ASC - Acidic Special Cleaner', 'Specialized acidic cleaner for tough contamination and mineral buildup.', '367010', 'https://kochchemie.com/assets/images/products/367010.jpg', (SELECT id FROM categories WHERE slug = 'acidic-cleaners'), 'active'),

-- B9 Products (Polishing Compounds)
('B9.01 - Polishing Compound', 'Professional polishing compound for paint correction and restoration.', '419001', 'https://kochchemie.com/assets/images/products/419001.jpg', (SELECT id FROM categories WHERE slug = 'polishing-compounds'), 'active'),

-- Interior Products
('Black Interior Brush For Engine', 'Specialized brush for cleaning engine compartments and interior surfaces.', '999452', 'https://kochchemie.com/assets/images/products/999452.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Bottle & Equipment Holder', 'Convenient holder for organizing bottles and cleaning equipment.', '999822*', 'https://kochchemie.com/assets/images/products/999822.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),

-- Brushes and Tools
('Broomstick 140cm', 'Long-handle broomstick for extended reach cleaning applications.', '999459', 'https://kochchemie.com/assets/images/products/999459.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Brush Cover', 'Protective cover for brush heads to maintain hygiene and extend lifespan.', '999816*', 'https://kochchemie.com/assets/images/products/999816.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Brush With A Large Rubber Handle', 'Ergonomic brush with large rubber handle for comfortable extended use.', '999225', 'https://kochchemie.com/assets/images/products/999225.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),
('Brush With A Wide Rubber Handle', 'Wide-handled brush for better grip and control during cleaning.', '999226', 'https://kochchemie.com/assets/images/products/999226.jpg', (SELECT id FROM categories WHERE slug = 'accessories'), 'active'),

-- CB0.01 Ceramic Body
('CB0.01 Ceramic Body', 'Advanced ceramic body protection for long-lasting vehicle surface care.', '807001', 'https://kochchemie.com/assets/images/products/807001.jpg', (SELECT id FROM categories WHERE slug = 'paint-sealants-protection'), 'active');

-- Add product variants with proper sizing
INSERT INTO product_variants (product_id, size, price, sku) VALUES
-- 1K Nano Polymer
((SELECT id FROM products WHERE product_code = '245001'), 'Standard', 472.0, '245001-STD'),

-- Large Fur Broom 
((SELECT id FROM products WHERE product_code = '999457'), 'Standard', 472.0, '999457-STD'),

-- Small Fur Brush
((SELECT id FROM products WHERE product_code = '999458'), 'Standard', 236.0, '999458-STD'),

-- Adapter For Cork
((SELECT id FROM products WHERE product_code = '999175'), 'Standard', 14.16, '999175-STD'),

-- AF Product (multiple sizes)
((SELECT id FROM products WHERE product_code = '282010'), '10L', 354.0, '282010-10L'),
((SELECT id FROM products WHERE product_code = '282010'), '1L', 118.0, '282010-1L'),
((SELECT id FROM products WHERE product_code = '282010'), '20L', 472.0, '282010-20L'),

-- AFO Product
((SELECT id FROM products WHERE product_code = '459021'), '20L', 472.0, '459021-20L'),

-- AFS Product  
((SELECT id FROM products WHERE product_code = '320021'), '20L', 472.0, '320021-20L'),

-- AFX Product
((SELECT id FROM products WHERE product_code = '293010'), '10L', 472.0, '293010-10L'),

-- Alkali-resistant Spray
((SELECT id FROM products WHERE product_code = '999462'), '6L', 531.0, '999462-6L'),

-- Allround Quick Shine
((SELECT id FROM products WHERE product_code = '777085000'), '500ml', 94.4, '777085000-500ML'),

-- Allrounder Brush
((SELECT id FROM products WHERE product_code = '999488'), 'Standard', 88.5, '999488-STD'),

-- Allrounder Towel Green 5 Pack
((SELECT id FROM products WHERE product_code = '999829*'), 'Pack', 88.5, '999829-PACK'),

-- Aluminum Work Surface Stand
((SELECT id FROM products WHERE product_code = 'KTR13001-1'), 'Standard', 708.0, 'KTR13001-1-STD'),

-- Application Towel
((SELECT id FROM products WHERE product_code = '999620'), 'Pack', 10.62, '999620-PACK'),

-- AS Product (multiple sizes)
((SELECT id FROM products WHERE product_code = '13010'), '10L', 177.0, '13010-10L'),
((SELECT id FROM products WHERE product_code = '13010'), '1L', 82.6, '13010-1L'),
((SELECT id FROM products WHERE product_code = '13010'), '20L', 354.0, '13010-20L'),

-- ASC Product (multiple sizes)  
((SELECT id FROM products WHERE product_code = '367010'), '10L', 295.0, '367010-10L'),
((SELECT id FROM products WHERE product_code = '367010'), '500ml', 70.8, '367010-500ML'),

-- B9.01 Products (multiple sizes)
((SELECT id FROM products WHERE product_code = '419001'), '1L', 236.0, '419001-1L'),
((SELECT id FROM products WHERE product_code = '419001'), '250ml', 76.7, '419001-250ML'),

-- Black Interior Brush
((SELECT id FROM products WHERE product_code = '999452'), 'Standard', 53.1, '999452-STD'),

-- Bottle & Equipment Holder
((SELECT id FROM products WHERE product_code = '999822*'), 'Standard', 413.0, '999822-STD'),

-- Broomstick 140cm
((SELECT id FROM products WHERE product_code = '999459'), 'Standard', 118.0, '999459-STD'),

-- Brush Cover
((SELECT id FROM products WHERE product_code = '999816*'), 'Standard', 118.0, '999816-STD'),

-- Brush With A Large Rubber Handle
((SELECT id FROM products WHERE product_code = '999225'), 'Standard', 59.0, '999225-STD'),

-- Brush With A Wide Rubber Handle
((SELECT id FROM products WHERE product_code = '999226'), 'Standard', 82.6, '999226-STD'),

-- CB0.01 Ceramic Body
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
AND p.product_code IN (
  '245001', '999457', '999458', '999175', '282010', '459021', '320021', '293010',
  '999462', '777085000', '999488', '999829*', 'KTR13001-1', '999620', '13010', 
  '367010', '419001', '999452', '999822*', '999459', '999816*', '999225', '999226', '807001'
);