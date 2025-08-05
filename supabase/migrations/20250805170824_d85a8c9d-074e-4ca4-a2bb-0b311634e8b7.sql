-- Create products table for main product information
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variants table for different sizes and prices
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (products are public)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Product variants are viewable by everyone" 
ON public.product_variants 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_price ON public.product_variants(price);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products and variants based on the uploaded data
INSERT INTO public.products (name, description, category) VALUES
('Pfe', 'Koch-Chemie Pfe Product', 'Car Care'),
('Vb', 'Koch-Chemie Vb Product', 'Car Care'),
('Gs', 'Koch-Chemie Gs Product', 'Car Care'),
('Pe', 'Koch-Chemie Pe Product', 'Car Care'),
('Rs', 'Koch-Chemie Rs Product', 'Car Care'),
('As', 'Koch-Chemie As Product', 'Car Care'),
('Gsf', 'Koch-Chemie Gsf Product', 'Car Care'),
('Nms', 'Koch-Chemie Nms Product', 'Car Care'),
('Af', 'Koch-Chemie Af Product', 'Car Care'),
('Afs', 'Koch-Chemie Afs Product', 'Car Care'),
('Afo', 'Koch-Chemie Afo Product', 'Car Care'),
('Afx', 'Koch-Chemie Afx Product', 'Car Care'),
('Sf', 'Koch-Chemie Sf Product', 'Car Care'),
('Sff', 'Koch-Chemie Sff Product', 'Car Care'),
('Sfn', 'Koch-Chemie Sfn Product', 'Car Care'),
('Sgw', 'Koch-Chemie Sgw Product', 'Car Care'),
('Hgt', 'Koch-Chemie Hgt Product', 'Car Care'),
('Pw', 'Koch-Chemie Pw Product', 'Car Care'),
('Hd', 'Koch-Chemie Hd Product', 'Car Care'),
('Mdc', 'Koch-Chemie Mdc Product', 'Car Care'),
('Fb', 'Koch-Chemie Fb Product', 'Car Care');

-- Insert product variants with sizes and prices
INSERT INTO public.product_variants (product_id, size, price) VALUES
-- Pfe variants
((SELECT id FROM public.products WHERE name = 'Pfe'), '20L', 472.00),
-- Vb variants  
((SELECT id FROM public.products WHERE name = 'Vb'), '10L', 295.00),
((SELECT id FROM public.products WHERE name = 'Vb'), '20L', 413.00),
-- Gs variants
((SELECT id FROM public.products WHERE name = 'Gs'), '1L', 118.00),
((SELECT id FROM public.products WHERE name = 'Gs'), '5L', 236.00),
((SELECT id FROM public.products WHERE name = 'Gs'), '10L', 330.40),
((SELECT id FROM public.products WHERE name = 'Gs'), '20L', 413.00),
-- Pe variants
((SELECT id FROM public.products WHERE name = 'Pe'), '20L', 472.00),
-- Rs variants
((SELECT id FROM public.products WHERE name = 'Rs'), '1L', 118.00),
-- As variants
((SELECT id FROM public.products WHERE name = 'As'), '1L', 82.60),
((SELECT id FROM public.products WHERE name = 'As'), '10L', 177.00),
((SELECT id FROM public.products WHERE name = 'As'), '20L', 354.00),
-- Gsf variants
((SELECT id FROM public.products WHERE name = 'Gsf'), '1L', 118.00),
((SELECT id FROM public.products WHERE name = 'Gsf'), '5L', 283.20),
-- Nms variants
((SELECT id FROM public.products WHERE name = 'Nms'), '10L', 413.00),
-- Af variants
((SELECT id FROM public.products WHERE name = 'Af'), '10L', 354.00),
((SELECT id FROM public.products WHERE name = 'Af'), '20L', 472.00),
-- Afs variants
((SELECT id FROM public.products WHERE name = 'Afs'), '20L', 472.00),
-- Afo variants
((SELECT id FROM public.products WHERE name = 'Afo'), '20L', 472.00),
-- Afx variants
((SELECT id FROM public.products WHERE name = 'Afx'), '10L', 472.00),
-- Sf variants
((SELECT id FROM public.products WHERE name = 'Sf'), '10L', 354.00),
((SELECT id FROM public.products WHERE name = 'Sf'), '20L', 531.00),
-- Sff variants
((SELECT id FROM public.products WHERE name = 'Sff'), '20L', 531.00),
-- Sfn variants
((SELECT id FROM public.products WHERE name = 'Sfn'), '10L', 354.00),
((SELECT id FROM public.products WHERE name = 'Sfn'), '20L', 531.00),
-- Sgw variants
((SELECT id FROM public.products WHERE name = 'Sgw'), '10L', 885.00),
((SELECT id FROM public.products WHERE name = 'Sgw'), '20L', 1534.00),
-- Hgt variants
((SELECT id FROM public.products WHERE name = 'Hgt'), '10L', 590.00),
-- Pw variants
((SELECT id FROM public.products WHERE name = 'Pw'), '1L', 177.00),
((SELECT id FROM public.products WHERE name = 'Pw'), '10L', 826.00),
-- Hd variants
((SELECT id FROM public.products WHERE name = 'Hd'), '20L', 767.00),
-- Mdc variants
((SELECT id FROM public.products WHERE name = 'Mdc'), '20L', 767.00),
-- Fb variants
((SELECT id FROM public.products WHERE name = 'Fb'), '10L', 413.00);