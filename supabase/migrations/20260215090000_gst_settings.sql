-- Add GST rate setting and update price calc function to use it
INSERT INTO public.site_settings (key, value, description)
VALUES ('gst_rate_percent', '{"rate": 3}', 'GST rate percent applied to product subtotal')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.calculate_product_price(
  p_weight DECIMAL,
  p_metal_type metal_type,
  p_making_charge_percent DECIMAL,
  p_diamond_cost DECIMAL DEFAULT 0,
  p_stone_cost DECIMAL DEFAULT 0
)
RETURNS TABLE(gold_value DECIMAL, making_charges DECIMAL, subtotal DECIMAL, gst DECIMAL, total DECIMAL)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gold_rate DECIMAL;
  v_gold_value DECIMAL;
  v_making_charges DECIMAL;
  v_subtotal DECIMAL;
  v_gst DECIMAL;
  v_gst_rate DECIMAL;
BEGIN
  -- Get current gold rate based on metal type
  SELECT CASE 
    WHEN p_metal_type = 'gold_22k' THEN gr.rate_22k
    WHEN p_metal_type = 'gold_24k' THEN gr.rate_24k
    WHEN p_metal_type = 'gold_18k' THEN COALESCE(gr.rate_18k, gr.rate_22k * 0.75)
    ELSE gr.rate_22k
  END INTO v_gold_rate
  FROM public.gold_rates gr
  WHERE gr.is_current = true
  ORDER BY gr.effective_date DESC
  LIMIT 1;

  -- Calculate values
  v_gold_value := p_weight * COALESCE(v_gold_rate, 0);
  v_making_charges := v_gold_value * (COALESCE(p_making_charge_percent, 12) / 100);
  v_subtotal := v_gold_value + v_making_charges + COALESCE(p_diamond_cost, 0) + COALESCE(p_stone_cost, 0);

  -- Read GST rate from settings, fallback to 3%
  SELECT COALESCE((value->>'rate')::DECIMAL, 3)
    INTO v_gst_rate
  FROM public.site_settings
  WHERE key = 'gst_rate_percent'
  LIMIT 1;

  v_gst := v_subtotal * (COALESCE(v_gst_rate, 3) / 100);

  RETURN QUERY SELECT v_gold_value, v_making_charges, v_subtotal, v_gst, (v_subtotal + v_gst);
END;
$$;
