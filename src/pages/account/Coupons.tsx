import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tag, Copy, Check, Clock } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { formatPrice } from '@/lib/types';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  valid_until: string | null;
}

export default function AccountCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCoupons(data || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const copyCode = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      toast({
        title: 'Coupon Copied!',
        description: `Code "${coupon.code}" copied to clipboard`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the code manually',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
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
          <h1 className="text-2xl font-serif font-semibold">Available Coupons</h1>
          <p className="text-muted-foreground">Apply these coupons at checkout for discounts</p>
        </div>

        {coupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No coupons available</h3>
              <p className="text-muted-foreground">Check back later for exclusive offers</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => {
              const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
              
              return (
                <Card 
                  key={coupon.id} 
                  className={`overflow-hidden ${isExpired ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Left Color Strip */}
                      <div className="w-2 bg-gradient-to-b from-primary to-gold-shimmer" />
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-bold text-primary">
                                {coupon.discount_type === 'percentage' 
                                  ? `${coupon.discount_value}% OFF`
                                  : formatPrice(coupon.discount_value) + ' OFF'
                                }
                              </span>
                            </div>
                            
                            {coupon.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {coupon.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {coupon.min_order_value > 0 && (
                                <span className="bg-secondary px-2 py-1 rounded">
                                  Min order: {formatPrice(coupon.min_order_value)}
                                </span>
                              )}
                              {coupon.max_discount && coupon.discount_type === 'percentage' && (
                                <span className="bg-secondary px-2 py-1 rounded">
                                  Max discount: {formatPrice(coupon.max_discount)}
                                </span>
                              )}
                              {coupon.valid_until && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded ${
                                  isExpired ? 'bg-red-500/20 text-red-600' : 'bg-secondary'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  {isExpired ? 'Expired' : `Valid until ${new Date(coupon.valid_until).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="font-mono text-lg font-semibold bg-secondary px-3 py-1 rounded border border-dashed border-primary/30">
                              {coupon.code}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyCode(coupon)}
                              disabled={isExpired}
                              className="gap-2"
                            >
                              {copiedId === coupon.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
