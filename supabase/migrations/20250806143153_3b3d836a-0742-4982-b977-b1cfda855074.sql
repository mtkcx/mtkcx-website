-- Create a default category for imported products
INSERT INTO public.categories (name, description, slug, display_order)
VALUES ('Imported Products', 'Products imported via bulk import', 'imported-products', 999)
ON CONFLICT (slug) DO NOTHING;