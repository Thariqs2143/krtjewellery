import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to enable realtime sync for products, gold_rates, and stock
 * Invalidates React Query caches when data changes in Supabase
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to products changes
    const productsChannel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Products changed:', payload.eventType);
          // Invalidate all product-related queries
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
          queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
          queryClient.invalidateQueries({ queryKey: ['bestsellerProducts'] });
          queryClient.invalidateQueries({ queryKey: ['newArrivals'] });
          queryClient.invalidateQueries({ queryKey: ['bridalProducts'] });
          queryClient.invalidateQueries({ queryKey: ['product'] });
        }
      )
      .subscribe();

    // Subscribe to gold_rates changes
    const goldRatesChannel = supabase
      .channel('gold-rates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gold_rates',
        },
        (payload) => {
          console.log('Gold rates changed:', payload.eventType);
          // Invalidate gold rate queries - this triggers price recalculation
          queryClient.invalidateQueries({ queryKey: ['goldRate'] });
          queryClient.invalidateQueries({ queryKey: ['goldRateHistory'] });
          // Also invalidate products since prices depend on gold rate
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
          queryClient.invalidateQueries({ queryKey: ['product'] });
        }
      )
      .subscribe();

    // Subscribe to orders changes (for stock updates)
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        () => {
          console.log('New order placed - refreshing stock');
          // Refresh products to get updated stock
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(goldRatesChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [queryClient]);
}
