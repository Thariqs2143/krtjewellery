-- Enable realtime for products, gold_rates tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gold_rates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;