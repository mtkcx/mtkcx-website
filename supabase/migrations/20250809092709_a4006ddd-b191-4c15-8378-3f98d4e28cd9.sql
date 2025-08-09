-- Add some sample upsells for the "Af - Aromatic Intensive Foam" product
-- We'll create relationships with complementary products that make sense together

-- First, let's add upsells for the Af - Aromatic Intensive Foam (c496c950-3067-4cf8-847d-8713bc13f138)
-- with the Large Fur Broom (79bbdef5-98be-4d8e-a3e7-e1dcfa87ce6a) and Small Fur Brush (45f5b00d-a3f3-45a3-858d-ac20dd56275e)
INSERT INTO public.product_upsells (product_id, upsell_product_id, display_order) VALUES
('c496c950-3067-4cf8-847d-8713bc13f138', '79bbdef5-98be-4d8e-a3e7-e1dcfa87ce6a', 1),
('c496c950-3067-4cf8-847d-8713bc13f138', '45f5b00d-a3f3-45a3-858d-ac20dd56275e', 2),
('c496c950-3067-4cf8-847d-8713bc13f138', '42302b99-4353-4ff2-92ca-9594545e6f77', 3);

-- Add reverse relationships (people who buy brushes might want foam)
INSERT INTO public.product_upsells (product_id, upsell_product_id, display_order) VALUES
('79bbdef5-98be-4d8e-a3e7-e1dcfa87ce6a', 'c496c950-3067-4cf8-847d-8713bc13f138', 1),
('79bbdef5-98be-4d8e-a3e7-e1dcfa87ce6a', '45f5b00d-a3f3-45a3-858d-ac20dd56275e', 2),
('45f5b00d-a3f3-45a3-858d-ac20dd56275e', 'c496c950-3067-4cf8-847d-8713bc13f138', 1),
('45f5b00d-a3f3-45a3-858d-ac20dd56275e', '79bbdef5-98be-4d8e-a3e7-e1dcfa87ce6a', 2);