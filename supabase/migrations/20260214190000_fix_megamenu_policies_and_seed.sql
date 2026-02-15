-- Fix megamenu admin policies to use role system
DROP POLICY IF EXISTS "Admins can manage megamenu_categories" ON public.megamenu_categories;
DROP POLICY IF EXISTS "Admins can manage megamenu_sections" ON public.megamenu_sections;
DROP POLICY IF EXISTS "Admins can manage megamenu_items" ON public.megamenu_items;
DROP POLICY IF EXISTS "Admins can manage megamenu_featured_products" ON public.megamenu_featured_products;

CREATE POLICY "Admins can manage megamenu_categories" ON public.megamenu_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage megamenu_sections" ON public.megamenu_sections
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage megamenu_items" ON public.megamenu_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage megamenu_featured_products" ON public.megamenu_featured_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed a minimal megamenu structure if missing
INSERT INTO public.megamenu_sections (megamenu_category_id, section_name, section_order)
SELECT c.id, 'Shop', 1
FROM public.megamenu_categories c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.megamenu_sections s
  WHERE s.megamenu_category_id = c.id
    AND s.section_name = 'Shop'
);

INSERT INTO public.megamenu_items (megamenu_section_id, item_name, item_slug, item_order, is_active)
SELECT
  s.id,
  CASE c.category_slug
    WHEN 'rings' THEN 'All Rings'
    WHEN 'earrings' THEN 'All Earrings'
    WHEN 'necklaces' THEN 'All Necklaces'
    WHEN 'bangles' THEN 'All Bangles & Bracelets'
    WHEN 'engagement' THEN 'Engagement & Wedding'
    WHEN 'gifts' THEN 'Gift Jewellery'
    ELSE 'Shop'
  END,
  CASE c.category_slug
    WHEN 'rings' THEN 'rings'
    WHEN 'earrings' THEN 'earrings'
    WHEN 'necklaces' THEN 'necklaces'
    WHEN 'bangles' THEN 'bangles'
    WHEN 'engagement' THEN 'wedding-bridal'
    WHEN 'gifts' THEN 'diamond-jewellery'
    ELSE NULL
  END,
  1,
  true
FROM public.megamenu_sections s
JOIN public.megamenu_categories c ON c.id = s.megamenu_category_id
WHERE s.section_name = 'Shop'
  AND NOT EXISTS (
    SELECT 1
    FROM public.megamenu_items i
    WHERE i.megamenu_section_id = s.id
  );

-- Fix service_pages admin policy to use role system
DROP POLICY IF EXISTS "Admins can update service pages" ON public.service_pages;
CREATE POLICY "Admins can manage service pages" ON public.service_pages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
