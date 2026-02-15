import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AttributeTemplate {
  id: string;
  name: string;
  slug: string;
  template_type: 'metal_type' | 'size' | 'gemstone_quality' | 'carat_weight' | 'certificate' | 'add_on';
  selection_mode: 'single' | 'multi';
  display_order: number;
  is_active: boolean;
}

export interface AttributeTemplateOption {
  id: string;
  template_id: string;
  label: string;
  value: string;
  metal_type: string | null;
  price_adjustment: number;
  weight_adjustment: number;
  image_url: string | null;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
}

export function useAttributeTemplates() {
  return useQuery({
    queryKey: ['attributeTemplates'],
    queryFn: async (): Promise<AttributeTemplate[]> => {
      const { data, error } = await supabase
        .from('attribute_templates')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as AttributeTemplate[];
    },
  });
}

export function useAttributeTemplateOptions(templateId?: string) {
  return useQuery({
    queryKey: ['attributeTemplateOptions', templateId],
    queryFn: async (): Promise<AttributeTemplateOption[]> => {
      if (!templateId) return [];
      const { data, error } = await supabase
        .from('attribute_template_options')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as AttributeTemplateOption[];
    },
    enabled: !!templateId,
  });
}

export function useCreateAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<AttributeTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from('attribute_templates')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as AttributeTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplates'] });
    },
  });
}

export function useUpdateAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AttributeTemplate> & { id: string }) => {
      const { id, ...updates } = payload;
      const { data, error } = await supabase
        .from('attribute_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AttributeTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplates'] });
    },
  });
}

export function useDeleteAttributeTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attribute_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplates'] });
    },
  });
}

export function useCreateAttributeOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<AttributeTemplateOption, 'id'>) => {
      const { data, error } = await supabase
        .from('attribute_template_options')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as AttributeTemplateOption;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplateOptions', variables.template_id] });
    },
  });
}

export function useUpdateAttributeOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<AttributeTemplateOption> & { id: string; template_id: string }) => {
      const { id, template_id, ...updates } = payload;
      const { data, error } = await supabase
        .from('attribute_template_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AttributeTemplateOption;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplateOptions', variables.template_id] });
    },
  });
}

export function useDeleteAttributeOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, template_id }: { id: string; template_id: string }) => {
      const { error } = await supabase
        .from('attribute_template_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attributeTemplateOptions', variables.template_id] });
    },
  });
}
