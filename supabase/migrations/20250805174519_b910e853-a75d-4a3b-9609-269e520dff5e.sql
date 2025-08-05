-- Remove all existing products (variants will be deleted automatically due to CASCADE)
DELETE FROM public.products WHERE id IS NOT NULL;