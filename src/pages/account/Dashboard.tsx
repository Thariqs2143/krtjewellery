import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Heart, MapPin, User, Tag, ChevronRight, Coins } from 'lucide-react';
import { formatPrice } from '@/lib/types';
import { AccountLayout } from '@/components/account/AccountLayout';

// Inline skeleton for stats - renders immediately while data loads
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    addresses: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch all data in parallel for maximum speed
    const fetchDashboardData = async () => {
      const [ordersRes, wishlistRes, addressesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_amount, status, order_number, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('wishlist')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('addresses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      const totalSpent = ordersRes.data?.reduce((sum, order) => {
        return order.status !== 'cancelled' ? sum + (order.total_amount || 0) : sum;
      }, 0) || 0;

      setStats({
        orders: ordersRes.data?.length || 0,
        wishlist: wishlistRes.count || 0,
        addresses: addressesRes.count || 0,
        totalSpent,
      });

      setRecentOrders(ordersRes.data || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Welcome back!</h1>
          <p className="text-muted-foreground">Manage your orders and account settings</p>
        </div>

        {/* Stats Grid - Shows skeleton or data */}
        {loading ? <StatsSkeleton /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.orders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.wishlist}</p>
                    <p className="text-xs text-muted-foreground">Wishlist</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.addresses}</p>
                    <p className="text-xs text-muted-foreground">Addresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{formatPrice(stats.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 3).map((order) => (
                    <Link
                      key={order.id}
                      to={`/track-order?orderId=${order.order_number}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">#{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-600' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {order.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/account/orders">
                <Button variant="outline" className="w-full mt-4">View All Orders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/account/profile" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-sm">Edit Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/account/addresses" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-sm">Manage Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/account/coupons" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <span className="text-sm">View Coupons</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/wishlist" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="text-sm">My Wishlist</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link to="/chit-fund" className="flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/30">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Digital Gold Scheme</span>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
}
