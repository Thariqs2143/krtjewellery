import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface FreeShippingSettings {
  amount: number;
  enabled: boolean;
}

interface GstSettings {
  rate: number;
}

interface DeliveryPincodeSettings {
  pincodes: string[];
}

export function useFreeShippingSettings() {
  return useQuery({
    queryKey: ['site-settings', 'free_shipping_threshold'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'free_shipping_threshold')
        .single();

      if (error) {
        // Return default if not found
        return { amount: 50000, enabled: true } as FreeShippingSettings;
      }
      
      // Parse the JSON value
      const value = data.value as { amount?: number; enabled?: boolean };
      return {
        amount: value.amount ?? 50000,
        enabled: value.enabled ?? true
      } as FreeShippingSettings;
    },
  });
}

export function useUpdateFreeShippingSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: FreeShippingSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'free_shipping_threshold')
        .single();

      // Create a JSON-compatible value
      const jsonValue: Json = {
        amount: settings.amount,
        enabled: settings.enabled
      };

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ 
            value: jsonValue,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'free_shipping_threshold');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            key: 'free_shipping_threshold',
            value: jsonValue,
            description: 'Free shipping threshold amount in INR'
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'free_shipping_threshold'] });
      toast({
        title: 'Settings Updated',
        description: 'Free shipping settings have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });
}

export function useGstSettings() {
  return useQuery({
    queryKey: ['site-settings', 'gst_rate_percent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'gst_rate_percent')
        .single();

      if (error) {
        return { rate: 3 } as GstSettings;
      }

      const value = data.value as { rate?: number };
      return {
        rate: value.rate ?? 3,
      } as GstSettings;
    },
  });
}

export function useUpdateGstSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: GstSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'gst_rate_percent')
        .single();

      const jsonValue: Json = {
        rate: settings.rate,
      };

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: jsonValue,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'gst_rate_percent');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            key: 'gst_rate_percent',
            value: jsonValue,
            description: 'GST rate percent applied to product subtotal',
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'gst_rate_percent'] });
      toast({
        title: 'Settings Updated',
        description: 'GST rate has been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update GST settings',
        variant: 'destructive',
      });
    },
  });
}

export function useDeliveryPincodes() {
  return useQuery({
    queryKey: ['site-settings', 'delivery_pincodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'delivery_pincodes')
        .single();

      if (error) {
        return { pincodes: [] } as DeliveryPincodeSettings;
      }

      const value = data.value as { pincodes?: string[] };
      return {
        pincodes: Array.isArray(value.pincodes) ? value.pincodes : [],
      } as DeliveryPincodeSettings;
    },
  });
}

export function useUpdateDeliveryPincodes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: DeliveryPincodeSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'delivery_pincodes')
        .single();

      const jsonValue: Json = {
        pincodes: settings.pincodes,
      };

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: jsonValue,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'delivery_pincodes');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            key: 'delivery_pincodes',
            value: jsonValue,
            description: 'Pincodes where delivery is available',
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'delivery_pincodes'] });
      toast({
        title: 'Settings Updated',
        description: 'Delivery pincodes have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update delivery pincodes',
        variant: 'destructive',
      });
    },
  });
}
