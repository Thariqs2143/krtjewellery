import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, ORDER_STATUS_NAMES, OrderStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderWithItems {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  items: Array<{
    product_name: string;
    product_image: string | null;
    quantity: number;
    total_price: number;
  }>;
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  confirmed: <CheckCircle className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  shipped: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    setSearched(true);
    
    // Clean and normalize the order number
    const cleanedOrderNumber = orderNumber.trim().toUpperCase();
    
    // Also extract just the numeric part if user enters like "26014071" or "KRT26014071"
    const numericPart = cleanedOrderNumber.replace(/[^0-9]/g, '');

    try {
      // Try exact match first
      let { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', cleanedOrderNumber)
        .maybeSingle();
      
      // If no exact match, try with KRT prefix
      if (!orderData && !orderError && numericPart) {
        const withPrefix = `KRT${numericPart}`;
        const { data: prefixMatch, error: prefixError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', withPrefix)
          .maybeSingle();
        
        if (!prefixError) {
          orderData = prefixMatch;
        }
      }
      
      // If still no match, try partial/contains search
      if (!orderData && !orderError) {
        const searchTerm = numericPart || cleanedOrderNumber;
        const { data: partialMatch, error: partialError } = await supabase
          .from('orders')
          .select('*')
          .ilike('order_number', `%${searchTerm}%`)
          .limit(1)
          .maybeSingle();
        
        if (!partialError) {
          orderData = partialMatch;
        }
      }

      if (orderError) throw orderError;

      if (!orderData) {
        setOrder(null);
        toast({
          title: 'Order not found',
          description: 'Please check your order number and try again. Try entering the full order number like KRT26014071.',
          variant: 'destructive',
        });
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_name, product_image, quantity, total_price')
        .eq('order_id', orderData.id);

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        status: orderData.status as OrderStatus,
        items: items || [],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to find order',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    const steps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to check the current status of your order.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-lg mx-auto mb-12">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter Order Number (e.g., KRT-XXXXX)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="btn-premium h-12 px-6" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {searched && order && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <CardTitle className="font-mono">{order.order_number}</CardTitle>
                </div>
                <Badge className={statusColors[order.status]}>
                  {statusIcons[order.status]}
                  <span className="ml-2">{ORDER_STATUS_NAMES[order.status]}</span>
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Progress Tracker */}
                {order.status !== 'cancelled' && (
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
                        <div
                          key={step}
                          className={`text-xs text-center flex-1 ${
                            index <= getStatusStep(order.status)
                              ? 'text-primary font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${((getStatusStep(order.status) + 1) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-primary">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-3 border-b last:border-0">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Not Found State */}
        {searched && !order && !isLoading && (
          <div className="max-w-lg mx-auto text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-serif text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't find an order with that number. Please check the order number and try again.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
