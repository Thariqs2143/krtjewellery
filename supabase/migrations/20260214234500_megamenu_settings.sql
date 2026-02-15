-- Megamenu settings (single row)
CREATE TABLE IF NOT EXISTS public.megamenu_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.megamenu_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view megamenu settings" ON public.megamenu_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage megamenu settings" ON public.megamenu_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION update_megamenu_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_megamenu_settings_updated_at ON public.megamenu_settings;
CREATE TRIGGER update_megamenu_settings_updated_at
  BEFORE UPDATE ON public.megamenu_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_megamenu_settings_updated_at();

-- Ensure a default row exists
INSERT INTO public.megamenu_settings (is_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.megamenu_settings);
