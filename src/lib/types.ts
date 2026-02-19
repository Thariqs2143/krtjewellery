// Type definitions for the Jewellery E-Commerce Platform
import type { Json } from '@/integrations/supabase/types';

export type MetalType = 'gold_22k' | 'gold_24k' | 'gold_18k' | 'silver' | 'platinum';

export type ProductCategory = 
  | 'necklaces' 
  | 'earrings' 
  | 'rings' 
  | 'bangles' 
  | 'bracelets' 
  | 'chains' 
  | 'pendants' 
  | 'wedding_sets' 
  | 'diamond_jewellery' 
  | 'mens_jewellery';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type AppRole = 'admin' | 'user';

export interface GoldRate {
  id: string;
  rate_22k: number;
  rate_24k: number;
  rate_18k: number | null;
  silver_rate: number | null;
  effective_date: string;
  is_current: boolean;
  source: string;
  created_at: string;
  created_by: string | null;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  variation_type: 'size' | 'metal_type' | string;
  size_value: string | null;
  size_label: string | null;
  metal_type: MetalType | null;
  price_adjustment: number;
  weight_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
  is_default: boolean;
  sku_suffix: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: ProductCategory;
  metal_type: MetalType;
  weight_grams: number;
  making_charge_percent: number | null;
  diamond_cost: number;
  stone_cost: number;
  images: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_bridal: boolean;
  is_active: boolean;
  stock_quantity: number;
  sku: string | null;
  tags: string[];
  specifications: Record<string, any> | Json | null;
  created_at: string;
  updated_at: string;
  video_url?: string | null;
  variations?: ProductVariation[];
}

export interface ProductWithPrice extends Product {
  calculated_price: CalculatedPrice;
}

export interface CalculatedPrice {
  gold_value: number;
  making_charges: number;
  subtotal: number;
  gst: number;
  total: number;
  gold_rate_applied: number;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  selected_variations?: Record<string, any>;
  variation_signature?: string;
  variation_price_adjustment?: number;
  variation_weight_adjustment?: number;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  gold_rate_at_order: number;
  shipping_address: Address;
  billing_address: Address | null;
  payment_method: string | null;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  weight_grams: number;
  gold_rate_applied: number;
  making_charges: number;
  diamond_cost: number;
  stone_cost: number;
  unit_price: number;
  total_price: number;
  selected_variations?: Record<string, any>;
  variation_price_adjustment?: number;
  variation_weight_adjustment?: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  timings: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Enquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
  product_id: string | null;
  store_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface CategoryMakingCharge {
  id: string;
  category: ProductCategory;
  making_charge_percent: number;
  min_making_charge: number;
  updated_at: string;
  updated_by: string | null;
}

// Utility function to format price in INR
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Category display names
export const CATEGORY_NAMES: Record<ProductCategory, string> = {
  necklaces: 'Necklaces',
  earrings: 'Earrings',
  rings: 'Rings',
  bangles: 'Bangles',
  bracelets: 'Bracelets',
  chains: 'Chains',
  pendants: 'Pendants',
  wedding_sets: 'Wedding Sets',
  diamond_jewellery: 'Diamond Jewellery',
  mens_jewellery: "Men's Jewellery",
};

// Metal type display names
export const METAL_TYPE_NAMES: Record<MetalType, string> = {
  gold_22k: '22K Gold',
  gold_24k: '24K Gold',
  gold_18k: '18K Gold',
  silver: 'Silver',
  platinum: 'Platinum',
};

// Order status display names
export const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Category size options for variations
export const CATEGORY_SIZE_OPTIONS: Record<string, { label: string; sizes: string[] }> = {
  rings: { label: 'Ring Size', sizes: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'] },
  bangles: { label: 'Bangle Size', sizes: ['2.2', '2.4', '2.6', '2.8', '3.0'] },
  bracelets: { label: 'Bracelet Length', sizes: ['6"', '6.5"', '7"', '7.5"', '8"', '8.5"'] },
  necklaces: { label: 'Chain Length', sizes: ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'] },
  chains: { label: 'Chain Length', sizes: ['16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'] },
};
