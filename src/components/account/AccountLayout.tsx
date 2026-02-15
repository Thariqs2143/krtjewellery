import { ReactNode, Suspense } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  User, 
  Tag, 
  Heart,
  Home,
  Bell
} from 'lucide-react';

interface AccountLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/account' },
  { icon: Package, label: 'Orders', href: '/account/orders' },
  { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
  { icon: User, label: 'Profile', href: '/account/profile' },
  { icon: Tag, label: 'Coupons', href: '/account/coupons' },
];

const mobileNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Package, label: 'Orders', href: '/account/orders' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: User, label: 'Profile', href: '/account/profile' },
];

// Lightweight loading skeleton that shows instantly
function AccountSkeleton() {
  return (
    <Layout>
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar Skeleton */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </aside>
            {/* Content Skeleton */}
            <main className="flex-1 min-w-0 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show skeleton only for very brief auth check (should be <500ms with caching)
  if (loading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/account" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border p-4 space-y-1">
                <div className="pb-4 mb-4 border-b">
                  <p className="font-semibold truncate">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Customer Account</p>
                </div>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/account' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Suspense fallback={
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              }>
                {children}
              </Suspense>
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
          <div className="flex items-center justify-around py-2">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </Layout>
  );
}
