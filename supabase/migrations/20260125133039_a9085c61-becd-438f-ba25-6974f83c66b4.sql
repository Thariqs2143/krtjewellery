-- Create enum for user roles (admin vs regular user)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create enum for jewellery metal type
CREATE TYPE public.metal_type AS ENUM ('gold_22k', 'gold_24k', 'gold_18k', 'silver', 'platinum');

-- Create enum for product category
CREATE TYPE public.product_category AS ENUM ('necklaces', 'earrings', 'rings', 'bangles', 'bracelets', 'chains', 'pendants', 'wedding_sets', 'diamond_jewellery', 'mens_jewellery');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Gold rates table (stores historical rates)
CREATE TABLE public.gold_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_22k DECIMAL(10,2) NOT NULL,
  rate_24k DECIMAL(10,2) NOT NULL,
  rate_18k DECIMAL(10,2),
  silver_rate DECIMAL(10,2),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_current BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Category making charges (admin can set per category)
CREATE TABLE public.category_making_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category product_category NOT NULL UNIQUE,
  making_charge_percent DECIMAL(5,2) NOT NULL DEFAULT 12.00,
  min_making_charge DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category product_category NOT NULL,
  metal_type metal_type NOT NULL DEFAULT 'gold_22k',
  weight_grams DECIMAL(8,3) NOT NULL,
  making_charge_percent DECIMAL(5,2),
  diamond_cost DECIMAL(12,2) DEFAULT 0,
  stone_cost DECIMAL(12,2) DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_bridal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 1,
  sku TEXT UNIQUE,
  tags TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Wishlist
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, product_id)
);

-- Cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, product_id)
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  gst_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  gold_rate_at_order DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_grams DECIMAL(8,3) NOT NULL,
  gold_rate_applied DECIMAL(10,2) NOT NULL,
  making_charges DECIMAL(10,2) NOT NULL,
  diamond_cost DECIMAL(12,2) DEFAULT 0,
  stone_cost DECIMAL(12,2) DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL
);

-- Store locations
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timings TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enquiries
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_making_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current gold rate
CREATE OR REPLACE FUNCTION public.get_current_gold_rate()
RETURNS TABLE(rate_22k DECIMAL, rate_24k DECIMAL, rate_18k DECIMAL, effective_date DATE)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gr.rate_22k, gr.rate_24k, gr.rate_18k, gr.effective_date
  FROM public.gold_rates gr
  WHERE gr.is_current = true
  ORDER BY gr.effective_date DESC
  LIMIT 1
$$;

-- Function to calculate product price
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
  v_gst := v_subtotal * 0.03; -- 3% GST on gold jewellery

  RETURN QUERY SELECT v_gold_value, v_making_charges, v_subtotal, v_gst, (v_subtotal + v_gst);
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- User roles: users can read their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: users can manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Addresses: users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- Gold rates: public read, admin write
CREATE POLICY "Anyone can view gold rates" ON public.gold_rates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gold rates" ON public.gold_rates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Category making charges: public read, admin write
CREATE POLICY "Anyone can view making charges" ON public.category_making_charges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage making charges" ON public.category_making_charges
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products: public read for active products, admin full access
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Wishlist: users can manage their own
CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Cart: users can manage their own
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Orders: users can view their own orders, admins can view all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Order items: same as orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Stores: public read
CREATE POLICY "Anyone can view stores" ON public.stores
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage stores" ON public.stores
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enquiries: users can create and view their own, admins can view all
CREATE POLICY "Anyone can create enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own enquiries" ON public.enquiries
  FOR SELECT USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update enquiries" ON public.enquiries
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_metal_type ON public.products(metal_type);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_gold_rates_is_current ON public.gold_rates(is_current);
CREATE INDEX idx_gold_rates_effective_date ON public.gold_rates(effective_date DESC);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);