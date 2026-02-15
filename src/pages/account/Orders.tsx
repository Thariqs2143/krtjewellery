import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight, ShoppingBag, FileText } from 'lucide-react';
import { formatPrice, ORDER_STATUS_NAMES, type OrderStatus } from '@/lib/types';
import { AccountLayout } from '@/components/account/AccountLayout';

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_image: string | null;
    quantity: number;
    total_price: number;
  }[];
}

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            total_amount,
            created_at,
            order_items (
              id,
              product_name,
              product_image,
              quantity,
              total_price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Link to="/collections/necklaces">
                <Button>Shop Now</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/30 border-b gap-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Order #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {ORDER_STATUS_NAMES[order.status]}
                    </Badge>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-16 h-16 rounded-lg bg-secondary overflow-hidden">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-sm">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'delivered' && (
                          <Link to={`/account/orders/${order.order_number}/invoice`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <FileText className="w-4 h-4" />
                              Invoice
                            </Button>
                          </Link>
                        )}
                        <Link to={`/track-order?orderId=${order.order_number}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            Track Order
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
