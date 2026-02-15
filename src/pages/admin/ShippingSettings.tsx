import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Truck, Loader2 } from 'lucide-react';
import { useFreeShippingSettings, useUpdateFreeShippingSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/types';

export default function ShippingSettings() {
  const { data: settings, isLoading } = useFreeShippingSettings();
  const updateSettings = useUpdateFreeShippingSettings();
  
  const [amount, setAmount] = useState<number>(50000);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (settings) {
      setAmount(settings.amount);
      setEnabled(settings.enabled);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ amount, enabled });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Shipping Settings</h1>
          <p className="text-muted-foreground">Configure shipping options for your store</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Free Shipping Threshold
            </CardTitle>
            <CardDescription>
              Set the minimum order amount for free shipping. Customers will see a progress bar showing how much more they need to add for free shipping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="free-shipping-enabled">Enable Free Shipping</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, orders above the threshold get free shipping
                  </p>
                </div>
                <Switch
                  id="free-shipping-enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold-amount">Minimum Order Amount (₹)</Label>
                <Input
                  id="threshold-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="50000"
                  min={0}
                  step={1000}
                  disabled={!enabled}
                />
                <p className="text-sm text-muted-foreground">
                  Orders above {formatPrice(amount)} will receive free shipping
                </p>
              </div>

              <Button 
                type="submit" 
                className="btn-premium"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>This is how customers will see the free shipping progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-4">
              {enabled ? (
                <>
                  <div className="text-sm">
                    Add <span className="text-primary font-semibold">{formatPrice(amount * 0.3)}</span> more to get{' '}
                    <span className="font-semibold text-green-600">free shipping!</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: '70%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(amount * 0.7)} / {formatPrice(amount)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Free shipping is currently disabled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
