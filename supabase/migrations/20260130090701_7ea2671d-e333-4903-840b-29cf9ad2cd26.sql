-- Create function to decrease stock when order is placed
CREATE OR REPLACE FUNCTION public.decrease_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock for each order item
  UPDATE public.products
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - NEW.quantity)
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after order_items are inserted
DROP TRIGGER IF EXISTS trigger_decrease_stock_on_order ON public.order_items;
CREATE TRIGGER trigger_decrease_stock_on_order
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_stock_on_order();