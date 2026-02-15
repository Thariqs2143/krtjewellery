import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatPrice, CATEGORY_NAMES, METAL_TYPE_NAMES, ProductCategory, MetalType } from '@/lib/types';
import { useGoldRate } from '@/hooks/useGoldRate';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { calculateProductPrice } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Edit, Eye, Package, Loader2, Trash2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Dedicated admin products query - fetches ALL products (active + inactive)
function useAdminProducts() {
  const { data: goldRate } = useGoldRate();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  
  return useQuery({
    queryKey: ['adminProducts', gstRate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('useAdminProducts: supabase response', { data, error });
      }

      if (error) throw error;

      return (data || []).map((product) => ({
        ...product,
        specifications: (product.specifications as Record<string, any>) || {},
        calculated_price: calculateProductPrice(product as any, goldRate || null, undefined, gstRate),
      }));
    },
    staleTime: 0, // Always refetch for admin
  });
}

export default function AdminProducts() {
  const { data: products, isLoading, isFetching, isError, error } = useAdminProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDuplicatingId, setIsDuplicatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleProductActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      // Invalidate both admin and public product queries
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Success',
        description: `Product ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const toggleProductFlag = async (productId: string, flag: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ [flag]: !currentValue })
        .eq('id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: 'Success',
        description: `Product updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((filteredProducts || []).map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter(x => x !== id);
    });
  };
  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const openDeleteDialog = (ids: string[]) => {
    setPendingDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const performDelete = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      toast({ title: 'Deleted', description: ids.length > 1 ? 'Selected products deleted' : 'Product deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete product(s)', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setPendingDeleteIds([]);
    }
  };

  const buildDuplicateSlug = (slug: string) => {
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${slug}-copy-${suffix}`;
  };

  const duplicateProduct = async (productId: string) => {
    setIsDuplicatingId(productId);
    try {
      const { data: original, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;
      if (!original) throw new Error('Product not found');

      const newSlug = buildDuplicateSlug(original.slug);
      const newName = `${original.name} (Copy)`;

      const {
        id,
        created_at,
        updated_at,
        ...rest
      } = original as Record<string, any>;

      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          ...rest,
          name: newName,
          slug: newSlug,
          sku: null,
          is_active: false,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      const { data: variations, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId);

      if (variationsError) throw variationsError;

      if (variations && variations.length > 0) {
        const variationPayload = variations.map((variation: Record<string, any>) => {
          const { id: vId, product_id, created_at: vCreated, updated_at: vUpdated, ...variationRest } = variation;
          return {
            ...variationRest,
            product_id: newProduct.id,
          };
        });

        const { error: insertVariationError } = await supabase
          .from('product_variations')
          .insert(variationPayload);

        if (insertVariationError) throw insertVariationError;
      }

      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: 'Product duplicated',
        description: 'A draft copy was created. Review and publish when ready.',
      });

      navigate(`/admin/products/${newProduct.id}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to duplicate product',
        variant: 'destructive',
      });
    } finally {
      setIsDuplicatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-1 flex items-center gap-2">
              Products
              {isFetching && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </h1>
            <p className="text-muted-foreground">
              Manage your jewellery catalog ({products?.length || 0} products)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/products/new">
              <Button className="btn-premium gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
            {selectedIds.length > 0 && (
              <Button type="button" variant="destructive" onClick={() => openDeleteDialog(selectedIds)} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading products...
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-destructive">
                <p className="mb-4">Failed to load products: {String(error?.message || error)}</p>
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" onClick={() => {
                    // Retry fetching
                    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
                  }}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedIds.length > 0 && selectedIds.length === (filteredProducts || []).length}
                            onCheckedChange={(v) => toggleSelectAll(!!v)}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Flags</TableHead>
                      <TableHead className="text-center">Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selectedIds.includes(product.id)}
                              onCheckedChange={(v) => toggleSelectOne(product.id, !!v)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sku || 'No SKU'} • {METAL_TYPE_NAMES[product.metal_type as MetalType]}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CATEGORY_NAMES[product.category as ProductCategory]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {product.weight_grams}g
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatPrice(product.calculated_price.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-center gap-1">
                            {product.is_featured && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">Featured</Badge>
                            )}
                            {product.is_bestseller && (
                              <Badge className="text-xs bg-green-100 text-green-700">Bestseller</Badge>
                            )}
                            {product.is_new_arrival && (
                              <Badge className="text-xs bg-blue-100 text-blue-700">New</Badge>
                            )}
                            {product.is_bridal && (
                              <Badge className="text-xs bg-pink-100 text-pink-700">Bridal</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={() => toggleProductActive(product.id, product.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/product/${product.slug}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={isDuplicatingId === product.id}
                              onClick={() => duplicateProduct(product.id)}
                              title="Duplicate product"
                            >
                              {isDuplicatingId === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/products/${product.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog([product.id])}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p>Are you sure you want to delete {pendingDeleteIds.length} product(s)? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button type="button" className="btn-premium" onClick={() => performDelete(pendingDeleteIds)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
