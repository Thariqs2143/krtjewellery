import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Store } from '@/lib/types';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('city', { ascending: true });

      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }

      return data || [];
    },
  });
}

export function useStoresByCity() {
  const { data: stores, ...rest } = useStores();

  const storesByCity = stores?.reduce((acc, store) => {
    if (!acc[store.city]) {
      acc[store.city] = [];
    }
    acc[store.city].push(store);
    return acc;
  }, {} as Record<string, Store[]>);

  return { storesByCity, stores, ...rest };
}
