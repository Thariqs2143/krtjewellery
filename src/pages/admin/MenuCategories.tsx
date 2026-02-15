import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2 } from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

interface MenuSubcategory {
  id: string;
  product_category_id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminMenuCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryOrder, setNewCategoryOrder] = useState('0');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategorySlug, setNewSubcategorySlug] = useState('');
  const [newSubcategoryOrder, setNewSubcategoryOrder] = useState('0');

  const defaultSeed = [
    { name: 'Rings', slug: 'rings', display_order: 1 },
    { name: 'Earrings', slug: 'earrings', display_order: 2 },
    { name: 'Necklaces', slug: 'necklaces', display_order: 3 },
    { name: 'Bangles & Bracelets', slug: 'bangles-bracelets', display_order: 4 },
    { name: 'Engagement & Wedding', slug: 'engagement-wedding', display_order: 5 },
    { name: 'Gifts', slug: 'gifts', display_order: 6 },
  ];

  const { data: menuCategories } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as MenuCategory[];
    },
  });

  const { data: menuSubcategories } = useQuery({
    queryKey: ['productSubcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_subcategories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as MenuSubcategory[];
    },
  });

  const groupedSubcategories = useMemo(() => {
    const map = new Map<string, MenuSubcategory[]>();
    (menuSubcategories || []).forEach((sub) => {
      if (!map.has(sub.product_category_id)) map.set(sub.product_category_id, []);
      map.get(sub.product_category_id)!.push(sub);
    });
    return map;
  }, [menuSubcategories]);

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!newCategoryName || !newCategorySlug) {
        throw new Error('Name and slug are required.');
      }
      const { error } = await supabase
        .from('product_categories')
        .insert({
          name: newCategoryName,
          slug: newCategorySlug,
          display_order: parseInt(newCategoryOrder || '0', 10),
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({ title: 'Category added' });
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryOrder('0');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (payload: Partial<MenuCategory> & { id: string }) => {
      const { error } = await supabase
        .from('product_categories')
        .update({
          name: payload.name,
          slug: payload.slug,
          display_order: payload.display_order,
          is_active: payload.is_active,
        })
        .eq('id', payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({ title: 'Category updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
      toast({ title: 'Category deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addSubcategoryMutation = useMutation({
    mutationFn: async () => {
      if (!newSubcategoryName || !newSubcategorySlug || !newSubcategoryCategoryId) {
        throw new Error('Name, slug, and category are required.');
      }
      const { error } = await supabase
        .from('product_subcategories')
        .insert({
          product_category_id: newSubcategoryCategoryId,
          name: newSubcategoryName,
          slug: newSubcategorySlug,
          display_order: parseInt(newSubcategoryOrder || '0', 10),
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
      toast({ title: 'Subcategory added' });
      setNewSubcategoryName('');
      setNewSubcategorySlug('');
      setNewSubcategoryOrder('0');
      setNewSubcategoryCategoryId('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('product_categories')
        .upsert(
          defaultSeed.map((item) => ({
            name: item.name,
            slug: item.slug,
            display_order: item.display_order,
            is_active: true,
          })),
          { onConflict: 'slug' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      toast({ title: 'Default categories seeded' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: async (payload: Partial<MenuSubcategory> & { id: string }) => {
      const { error } = await supabase
        .from('product_subcategories')
        .update({
          name: payload.name,
          slug: payload.slug,
          display_order: payload.display_order,
          is_active: payload.is_active,
          product_category_id: payload.product_category_id,
        })
        .eq('id', payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
      toast({ title: 'Subcategory updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_subcategories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
      toast({ title: 'Subcategory deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Categories</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Product Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              <Input placeholder="Slug" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} />
              <Input type="number" placeholder="Order" value={newCategoryOrder} onChange={(e) => setNewCategoryOrder(e.target.value)} />
            </div>
            <Button onClick={() => addCategoryMutation.mutate()} disabled={!newCategoryName || !newCategorySlug}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button variant="outline" onClick={() => seedDefaultsMutation.mutate()}>
              Seed Default Categories
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Product Subcategory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={newSubcategoryCategoryId} onValueChange={setNewSubcategoryCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Name" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} />
              <Input placeholder="Slug" value={newSubcategorySlug} onChange={(e) => setNewSubcategorySlug(e.target.value)} />
              <Input type="number" placeholder="Order" value={newSubcategoryOrder} onChange={(e) => setNewSubcategoryOrder(e.target.value)} />
            </div>
            <Button
              onClick={() => addSubcategoryMutation.mutate()}
              disabled={!newSubcategoryName || !newSubcategorySlug || !newSubcategoryCategoryId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(menuCategories || []).map((cat) => (
              <div key={cat.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <Input
                    value={cat.name}
                    onChange={(e) => updateCategoryMutation.mutate({ id: cat.id, name: e.target.value })}
                  />
                  <Input
                    value={cat.slug}
                    onChange={(e) => updateCategoryMutation.mutate({ id: cat.id, slug: e.target.value })}
                  />
                  <Input
                    type="number"
                    value={cat.display_order}
                    onChange={(e) =>
                      updateCategoryMutation.mutate({ id: cat.id, display_order: parseInt(e.target.value || '0', 10) })
                    }
                  />
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={cat.is_active}
                      onCheckedChange={(checked) => updateCategoryMutation.mutate({ id: cat.id, is_active: checked })}
                    />
                    <Button size="icon" variant="ghost" onClick={() => deleteCategoryMutation.mutate(cat.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  {(groupedSubcategories.get(cat.id) || []).map((sub) => (
                    <div key={sub.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                      <Input
                        value={sub.name}
                        onChange={(e) => updateSubcategoryMutation.mutate({ id: sub.id, name: e.target.value })}
                      />
                      <Input
                        value={sub.slug}
                        onChange={(e) => updateSubcategoryMutation.mutate({ id: sub.id, slug: e.target.value })}
                      />
                      <Input
                        type="number"
                        value={sub.display_order}
                        onChange={(e) =>
                          updateSubcategoryMutation.mutate({ id: sub.id, display_order: parseInt(e.target.value || '0', 10) })
                        }
                      />
                      <Switch
                        checked={sub.is_active}
                        onCheckedChange={(checked) => updateSubcategoryMutation.mutate({ id: sub.id, is_active: checked })}
                      />
                      <Button size="icon" variant="ghost" onClick={() => deleteSubcategoryMutation.mutate(sub.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
