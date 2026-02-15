-- Menu categories and subcategories for megamenu + product assignments
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS menu_subcategories_unique_slug
  ON public.menu_subcategories(menu_category_id, slug);

CREATE TABLE IF NOT EXISTS public.product_menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  menu_category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  menu_subcategory_id UUID REFERENCES public.menu_subcategories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (product_id, menu_category_id, menu_subcategory_id)
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu_categories" ON public.menu_categories
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view menu_subcategories" ON public.menu_subcategories
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_menu_categories" ON public.product_menu_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu_categories" ON public.menu_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage menu_subcategories" ON public.menu_subcategories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage product_menu_categories" ON public.product_menu_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION update_menu_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_menu_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_categories_updated_at();

DROP TRIGGER IF EXISTS update_menu_subcategories_updated_at ON public.menu_subcategories;
CREATE TRIGGER update_menu_subcategories_updated_at
  BEFORE UPDATE ON public.menu_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_subcategories_updated_at();
