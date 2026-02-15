-- Drop the security definer view and recreate without security definer
DROP VIEW IF EXISTS public.low_stock_products;

-- Create the view without security definer (default is SECURITY INVOKER which respects RLS)
CREATE VIEW public.low_stock_products 
WITH (security_invoker = true) AS
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