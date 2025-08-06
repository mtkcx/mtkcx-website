-- Create proper product categories based on the product types
INSERT INTO public.categories (name, description, slug, display_order) VALUES
('Car Care Chemicals', 'Professional car cleaning and detailing chemicals', 'car-care-chemicals', 1),
('Polishing & Waxes', 'Polishing compounds, waxes and surface protection products', 'polishing-waxes', 2),
('Glass Care', 'Glass cleaners and windshield care products', 'glass-care', 3),
('Rim & Wheel Care', 'Specialized rim and wheel cleaning products', 'rim-wheel-care', 4),
('Engine & Interior', 'Engine bay cleaners and interior care products', 'engine-interior', 5),
('Foam Pads & Applicators', 'Polishing pads, foam pads and application tools', 'foam-pads-applicators', 6),
('Brushes & Tools', 'Cleaning brushes and detailing tools', 'brushes-tools', 7),
('Microfiber & Towels', 'Microfiber cloths, towels and drying materials', 'microfiber-towels', 8),
('Equipment & Sprayers', 'Pressure washers, sprayers and professional equipment', 'equipment-sprayers', 9),
('Workstation & Storage', 'Professional workstations and storage solutions', 'workstation-storage', 10),
('Specialty Products', 'Ceramic coatings, nano products and specialty items', 'specialty-products', 11)
ON CONFLICT (slug) DO NOTHING;