-- Extend megamenu items with rules and manual product assignments
ALTER TABLE public.megamenu_categories
  ADD COLUMN IF NOT EXISTS featured_limit INT DEFAULT 2;

CREATE TABLE IF NOT EXISTS public.megamenu_item_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  megamenu_item_id UUID NOT NULL REFERENCES public.megamenu_items(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  rule_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  rule_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.megamenu_item_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  megamenu_item_id UUID NOT NULL REFERENCES public.megamenu_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_order INT DEFAULT 0,
  product_title TEXT,
  product_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (megamenu_item_id, product_id)
);

ALTER TABLE public.megamenu_item_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megamenu_item_products ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view megamenu_item_rules" ON public.megamenu_item_rules
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view megamenu_item_products" ON public.megamenu_item_products
  FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "Admins can manage megamenu_item_rules" ON public.megamenu_item_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage megamenu_item_products" ON public.megamenu_item_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_megamenu_item_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_item_rules_updated_at
  BEFORE UPDATE ON public.megamenu_item_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_item_rules_updated_at();

CREATE OR REPLACE FUNCTION update_megamenu_item_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_item_products_updated_at
  BEFORE UPDATE ON public.megamenu_item_products
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_item_products_updated_at();
