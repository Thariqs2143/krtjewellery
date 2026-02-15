import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, ORDER_STATUS_NAMES, type OrderStatus } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  weight_grams: number;
  making_charges: number;
  gold_rate_applied: number;
}

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  gold_rate_at_order: number;
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
  payment_method: string | null;
  order_items: OrderItem[];
}

export default function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { pathname } = useLocation();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const searchParams = new URLSearchParams(search);
  const formatSelectedValue = (value: any) => {
    if (value && typeof value === 'object' && 'text' in value && 'font' in value) {
      return `${value.text} (${value.font})`;
    }
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      const redirect = pathname.startsWith('/admin')
        ? '/admin/login'
        : '/auth?redirect=/account/orders';
      navigate(redirect);
      return;
    }

    if (pathname.startsWith('/admin') && !isAdmin) {
      navigate('/admin/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const isUuid = (value: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

        const baseQuery = supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            total_amount,
            subtotal,
            gst_amount,
            gold_rate_at_order,
            created_at,
            shipping_address,
            payment_method,
            user_id,
            order_items (
              id,
              product_name,
              product_image,
              quantity,
              unit_price,
              total_price,
              weight_grams,
              making_charges,
              gold_rate_applied,
              selected_variations,
              variation_price_adjustment,
              variation_weight_adjustment
            )
          `);

        let data = null;
        let error = null;

        if (orderId) {
          if (isUuid(orderId)) {
            const res = await baseQuery.eq('id', orderId).maybeSingle();
            data = res.data;
            error = res.error;
          } else {
            const res = await baseQuery.eq('order_number', orderId).maybeSingle();
            data = res.data;
            error = res.error;
          }
        }

        if (error) throw error;
        if (!data) {
          setOrder(null);
          setLoading(false);
          return;
        }

        // Verify access - either user owns the order or is admin
        if (data.user_id !== user.id && !isAdmin) {
          setOrder(null);
          setLoading(false);
          return;
        }
        
        setOrder({
          ...data,
          status: data.status as OrderStatus,
          shipping_address: data.shipping_address as Order['shipping_address'],
          order_items: data.order_items || [],
        });
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId, authLoading, navigate, isAdmin, pathname]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    if (order?.order_number) {
      document.title = `Invoice-${order.order_number}`;
    }
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-4">This order doesn't exist or you don't have access to it.</p>
          <Link to="/account/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const address = order.shipping_address;
  const itemsToRender = order.order_items;

  return (
    <div className="min-h-screen bg-background">
      {/* Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 bg-background border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() =>
              pathname.startsWith('/admin') ? navigate('/admin/orders') : navigate(-1)
            }
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={printRef} id="invoice-print" className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-card border rounded-lg p-8 print:border-0 print:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b">
            <div>
              <h1 className="font-serif text-3xl font-bold text-primary">KRT Jewels</h1>
              <p className="text-sm text-muted-foreground mt-1">BIS Hallmarked 916 Gold Jewellery</p>
              <p className="text-sm text-muted-foreground">GSTIN: 33AXXXX1234X1ZX</p>
            </div>
            <div className="text-right mt-4 sm:mt-0">
              <h2 className="text-xl font-semibold">TAX INVOICE</h2>
              <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">FROM</h3>
              <p className="font-medium">KRT Jewels</p>
              <p className="text-sm text-muted-foreground">1154, Big Bazaar St, Prakasam</p>
              <p className="text-sm text-muted-foreground">Town Hall, Coimbatore</p>
              <p className="text-sm text-muted-foreground">Tamil Nadu - 641001</p>
              <p className="text-sm text-muted-foreground mt-1">Phone: +91 98430 10986</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">SHIP TO</h3>
              <p className="font-medium">{address.full_name}</p>
              <p className="text-sm text-muted-foreground">{address.address_line1}</p>
              {address.address_line2 && (
                <p className="text-sm text-muted-foreground">{address.address_line2}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:grid sm:grid-cols-3 gap-3 sm:gap-4 text-sm p-3 bg-secondary/30 rounded-lg">
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground">Gold Rate (22K):</span>
                <span className="font-medium sm:ml-2">{formatPrice(order.gold_rate_at_order)}/g</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-medium sm:ml-2 capitalize">{order.payment_method || 'Online'}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium sm:ml-2">{ORDER_STATUS_NAMES[order.status]}</span>
              </div>
            </div>
          </div>

          {/* Items Table - Desktop */}
          <div className="mb-8 hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">Product</th>
                  <th className="text-right py-3 font-semibold">Weight</th>
                  <th className="text-right py-3 font-semibold">Qty</th>
                  <th className="text-right py-3 font-semibold">Rate</th>
                  <th className="text-right py-3 font-semibold">Making</th>
                  <th className="text-right py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {itemsToRender.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.product_name}</div>
                      {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          {Object.entries(item.selected_variations).map(([key, value]) => (
                            <div key={key} className="flex gap-1">
                              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span>{formatSelectedValue(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-right py-3">{item.weight_grams.toFixed(2)}g</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{formatPrice(item.gold_rate_applied)}/g</td>
                    <td className="text-right py-3">{formatPrice(item.making_charges)}</td>
                    <td className="text-right py-3 font-medium">{formatPrice(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Items Cards - Mobile */}
          <div className="mb-8 sm:hidden space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">ITEMS</h3>
            {itemsToRender.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <p className="font-medium text-sm">{item.product_name}</p>
                {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    {Object.entries(item.selected_variations).map(([key, value]) => (
                      <div key={key} className="flex gap-1">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>{formatSelectedValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span>{item.weight_grams.toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qty:</span>
                    <span>{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span>{formatPrice(item.gold_rate_applied)}/g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Making:</span>
                    <span>{formatPrice(item.making_charges)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Amount</span>
                  <span className="text-primary">{formatPrice(item.total_price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstRate}%)</span>
                <span>{formatPrice(order.gst_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for shopping with KRT Jewels!</p>
            <p className="mt-1">For queries, contact us at info@krtjewels.com or +91 98430 10986</p>
            <p className="mt-4 text-xs">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #invoice-print,
          #invoice-print * {
            visibility: visible;
          }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
