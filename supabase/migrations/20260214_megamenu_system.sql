-- Create megamenu_categories table
CREATE TABLE public.megamenu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug TEXT UNIQUE NOT NULL,
  category_name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create megamenu_sections table (columns in megamenu)
CREATE TABLE public.megamenu_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  megamenu_category_id UUID NOT NULL REFERENCES public.megamenu_categories(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  section_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create megamenu_items table (individual links/products)
CREATE TABLE public.megamenu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  megamenu_section_id UUID NOT NULL REFERENCES public.megamenu_sections(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_slug TEXT,
  icon_emoji TEXT,
  item_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create megamenu_featured_products table
CREATE TABLE public.megamenu_featured_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  megamenu_category_id UUID NOT NULL REFERENCES public.megamenu_categories(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_order INT DEFAULT 0,
  product_title TEXT,
  product_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.megamenu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megamenu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megamenu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megamenu_featured_products ENABLE ROW LEVEL SECURITY;

-- Public can view megamenu
CREATE POLICY "Anyone can view megamenu_categories" ON public.megamenu_categories
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view megamenu_sections" ON public.megamenu_sections
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view megamenu_items" ON public.megamenu_items
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view megamenu_featured_products" ON public.megamenu_featured_products
  FOR SELECT USING (true);

-- Only admins can update/insert megamenu
CREATE POLICY "Admins can manage megamenu_categories" ON public.megamenu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage megamenu_sections" ON public.megamenu_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage megamenu_items" ON public.megamenu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage megamenu_featured_products" ON public.megamenu_featured_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Insert default megamenu structure
INSERT INTO public.megamenu_categories (category_slug, category_name, display_order, is_active)
VALUES 
  ('rings', 'RINGS', 1, true),
  ('earrings', 'EARRINGS', 2, true),
  ('necklaces', 'NECKLACES', 3, true),
  ('bangles', 'BANGLES & BRACELETS', 4, true),
  ('engagement', 'ENGAGEMENT & WEDDING', 5, true),
  ('gifts', 'GIFTS', 6, true)
ON CONFLICT (category_slug) DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_megamenu_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_categories_updated_at
  BEFORE UPDATE ON public.megamenu_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_categories_updated_at();

CREATE OR REPLACE FUNCTION update_megamenu_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_sections_updated_at
  BEFORE UPDATE ON public.megamenu_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_sections_updated_at();

CREATE OR REPLACE FUNCTION update_megamenu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_items_updated_at
  BEFORE UPDATE ON public.megamenu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_items_updated_at();

CREATE OR REPLACE FUNCTION update_megamenu_featured_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_megamenu_featured_products_updated_at
  BEFORE UPDATE ON public.megamenu_featured_products
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_featured_products_updated_at();
