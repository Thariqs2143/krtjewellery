-- Remove service pages feature
DROP POLICY IF EXISTS "Anyone can view service pages" ON public.service_pages;
DROP POLICY IF EXISTS "Admins can update service pages" ON public.service_pages;
DROP POLICY IF EXISTS "Admins can manage service pages" ON public.service_pages;

DROP TRIGGER IF EXISTS update_service_pages_updated_at ON public.service_pages;
DROP FUNCTION IF EXISTS update_service_pages_updated_at();

DROP TABLE IF EXISTS public.service_pages;
