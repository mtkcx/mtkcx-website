-- Create categories table for product organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Add missing columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_code TEXT,
ADD COLUMN IF NOT EXISTS safety_icons TEXT[],
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft'));

-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to product images
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images 
FOR SELECT 
USING (true);

-- Add foreign key constraint for product_variants to products
ALTER TABLE public.product_variants 
ADD CONSTRAINT fk_product_variants_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add size variants enum for better data consistency
ALTER TABLE public.product_variants 
ADD CONSTRAINT check_size_variants 
CHECK (size IN ('1L', '5L', '10L', '20L', '250ml', '500ml', '750ml'));

-- Create triggers for automatic timestamp updates (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Insert KochChemie product categories
INSERT INTO public.categories (name, description, slug, display_order) VALUES
('Alkaline Cleaners', 'Powerful alkaline cleaners for vehicle exteriors and engine bays', 'alkaline-cleaners', 1),
('Acidic Cleaners', 'Specialized acidic cleaners for removing mineral deposits and stubborn stains', 'acidic-cleaners', 2),
('Interior Cleaning', 'Complete interior care products for dashboards, seats, and surfaces', 'interior-cleaning', 3),
('Exterior Cleaning', 'Professional exterior cleaning solutions for paint and surfaces', 'exterior-cleaning', 4),
('Polishing Compounds', 'High-quality polishing compounds for paint correction', 'polishing-compounds', 5),
('Paint Sealants & Protection', 'Advanced protection systems for long-lasting shine', 'paint-sealants-protection', 6),
('Glass & Plastic Care', 'Specialized care for glass and plastic surfaces', 'glass-plastic-care', 7),
('Accessories', 'Professional tools and accessories for detailing', 'accessories', 8),
('Specialty Products', 'Specialized maintenance and professional solutions', 'specialty-products', 9),
('Disinfectants', 'Professional disinfectants for hygiene and cleanliness', 'disinfectants', 10);

-- Insert sample KochChemie products with professional descriptions
INSERT INTO public.products (name, description, category_id, product_code, image_url) 
SELECT 
  'Green Star (GS) – Alkaline Universal Cleaner',
  'A powerful, highly concentrated alkaline cleaner for vehicle exteriors and engine bays.

✅ Ideal for pre-cleaning and touchless washes
✅ Biodegradable and safe for all surfaces  
✅ Excellent dirt, oil, and insect removal
✅ Professional-grade concentration for maximum efficiency

Use for: self-serve bays, foam cannons, or professional detailing
Available in multiple sizes for different application needs.',
  c.id,
  'GS',
  'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=500&q=80'
FROM public.categories c WHERE c.slug = 'alkaline-cleaners';

INSERT INTO public.products (name, description, category_id, product_code, image_url)
SELECT 
  'F6.01 – Reactive Foam Cleaner',
  'An innovative reactive foam cleaner that changes color as it works to remove contamination.

✅ Color-changing formula indicates cleaning progress
✅ Safe on all exterior surfaces including paint and trim
✅ Removes traffic film, insects, and light contamination
✅ Easy application with foam lance or spray bottle

Use for: regular maintenance washing, pre-wash treatment, and professional detailing
Perfect for demonstrating cleaning effectiveness to customers.',
  c.id,
  'F6.01',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80'
FROM public.categories c WHERE c.slug = 'alkaline-cleaners';

INSERT INTO public.products (name, description, category_id, product_code, image_url)
SELECT 
  'Magic Foam – Interior Cleaner',
  'A versatile foam cleaner designed specifically for vehicle interiors and upholstery.

✅ Deep cleaning action for fabric and leather
✅ Removes stains, odors, and everyday soiling
✅ Safe on all interior materials including plastics
✅ Quick-drying formula with pleasant fragrance

Use for: seat cleaning, dashboard care, door panels, and carpet treatment
Essential for professional interior detailing services.',
  c.id,
  'MF',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80'
FROM public.categories c WHERE c.slug = 'interior-cleaning';

INSERT INTO public.products (name, description, category_id, product_code, image_url)
SELECT 
  'Pol Star – Heavy Cut Compound',
  'Professional-grade heavy cutting compound for serious paint defect removal.

✅ Removes deep scratches, oxidation, and severe swirl marks
✅ Works with rotary and dual-action polishers
✅ Excellent cut with minimal dusting
✅ Easy cleanup and removal

Use for: paint correction, scratch removal, and restoration work
Recommended for experienced detailers and body shops.',
  c.id,
  'PS',
  'https://images.unsplash.com/photo-1619641805924-4fa6aadb26e7?auto=format&fit=crop&w=500&q=80'
FROM public.categories c WHERE c.slug = 'polishing-compounds';

INSERT INTO public.products (name, description, category_id, product_code, image_url)
SELECT 
  '1K-Nano – Paint Sealant',
  'Advanced nanotechnology paint sealant providing long-lasting protection and gloss.

✅ Up to 12 months of durable protection
✅ Exceptional water beading and self-cleaning effect
✅ UV protection prevents paint oxidation
✅ Easy application by hand or machine

Use for: paint protection, gloss enhancement, and long-term maintenance
Perfect for customers seeking premium protection packages.',
  c.id,
  '1K-NANO',
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=500&q=80'
FROM public.categories c WHERE c.slug = 'paint-sealants-protection';

-- Insert product variants for each product (1L, 5L, 10L, 20L)
INSERT INTO public.product_variants (product_id, size, price, stock_quantity, sku)
SELECT 
  p.id,
  v.size,
  0, -- Price to be added later
  100, -- Default stock
  CONCAT(p.product_code, '-', v.size)
FROM public.products p
CROSS JOIN (VALUES ('1L'), ('5L'), ('10L'), ('20L')) AS v(size)
WHERE p.product_code IS NOT NULL;