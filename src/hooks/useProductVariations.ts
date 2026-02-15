import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MetalType } from '@/lib/types';

export interface ProductVariation {
  id: string;
  product_id: string;
  variation_type: 'size' | 'metal_type' | string;
  size_value: string | null;
  size_label: string | null;
  metal_type: MetalType | null;
  metal_label?: string | null;
  price_adjustment: number;
  weight_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
  is_default: boolean;
  sku_suffix: string | null;
  image_url: string | null;
  variation_group?: string | null;
  selection_mode?: 'single' | 'multi' | string;
  created_at: string;
  updated_at: string;
}

export function useProductVariations(productId: string | undefined) {
  return useQuery({
    queryKey: ['productVariations', productId],
    queryFn: async (): Promise<ProductVariation[]> => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .order('variation_type', { ascending: true })
        .order('size_value', { ascending: true });

      if (error) throw error;
      return (data || []) as ProductVariation[];
    },
    enabled: !!productId,
  });
}

export function useCreateVariation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variation: Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_variations')
        .insert(variation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', variables.product_id] });
    },
  });
}

export function useUpdateVariation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, productId, ...updates }: Partial<ProductVariation> & { id: string; productId: string }) => {
      const { data, error } = await supabase
        .from('product_variations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', variables.productId] });
    },
  });
}

export function useDeleteVariation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productVariations', variables.productId] });
    },
  });
}

export function useBulkCreateVariations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variations: Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>[]) => {
      if (variations.length === 0) return [];
      
      const { data, error } = await supabase
        .from('product_variations')
        .insert(variations)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['productVariations', variables[0].product_id] });
      }
    },
  });
}
