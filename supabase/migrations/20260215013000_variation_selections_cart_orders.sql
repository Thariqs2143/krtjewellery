-- Store selected variations on cart and order items
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS selected_variations JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variation_signature TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS variation_price_adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS variation_weight_adjustment DECIMAL(8,3) NOT NULL DEFAULT 0;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS selected_variations JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS variation_price_adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS variation_weight_adjustment DECIMAL(8,3) NOT NULL DEFAULT 0;

-- Drop old unique constraint so same product with different variations can exist
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- New unique constraint includes variation_signature
ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_user_id_product_id_variation_signature_key
  UNIQUE (user_id, product_id, variation_signature);
