-- Add selection mode and grouping for custom variations
ALTER TABLE public.product_variations
  ADD COLUMN IF NOT EXISTS variation_group TEXT,
  ADD COLUMN IF NOT EXISTS selection_mode TEXT NOT NULL DEFAULT 'single';
