import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Printer, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  payment_method: string | null;
  shipping_address: {
    full_name: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function AdminInvoices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminInvoices'],
    queryFn: async (): Promise<InvoiceOrder[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, order_number, created_at, total_amount, subtotal, gst_amount, payment_method, shipping_address'
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = (orders || []).filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(term) ||
      order.shipping_address?.full_name?.toLowerCase().includes(term) ||
      order.shipping_address?.phone?.includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Invoices</h1>
            <p className="text-muted-foreground">Manage and print customer invoices</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{filtered.length}</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No invoices found</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border rounded-lg p-4"
                  >
                    <div>
                      <div className="font-medium">Order #{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.shipping_address?.full_name} • {order.shipping_address?.phone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold text-primary">
                          {formatPrice(order.total_amount)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/admin/orders/${order.order_number}/invoice`)}
                      >
                        <Printer className="w-4 h-4" />
                        View / Print
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
