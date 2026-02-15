
ALTER TABLE public.product_variations 
ADD COLUMN image_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.product_variations.image_url IS 'URL of the variation image (e.g., product in different metal colors)';
