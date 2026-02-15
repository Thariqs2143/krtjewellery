import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GoldRate } from '@/lib/types';

export function useGoldRate() {
  return useQuery({
    queryKey: ['goldRate'],
    queryFn: async (): Promise<GoldRate | null> => {
      const { data, error } = await supabase
        .from('gold_rates')
        .select('*')
        .eq('is_current', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('useGoldRate: supabase response', { data, error });
      }

      if (error) {
        console.error('Error fetching gold rate:', error);
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useGoldRateHistory(days: number = 30) {
  return useQuery({
    queryKey: ['goldRateHistory', days],
    queryFn: async (): Promise<GoldRate[]> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('gold_rates')
        .select('*')
        .gte('effective_date', startDate.toISOString().split('T')[0])
        .order('effective_date', { ascending: true });

      if (error) {
        console.error('Error fetching gold rate history:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 30, // Consider fresh for 30 minutes
  });
}
