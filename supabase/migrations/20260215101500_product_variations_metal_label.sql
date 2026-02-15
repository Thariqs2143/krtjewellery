-- Allow custom metal labels for metal_type variations
ALTER TABLE public.product_variations
  ADD COLUMN IF NOT EXISTS metal_label TEXT;
