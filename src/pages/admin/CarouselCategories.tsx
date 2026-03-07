import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CarouselCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  is_view_all: boolean;
}

export default function AdminCarouselCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    display_order: 0,
    is_active: true,
    is_view_all: false,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['carouselCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carousel_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as CarouselCategory[];
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!formData.name || !formData.slug) {
        throw new Error('Name and slug are required');
      }

      if (editingId) {
        const { error } = await supabase
          .from('carousel_categories')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carousel_categories')
          .insert({
            ...formData,
            display_order: categories.length,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselCategories'] });
      toast({
        title: editingId ? 'Category updated' : 'Category added',
        description: 'Carousel category has been successfully updated.',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('carousel_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselCategories'] });
      toast({
        title: 'Category deleted',
        description: 'Carousel category has been removed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; display_order: number }>) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('carousel_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselCategories'] });
    },
  });

  const defaultCategories = [
    { name: 'Rings', slug: 'rings', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', display_order: 1, is_active: true, is_view_all: false },
    { name: 'Necklaces', slug: 'necklaces', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop', display_order: 2, is_active: true, is_view_all: false },
    { name: 'Earrings', slug: 'earrings', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop', display_order: 3, is_active: true, is_view_all: false },
    { name: 'Bangles', slug: 'bangles', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop', display_order: 4, is_active: true, is_view_all: false },
    { name: 'Bracelets', slug: 'bracelets', image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop', display_order: 5, is_active: true, is_view_all: false },
    { name: 'Chains', slug: 'chains', image_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&h=200&fit=crop', display_order: 6, is_active: true, is_view_all: false },
    { name: 'Pendants', slug: 'pendants', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', display_order: 7, is_active: true, is_view_all: false },
    { name: 'Wedding Sets', slug: 'wedding-bridal', image_url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=200&h=200&fit=crop', display_order: 8, is_active: true, is_view_all: false },
    { name: 'Diamond', slug: 'diamond-jewellery', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', display_order: 9, is_active: true, is_view_all: false },
    { name: "Men's", slug: 'mens-jewellery', image_url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop', display_order: 10, is_active: true, is_view_all: false },
    { name: 'View All', slug: 'shop', image_url: null, display_order: 11, is_active: true, is_view_all: true },
  ];

  const seedCategoriesMutation = useMutation({
    mutationFn: async () => {
      // Check if categories already exist
      const { data: existingData } = await supabase
        .from('carousel_categories')
        .select('id')
        .limit(1);

      if ((existingData || []).length > 0) {
        throw new Error('Categories already exist. Delete them first or edit individually.');
      }

      const { error } = await supabase
        .from('carousel_categories')
        .insert(defaultCategories);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselCategories'] });
      toast({
        title: 'Categories seeded',
        description: 'Default carousel categories have been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditCategory = (category: CarouselCategory) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || '',
      display_order: category.display_order,
      is_active: category.is_active,
      is_view_all: category.is_view_all,
    });
    setEditingId(category.id);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      image_url: '',
      display_order: 0,
      is_active: true,
      is_view_all: false,
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1].display_order, newCategories[index].display_order] = [
      newCategories[index].display_order,
      newCategories[index - 1].display_order,
    ];
    reorderMutation.mutate([
      { id: newCategories[index - 1].id, display_order: newCategories[index - 1].display_order },
      { id: newCategories[index].id, display_order: newCategories[index].display_order },
    ]);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index].display_order, newCategories[index + 1].display_order] = [
      newCategories[index + 1].display_order,
      newCategories[index].display_order,
    ];
    reorderMutation.mutate([
      { id: newCategories[index].id, display_order: newCategories[index].display_order },
      { id: newCategories[index + 1].id, display_order: newCategories[index + 1].display_order },
    ]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-1">Carousel Categories</h1>
            <p className="text-muted-foreground">Manage homepage category carousel</p>
          </div>
          <div className="flex gap-2">
            {categories.length === 0 && (
              <Button 
                onClick={() => seedCategoriesMutation.mutate()} 
                variant="outline"
                className="gap-2"
                disabled={seedCategoriesMutation.isPending}
              >
                🌱 Seed Default Categories
              </Button>
            )}
            <Button onClick={handleAddNew} className="btn-premium gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <p>No carousel categories found.</p>
                <p className="text-sm">Click the "Seed Default Categories" button above to add default categories, or create custom ones.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category, index) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{category.slug}</TableCell>
                        <TableCell>
                          {category.is_view_all ? (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              View All
                            </span>
                          ) : (
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              Category
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {category.is_active ? (
                            <span className="text-xs text-green-600">✓ Active</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === categories.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., rings"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs, e.g., /collections/rings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                Active
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={formData.is_view_all}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_view_all: checked })
                  }
                />
                View All Button
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark this as the "View All" action button
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addCategoryMutation.mutate()}
              disabled={addCategoryMutation.isPending}
              className="btn-premium"
            >
              {addCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
