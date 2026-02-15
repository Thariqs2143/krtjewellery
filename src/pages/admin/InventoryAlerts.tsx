import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Package, Edit, RefreshCw, Check } from 'lucide-react';
import { CATEGORY_NAMES, type ProductCategory } from '@/lib/types';

interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  category: ProductCategory;
  is_active: boolean;
}

export default function InventoryAlerts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      // Fetch all active products and filter in code
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, low_stock_threshold, category, is_active')
        .eq('is_active', true)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;

      // Filter products where stock is at or below threshold
      const lowStock = (allProducts || []).filter((p) => 
        p.stock_quantity !== null && 
        p.stock_quantity <= (p.low_stock_threshold || 5)
      );

      setProducts(lowStock as LowStockProduct[]);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: editStock })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Stock Updated',
        description: 'Product stock has been updated successfully.',
      });

      setEditingId(null);
      fetchLowStockProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock',
        variant: 'destructive',
      });
    }
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', className: 'bg-red-500 text-white' };
    } else if (stock <= threshold / 2) {
      return { label: 'Critical', className: 'bg-orange-500 text-white' };
    } else {
      return { label: 'Low Stock', className: 'bg-yellow-500 text-white' };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Inventory Alerts</h1>
            <p className="text-muted-foreground">Monitor and manage low stock products</p>
          </div>
          <Button variant="outline" onClick={fetchLowStockProducts} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-500">
                    {products.filter(p => p.stock_quantity === 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-500">
                    {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 2).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical (1-2 items)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-500">
                    {products.filter(p => p.stock_quantity > 2).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-green-600">All Stock Levels Healthy!</h3>
              <p className="text-muted-foreground">No products are currently below their stock threshold.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Products Requiring Attention</CardTitle>
              <CardDescription>{products.length} products need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => {
                  const status = getStockStatus(product.stock_quantity, product.low_stock_threshold);
                  const isEditing = editingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>SKU: {product.sku || 'N/A'}</span>
                          <span>Category: {CATEGORY_NAMES[product.category]}</span>
                          <span>Threshold: {product.low_stock_threshold}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(Number(e.target.value))}
                              className="w-20"
                              min={0}
                            />
                            <Button
                              size="sm"
                              onClick={() => updateStock(product.id)}
                              className="gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{product.stock_quantity}</p>
                              <p className="text-xs text-muted-foreground">In Stock</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(product.id);
                                setEditStock(product.stock_quantity);
                              }}
                              className="gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Update
                            </Button>
                            <Link to={`/admin/products/${product.id}`}>
                              <Button size="sm" variant="ghost">
                                Edit Product
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
