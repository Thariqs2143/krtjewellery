import { Bell, BellOff, Package, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationSettingsProps {
  userId: string | undefined;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const {
    isSupported,
    isSubscribed,
    loading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  } = usePushNotifications(userId);

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed 
            ? 'Manage your notification preferences' 
            : 'Get instant updates about your orders and exclusive offers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSubscribed ? (
          <Button onClick={subscribe} className="w-full gap-2">
            <Bell className="w-4 h-4" />
            Enable Push Notifications
          </Button>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <Label htmlFor="order-updates" className="font-medium">
                      Order Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Shipping, delivery, and status updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="order-updates"
                  checked={preferences.orderUpdates}
                  onCheckedChange={(checked) => 
                    updatePreferences({ orderUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <div>
                    <Label htmlFor="promo-alerts" className="font-medium">
                      Promotional Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Exclusive deals, new arrivals, and offers
                    </p>
                  </div>
                </div>
                <Switch
                  id="promo-alerts"
                  checked={preferences.promoAlerts}
                  onCheckedChange={(checked) => 
                    updatePreferences({ promoAlerts: checked })
                  }
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={unsubscribe}
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              <BellOff className="w-4 h-4" />
              Disable Notifications
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
