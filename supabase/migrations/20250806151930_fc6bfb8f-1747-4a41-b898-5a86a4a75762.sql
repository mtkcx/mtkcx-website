-- Remove the old foreign key constraint and category_id column from products table
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE public.products DROP COLUMN IF EXISTS category_id;

-- Now remove all existing categories
DELETE FROM public.categories;

-- Insert new categories with proper slugs and display order
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('Alkaline Cleaner', 'alkaline-cleaner', 'Alkaline cleaning solutions for heavy duty cleaning', 1),
('Fragrances', 'fragrances', 'Car air fresheners and scent products', 2),
('Acid Cleaners & Rim Cleaners', 'acid-cleaners-rim-cleaners', 'Acid-based cleaners and specialized rim cleaning products', 3),
('Leather & Plastics Interior', 'leather-plastics-interior', 'Interior leather and plastic care products', 4),
('Solvents', 'solvents', 'Chemical solvents and cleaning solutions for various industrial and automotive applications', 5),
('Driers & Conservers', 'driers-conservers', 'Drying agents and preservation products', 6),
('Shampoos', 'shampoos', 'Car wash shampoos and cleaning foams', 7),
('Glass Cleaners & Water Processing', 'glass-cleaners-water-processing', 'Glass cleaning solutions and water treatment products', 8),
('Body & Paint', 'body-paint', 'Car body and paint care products', 9),
('Rubber & Plastics External', 'rubber-plastics-external', 'External rubber and plastic care products', 10),
('Sprayers', 'sprayers', 'Spray bottles and application tools', 11),
('Polishing & Coatings', 'polishing-coatings', 'Car polish, wax, and protective coating products', 12),
('Interior Cleaning', 'interior-cleaning', 'Interior car cleaning products and solutions', 13),
('Exterior Cleaning', 'exterior-cleaning', 'Exterior car wash and cleaning products', 14),
('Brushes & Tools', 'brushes-tools', 'Cleaning brushes and hand tools', 15),
('Tools & Equipments', 'tools-equipments', 'Professional detailing tools and equipment', 16),
('Microfiber & Towels', 'microfiber-towels', 'Microfiber cloths, towels and drying materials', 17),
('Sealants & Protection', 'sealants-protection', 'Paint sealants and protective products', 18),
('Foam Pads & Applicators', 'foam-pads-applicators', 'Foam pads, applicators and polishing accessories', 19);