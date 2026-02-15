import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGoldRate } from './useGoldRate';
import { calculateProductPrice } from './useProducts';
import type { CartItem, Product, ProductWithPrice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useGstSettings } from './useSiteSettings';

interface CartItemWithProduct extends CartItem {
  product: ProductWithPrice;
}

export function useCart() {
  const { user } = useAuth();
  const { data: goldRate } = useGoldRate();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cartQuery = useQuery({
    queryKey: ['cart', user?.id, gstRate],
    queryFn: async (): Promise<CartItemWithProduct[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      // Calculate prices for each product
      return (data || []).map((item: CartItemWithProduct) => ({
        ...item,
        product: {
          ...item.product,
          calculated_price: calculateProductPrice(item.product, goldRate || null, undefined, gstRate),
        },
      }));
    },
    enabled: !!user && !!goldRate,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      variation,
    }: {
      productId: string;
      quantity?: number;
      variation?: {
        priceAdjustment?: number;
        weightAdjustment?: number;
        imageUrl?: string | null;
        selectedOptions?: Record<string, any> | null;
      };
    }) => {
      if (!user) throw new Error('Please sign in to add items to cart');

      const selectedVariations = variation?.selectedOptions || {};
      const variationSignature = JSON.stringify({
        ...selectedVariations,
        priceAdjustment: variation?.priceAdjustment || 0,
        weightAdjustment: variation?.weightAdjustment || 0,
      });

      // Check product stock before adding
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      const availableStock = product.stock_quantity ?? 99;
      
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variation_signature', variationSignature)
        .maybeSingle();

      const currentCartQty = existing?.quantity || 0;
      const totalRequestedQty = currentCartQty + quantity;

      // Block oversell
      if (totalRequestedQty > availableStock) {
        throw new Error(`Only ${availableStock} items available. You already have ${currentCartQty} in your cart.`);
      }

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            selected_variations: selectedVariations,
            variation_signature: variationSignature,
            variation_price_adjustment: variation?.priceAdjustment || 0,
            variation_weight_adjustment: variation?.weightAdjustment || 0,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add to cart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) {
        // Remove item if quantity is 0
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart.',
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate totals
  const cartItems = cartQuery.data || [];
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.product.calculated_price.subtotal + (item.variation_price_adjustment || 0)) *
        item.quantity),
    0
  );
  const gstTotal = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.product.calculated_price.gst + (item.variation_price_adjustment || 0) * (gstRate / 100)) *
        item.quantity),
    0
  );
  const total = subtotal + gstTotal;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems,
    itemCount,
    subtotal,
    gstTotal,
    total,
    isLoading: cartQuery.isLoading,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
  };
}
