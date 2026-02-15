-- Add column for megamenu layout grouping
ALTER TABLE public.megamenu_sections
  ADD COLUMN IF NOT EXISTS column INT DEFAULT 1;
