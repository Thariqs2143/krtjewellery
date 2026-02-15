-- Add low_stock_threshold column to products table for inventory alerts
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Create a view for low stock products
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.low_stock_threshold,
  p.category,
  p.is_active
FROM public.products p
WHERE p.stock_quantity IS NOT NULL 
  AND p.low_stock_threshold IS NOT NULL
  AND p.stock_quantity <= p.low_stock_threshold
  AND p.is_active = true;