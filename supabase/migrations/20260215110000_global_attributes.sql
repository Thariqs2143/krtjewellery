-- Global attributes + options, assigned to products
CREATE TABLE IF NOT EXISTS public.attribute_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (template_type IN (
    'metal_type',
    'size',
    'gemstone_quality',
    'carat_weight',
    'certificate',
    'add_on'
  )),
  selection_mode TEXT NOT NULL DEFAULT 'single' CHECK (selection_mode IN ('single', 'multi')),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attribute_template_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.attribute_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  metal_type TEXT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  weight_adjustment NUMERIC DEFAULT 0,
  image_url TEXT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (template_id, value)
);

CREATE TABLE IF NOT EXISTS public.product_attribute_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.attribute_templates(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (product_id, template_id)
);

ALTER TABLE public.attribute_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_template_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attribute_templates" ON public.attribute_templates
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view attribute_template_options" ON public.attribute_template_options
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_attribute_templates" ON public.product_attribute_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage attribute_templates" ON public.attribute_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage attribute_template_options" ON public.attribute_template_options
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage product_attribute_templates" ON public.product_attribute_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default global attributes
INSERT INTO public.attribute_templates (name, slug, template_type, selection_mode, display_order, is_active)
VALUES
  ('Metal Type', 'metal-type', 'metal_type', 'single', 1, true),
  ('Select Size', 'size', 'size', 'single', 2, true),
  ('Gemstone Quality', 'gemstone-quality', 'gemstone_quality', 'single', 3, true),
  ('Total Carat Weight', 'total-carat-weight', 'carat_weight', 'single', 4, true),
  ('Add Certificate', 'certificate', 'certificate', 'multi', 5, true),
  ('Add Ons', 'add-ons', 'add_on', 'multi', 6, true)
ON CONFLICT (slug) DO NOTHING;

DROP TRIGGER IF EXISTS update_attribute_templates_updated_at ON public.attribute_templates;
CREATE TRIGGER update_attribute_templates_updated_at
  BEFORE UPDATE ON public.attribute_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_attribute_template_options_updated_at ON public.attribute_template_options;
CREATE TRIGGER update_attribute_template_options_updated_at
  BEFORE UPDATE ON public.attribute_template_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_attribute_templates_updated_at ON public.product_attribute_templates;
CREATE TRIGGER update_product_attribute_templates_updated_at
  BEFORE UPDATE ON public.product_attribute_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
