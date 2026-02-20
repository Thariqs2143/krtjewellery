import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, Search, Users, ShoppingBag, Layers, Package, RefreshCw } from 'lucide-react';

type AnalyticsRow = {
  label: string;
  value: number;
  secondary?: string;
};

const placeholderPages: AnalyticsRow[] = [];
const placeholderSearches: AnalyticsRow[] = [];
const placeholderCategories: AnalyticsRow[] = [];
const placeholderProducts: AnalyticsRow[] = [];

export default function AdminAnalytics() {
  const [pageQuery, setPageQuery] = useState('');

  const filteredPages = useMemo(() => {
    if (!pageQuery.trim()) return placeholderPages;
    const query = pageQuery.trim().toLowerCase();
    return placeholderPages.filter((row) => row.label.toLowerCase().includes(query));
  }, [pageQuery]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Analytics</h1>
            <p className="text-muted-foreground">
              Track page visits, searches, and top-performing categories/products.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analytics Feed
            </CardTitle>
            <CardDescription>
              No live data connected yet. Connect GA4/GTM to start tracking realtime analytics.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[
            { title: 'Page Views', icon: BarChart3, value: '0' },
            { title: 'Unique Visitors', icon: Users, value: '0' },
            { title: 'Avg. Time on Page', icon: Clock, value: '0m 0s' },
            { title: 'Search Volume', icon: Search, value: '0' },
            { title: 'Orders', icon: ShoppingBag, value: '0' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Pages
              </CardTitle>
              <CardDescription>Search by page path or title.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={pageQuery}
                  onChange={(event) => setPageQuery(event.target.value)}
                  placeholder="Search pages..."
                  className="pl-9"
                />
              </div>
              {filteredPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No page analytics yet.</p>
              ) : (
                <div className="space-y-3">
                  {filteredPages.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="truncate">{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Top Searches
              </CardTitle>
              <CardDescription>Customer search terms ranked by volume.</CardDescription>
            </CardHeader>
            <CardContent>
              {placeholderSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No search analytics yet.</p>
              ) : (
                <div className="space-y-3">
                  {placeholderSearches.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Top Categories
              </CardTitle>
              <CardDescription>Most selected categories in browsing sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              {placeholderCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category analytics yet.</p>
              ) : (
                <div className="space-y-3">
                  {placeholderCategories.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Frequently Bought Products
              </CardTitle>
              <CardDescription>Top products based on purchase volume.</CardDescription>
            </CardHeader>
            <CardContent>
              {placeholderProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchase analytics yet.</p>
              ) : (
                <div className="space-y-3">
                  {placeholderProducts.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
