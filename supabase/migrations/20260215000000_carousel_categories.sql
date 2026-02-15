-- Carousel categories table for homepage category showcase
CREATE TABLE IF NOT EXISTS public.carousel_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_view_all BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.carousel_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view carousel_categories" ON public.carousel_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage carousel_categories" ON public.carousel_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.carousel_categories (name, slug, image_url, display_order, is_active, is_view_all) VALUES
('Rings', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', 1, true, false),
('Necklaces', 'necklaces', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop', 2, true, false),
('Earrings', 'earrings', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop', 3, true, false),
('Bangles', 'bangles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop', 4, true, false),
('Bracelets', 'bracelets', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop', 5, true, false),
('Chains', 'chains', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&h=200&fit=crop', 6, true, false),
('Pendants', 'pendants', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', 7, true, false),
('Wedding Sets', 'wedding-bridal', 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=200&h=200&fit=crop', 8, true, false),
('Diamond', 'diamond-jewellery', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', 9, true, false),
("Men's", 'mens-jewellery', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop', 10, true, false),
('View All', 'shop', '', 11, true, true) ON CONFLICT DO NOTHING;
