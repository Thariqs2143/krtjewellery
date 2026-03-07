import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGoldRate } from '@/hooks/useGoldRate';
import { useProducts } from '@/hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Edit,
  ArrowRight,
  Users
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: goldRate } = useGoldRate();
  const { data: products } = useProducts();
  
  const { data: orders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: ordersCount } = useQuery({
    queryKey: ['adminOrdersCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      title: 'Total Products',
      value: products?.length || 0,
      icon: Package,
      href: '/admin/products',
      color: 'text-amber-800',
      bgColor: 'bg-amber-200/70',
    },
    {
      title: 'Total Orders',
      value: ordersCount ?? 0,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-amber-800',
      bgColor: 'bg-amber-200/70',
    },
    {
      title: "Today's 22K Rate",
      value: goldRate ? formatPrice(goldRate.rate_22k) + '/g' : 'N/A',
      icon: TrendingUp,
      href: '/admin/gold-rates',
      color: 'text-amber-800',
      bgColor: 'bg-amber-200/70',
    },
    {
      title: '24K Rate',
      value: goldRate ? formatPrice(goldRate.rate_24k) + '/g' : 'N/A',
      icon: DollarSign,
      href: '/admin/gold-rates',
      color: 'text-amber-800',
      bgColor: 'bg-amber-200/70',
    },
  ];

  const quickActions = [
    {
      title: 'Update Gold Rate',
      description: 'One-click gold rate update for all products',
      icon: TrendingUp,
      href: '/admin/gold-rates',
    },
    {
      title: 'Manage Products',
      description: 'Add, edit, or disable products',
      icon: Package,
      href: '/admin/products',
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to KRT Jewels Admin Panel</p>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.href}>
                <Card className="group h-full border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50 to-yellow-100/70 shadow-sm transition-all hover:border-amber-400 hover:shadow-gold">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-amber-700 truncate group-hover:text-amber-900 transition-colors">
                          {stat.title}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold mt-1 text-amber-900 group-hover:text-amber-950 transition-colors truncate">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} ring-1 ring-amber-200/60 flex-shrink-0 transition-colors group-hover:ring-amber-400/70`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-serif text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Current Gold Rate Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Current Gold Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">22K Gold</p>
                <p className="text-xl font-bold text-primary">
                  {goldRate ? formatPrice(goldRate.rate_22k) : '—'}/g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24K Gold</p>
                <p className="text-xl font-bold text-primary">
                  {goldRate ? formatPrice(goldRate.rate_24k) : '—'}/g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">18K Gold</p>
                <p className="text-xl font-bold text-primary">
                  {goldRate?.rate_18k ? formatPrice(goldRate.rate_18k) : '—'}/g
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Last updated: {goldRate?.effective_date || 'Never'}
              </p>
              <Link to="/admin/gold-rates">
                <Button className="btn-premium gap-2" size="sm">
                  <Edit className="w-4 h-4" />
                  Update
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        {orders && orders.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatPrice(order.total_amount)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
