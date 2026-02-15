import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Eye, Package, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  shipping_address: any;
  payment_method: string;
  notes: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  weight_grams: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_variations?: Record<string, any> | null;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const formatSelectedValue = (value: any) => {
    if (value && typeof value === 'object' && 'text' in value && 'font' in value) {
      return `${value.text} (${value.font})`;
    }
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async (): Promise<(Order & { user_id: string | null })[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, userId, orderNumber }: { orderId: string; status: string; userId: string | null; orderNumber: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as any })
        .eq('id', orderId);

      if (error) throw error;

      // Send push notification to customer if they have notifications enabled
      if (userId) {
        const statusLabel = ORDER_STATUSES.find(s => s.value === status)?.label || status;
        try {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              title: `Order ${orderNumber} Updated`,
              body: `Your order status has been updated to: ${statusLabel}`,
              url: `/account/orders`,
              notificationType: 'order_update',
              userId: userId,
              orderId: orderId,
            },
          });
        } catch (pushError) {
          console.error('Failed to send push notification:', pushError);
          // Don't fail the mutation if push fails
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({ title: 'Order status updated & customer notified!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    
    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_name, product_image, weight_grams, quantity, unit_price, total_price, selected_variations')
      .eq('order_id', order.id);

    if (!error && data) {
      const normalized = (data || []).map((item) => {
        const raw = (item as any).selected_variations;
        let parsed = raw;
        if (typeof raw === 'string') {
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
        }
        return {
          ...item,
          selected_variations: parsed,
        } as OrderItem;
      });
      setOrderItems(normalized);
    }
  };

  const filteredOrders = orders?.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    return (
      <Badge className={statusConfig?.color || ''}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders ({filteredOrders?.length || 0})</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              All Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(order.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{order.shipping_address?.full_name}</p>
                            <p className="text-muted-foreground">{order.shipping_address?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatPrice(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => 
                              updateStatusMutation.mutate({ 
                                orderId: order.id, 
                                status: value,
                                userId: order.user_id,
                                orderNumber: order.order_number
                              })
                            }
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6 mt-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.created_at), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{selectedOrder.payment_method || 'COD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-primary text-lg">
                      {formatPrice(selectedOrder.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Shipping Address</p>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.shipping_address?.full_name}</p>
                    <p>{selectedOrder.shipping_address?.phone}</p>
                    <p>{selectedOrder.shipping_address?.address_line1}</p>
                    {selectedOrder.shipping_address?.address_line2 && (
                      <p>{selectedOrder.shipping_address?.address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <p className="text-sm font-medium mb-3">Order Items</p>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                        <img
                          src={item.product_image || '/placeholder.svg'}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.weight_grams}g × {item.quantity}</p>
                          {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                            <div className="mt-1 text-[11px] text-muted-foreground space-y-0.5">
                              {Object.entries(item.selected_variations).map(([key, value]) => (
                                <div key={key} className="flex gap-1">
                                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span>{formatSelectedValue(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="font-semibold text-primary mt-1">
                            {formatPrice(item.total_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST ({gstRate}%)</span>
                    <span>{formatPrice(selectedOrder.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                  {/* Print Invoice Button */}
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        const id = selectedOrder?.order_number || selectedOrder?.id;
                        if (!id) return;
                        navigate(`/admin/orders/${id}/invoice`);
                      }}
                    >
                      <Printer className="w-4 h-4" />
                      View / Print Invoice
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Customer Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
