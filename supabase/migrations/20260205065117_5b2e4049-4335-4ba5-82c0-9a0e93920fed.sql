-- Create product variations table for different metal types and sizes with prices
CREATE TABLE public.product_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_type TEXT NOT NULL CHECK (variation_type IN ('metal_type', 'size', 'metal_size_combo')),
  metal_type public.metal_type NULL,
  size_value TEXT NULL,
  size_label TEXT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  weight_adjustment NUMERIC DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 1,
  sku_suffix TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view product variations"
ON public.product_variations
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product variations"
ON public.product_variations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX idx_product_variations_product_id ON public.product_variations(product_id);

-- Add video_url column to products for 360° or video content
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_product_variations_updated_at
  BEFORE UPDATE ON public.product_variations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();