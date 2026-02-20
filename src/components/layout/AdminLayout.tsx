import { useEffect, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  Users,
  LogOut,
  Wallet,
  Menu,
  X,
  Star,
  Tag,
  AlertTriangle,
  RefreshCw,
  Truck,
  Mail,
  BarChart3,
  Grid2X2,
  ListTree,
  Circle,
  Layers,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Gold Rates', href: '/admin/gold-rates', icon: TrendingUp },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory Alerts', href: '/admin/inventory', icon: AlertTriangle },
  { name: 'Making Charges', href: '/admin/making-charges', icon: Settings },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Enquiries', href: '/admin/enquiries', icon: Mail },
  { name: 'Product Categories', href: '/admin/menu-categories', icon: ListTree },
  { name: 'Homepage Carousel', href: '/admin/carousel-categories', icon: Circle },
  { name: 'Megamenu', href: '/admin/megamenu', icon: Grid2X2 },
  { name: 'Attributes', href: '/admin/attributes', icon: Layers },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Tax Settings', href: '/admin/tax-settings', icon: Settings },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Admin Users', href: '/admin/users', icon: Users },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth?redirect=/admin');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleRefreshData = () => {
    // Invalidate all queries to refresh data
    queryClient.invalidateQueries();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Get current page title
  const currentPage = menuItems.find(item => item.href === location.pathname);
  const pageTitle = currentPage?.name || 'Admin';

  return (
    <div className="min-h-screen flex bg-secondary/20 select-none">
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-card border-b shadow-sm select-none">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-shimmer flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-sm">K</span>
            </div>
            <span className="font-serif text-lg font-bold text-primary">{pageTitle}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefreshData}
            className="shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-rich-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r shadow-lg transform transition-transform duration-300 lg:transform-none lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold-shimmer flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-primary">KRT</span>
                <span className="block text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t space-y-3">
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="font-medium text-sm truncate">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshData}
              className="w-full justify-start gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="w-4 h-4" />
                View Store
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Add padding for mobile header */}
        <div className="pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
