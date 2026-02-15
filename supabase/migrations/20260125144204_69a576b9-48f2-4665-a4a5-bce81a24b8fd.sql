-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update product images
CREATE POLICY "Admins can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Create chit_funds table for digital gold/chit funds management
CREATE TABLE public.chit_funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan_name TEXT NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  total_months INTEGER NOT NULL DEFAULT 12,
  months_paid INTEGER NOT NULL DEFAULT 0,
  total_gold_grams NUMERIC DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create chit_payments table to track payments
CREATE TABLE public.chit_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chit_fund_id UUID NOT NULL REFERENCES public.chit_funds(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  gold_grams NUMERIC NOT NULL,
  gold_rate_applied NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.chit_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for chit_funds
CREATE POLICY "Admins can manage chit funds"
ON public.chit_funds FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for chit_payments
CREATE POLICY "Admins can manage chit payments"
ON public.chit_payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));