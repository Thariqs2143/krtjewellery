import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Percent, Loader2 } from 'lucide-react';
import { useGstSettings, useUpdateGstSettings } from '@/hooks/useSiteSettings';

export default function TaxSettings() {
  const { data: settings, isLoading } = useGstSettings();
  const updateSettings = useUpdateGstSettings();

  const [rate, setRate] = useState<number>(3);

  useEffect(() => {
    if (settings) {
      setRate(settings.rate);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ rate });
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
          <h1 className="text-2xl font-serif font-semibold">Tax Settings</h1>
          <p className="text-muted-foreground">Configure GST rate for all products</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              GST Rate
            </CardTitle>
            <CardDescription>
              This percentage is applied to the product subtotal (gold + making + stones). It updates pricing for all products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="gst-rate">GST Percentage</Label>
                <Input
                  id="gst-rate"
                  type="number"
                  step="0.1"
                  min={0}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  placeholder="3"
                />
                <p className="text-sm text-muted-foreground">
                  Example: 3 for 3% GST, 18 for 18% GST
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
      </div>
    </AdminLayout>
  );
}
