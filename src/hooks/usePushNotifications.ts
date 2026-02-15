import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - this would normally come from your backend
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushPreferences {
  orderUpdates: boolean;
  promoAlerts: boolean;
}

export function usePushNotifications(userId: string | undefined) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PushPreferences>({
    orderUpdates: true,
    promoAlerts: true,
  });
  const { toast } = useToast();

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
  }, []);

  // Check existing subscription
  useEffect(() => {
    if (!userId || !isSupported) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('order_updates, promo_alerts')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          setIsSubscribed(true);
          setPreferences({
            orderUpdates: data.order_updates,
            promoAlerts: data.promo_alerts,
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [userId, isSupported]);

  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) return false;

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const subscriptionJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
          order_updates: preferences.orderUpdates,
          promo_alerts: preferences.promoAlerts,
        }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Notifications enabled!',
        description: 'You will receive order updates and promotions.',
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not enable notifications.';
      console.error('Error subscribing:', error);
      toast({
        title: 'Subscription failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, isSupported, preferences, toast]);

  const unsubscribe = useCallback(async () => {
    if (!userId) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setIsSubscribed(false);
      toast({
        title: 'Notifications disabled',
        description: 'You will no longer receive push notifications.',
      });

      return true;
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Unsubscribe failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [userId, toast]);

  const updatePreferences = useCallback(async (newPrefs: Partial<PushPreferences>) => {
    if (!userId) return false;

    const updatedPrefs = { ...preferences, ...newPrefs };

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          order_updates: updatedPrefs.orderUpdates,
          promo_alerts: updatedPrefs.promoAlerts,
        })
        .eq('user_id', userId);

      if (error) throw error;

      setPreferences(updatedPrefs);
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }, [userId, preferences, toast]);

  return {
    isSupported,
    isSubscribed,
    loading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
}
