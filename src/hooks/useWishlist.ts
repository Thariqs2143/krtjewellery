import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGoldRate } from './useGoldRate';
import { useGstSettings } from './useSiteSettings';
import { calculateProductPrice } from './useProducts';
import type { WishlistItem, ProductWithPrice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface WishlistItemWithProduct extends WishlistItem {
  product: ProductWithPrice;
}

export function useWishlist() {
  const { user } = useAuth();
  const { data: goldRate } = useGoldRate();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', user?.id, gstRate],
    queryFn: async (): Promise<WishlistItemWithProduct[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      // Calculate prices for each product
      return (data || []).map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          calculated_price: calculateProductPrice(item.product, goldRate || null, undefined, gstRate),
        },
      }));
    },
    enabled: !!user && !!goldRate,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Please sign in to add items to wishlist');

      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Item already in wishlist');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Added to wishlist',
        description: 'Item has been added to your wishlist.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add to wishlist',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some((item) => item.product_id === productId) || false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    items: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isInWishlist,
    toggleWishlist,
    isToggling: addToWishlistMutation.isPending || removeFromWishlistMutation.isPending,
  };
}
