import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/types';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  created_at: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  order_items: OrderItem[];
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { user, loading: authLoading } = useAuth();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            subtotal,
            gst_amount,
            created_at,
            shipping_address,
            user_id,
            order_items (
              id,
              product_name,
              quantity,
              total_price
            )
          `)
          .eq('order_number', orderNumber)
          .single();

        if (error) throw error;
        if (user && data.user_id !== user.id) {
          setOrder(null);
          setLoading(false);
          return;
        }

        setOrder({
          ...data,
          shipping_address: data.shipping_address as Order['shipping_address'],
          order_items: data.order_items || [],
        });
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrder();
    }
  }, [orderNumber, user, authLoading]);

  const whatsappMessage = useMemo(() => {
    if (!order) return '';
    const items = order.order_items
      .map((item) => `• ${item.product_name} x${item.quantity} (${formatPrice(item.total_price)})`)
      .join('\n');
    return [
      `New Order Received ✅`,
      `Order #${order.order_number}`,
      `Total: ${formatPrice(order.total_amount)} (GST ${gstRate}%)`,
      `Customer: ${order.shipping_address.full_name} | ${order.shipping_address.phone}`,
      `Address: ${order.shipping_address.address_line1}${order.shipping_address.address_line2 ? ', ' + order.shipping_address.address_line2 : ''}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}`,
      `Items:\n${items}`,
    ].join('\n');
  }, [order, gstRate]);

  const handleWhatsApp = () => {
    if (!whatsappMessage) return;
    const phone = '919843010986';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <Layout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-layer" />
          <div className="balloons-layer" />
        </div>

        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl md:text-3xl font-medium">Thank you for your order!</h1>
            </div>
            <p className="text-muted-foreground">
              Your order has been placed successfully. We’ll start processing it right away.
            </p>
          </div>

          {loading ? (
            <div className="max-w-3xl mx-auto mt-8 space-y-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : !order ? (
            <div className="max-w-3xl mx-auto mt-8">
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Order not found.</p>
                  <Link to="/account/orders">
                    <Button className="mt-4">Go to Orders</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Placed On</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST ({gstRate}%)</span>
                    <span className="font-medium">{formatPrice(order.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total_amount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.phone}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={`/track-order?order=${order.order_number}`} className="flex-1">
                  <Button variant="outline" className="w-full">Track Order</Button>
                </Link>
                <Button onClick={handleWhatsApp} className="w-full flex-1 gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Send to WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .confetti-layer {
          position: absolute;
          inset: -20% 0 auto 0;
          height: 120%;
          background-image:
            radial-gradient(circle, rgba(201,165,77,0.8) 2px, transparent 3px),
            radial-gradient(circle, rgba(255,99,132,0.7) 2px, transparent 3px),
            radial-gradient(circle, rgba(54,162,235,0.7) 2px, transparent 3px),
            radial-gradient(circle, rgba(75,192,192,0.7) 2px, transparent 3px),
            radial-gradient(circle, rgba(153,102,255,0.7) 2px, transparent 3px);
          background-size: 120px 120px;
          animation: confetti-fall 12s linear infinite;
          opacity: 0.6;
        }
        .balloons-layer {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 10% 90%, rgba(255,99,132,0.25) 0 40px, transparent 41px),
            radial-gradient(circle at 80% 80%, rgba(54,162,235,0.25) 0 45px, transparent 46px),
            radial-gradient(circle at 30% 75%, rgba(255,206,86,0.25) 0 35px, transparent 36px);
          animation: balloon-float 10s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(10%); }
        }
        @keyframes balloon-float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </Layout>
  );
}
