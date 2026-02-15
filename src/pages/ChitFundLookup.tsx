import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Coins, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ChitPayment {
  id: string;
  amount: number;
  gold_grams: number;
  gold_rate_applied: number;
  payment_date: string;
  payment_method: string | null;
  receipt_number: string | null;
}

interface ChitFundData {
  id: string;
  customer_name: string;
  phone: string;
  plan_name: string;
  monthly_amount: number;
  total_months: number;
  months_paid: number;
  start_date: string;
  next_due_date: string | null;
  status: string;
  total_gold_grams: number | null;
  notes: string | null;
  payments: ChitPayment[];
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ChitFundLookup() {
  const [searchId, setSearchId] = useState('');
  const [chitFund, setChitFund] = useState<ChitFundData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  // Helper to check if a string is a valid UUID
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsLoading(true);
    setSearched(true);

    try {
      const trimmedSearch = searchId.trim();
      let chitData = null;
      let chitError = null;

      // Only search by ID if it looks like a valid UUID, otherwise search by phone
      if (isValidUUID(trimmedSearch)) {
        const result = await supabase
          .from('chit_funds')
          .select('*')
          .eq('id', trimmedSearch)
          .maybeSingle();
        chitData = result.data;
        chitError = result.error;
      } else {
        // Search by phone number
        const result = await supabase
          .from('chit_funds')
          .select('*')
          .eq('phone', trimmedSearch)
          .maybeSingle();
        chitData = result.data;
        chitError = result.error;
      }

      if (chitError) throw chitError;

      if (!chitData) {
        setChitFund(null);
        toast({
          title: 'Scheme not found',
          description: 'Please check your ID or phone number and try again.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch payments for this chit fund
      const { data: payments, error: paymentsError } = await supabase
        .from('chit_payments')
        .select('*')
        .eq('chit_fund_id', chitData.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      setChitFund({
        ...chitData,
        payments: payments || [],
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to find scheme',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = chitFund 
    ? (chitFund.months_paid / chitFund.total_months) * 100 
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium mb-3">
            <span className="w-8 h-px bg-primary" />
            Digital Gold Scheme
            <span className="w-8 h-px bg-primary" />
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Track Your Gold Savings
          </h1>
          <p className="text-muted-foreground">
            Enter your scheme ID or registered phone number to view your savings details.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-lg mx-auto mb-12">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter Scheme ID or Phone Number"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="btn-premium h-12 px-6" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chit Fund Details */}
        {searched && chitFund && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Summary Card */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Scheme</p>
                    <h2 className="font-serif text-2xl font-semibold">{chitFund.plan_name}</h2>
                    <p className="text-muted-foreground">{chitFund.customer_name}</p>
                  </div>
                  <Badge className={`${statusColors[chitFund.status]} text-sm px-4 py-1.5`}>
                    {chitFund.status.charAt(0).toUpperCase() + chitFund.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                {/* Progress Section */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{chitFund.months_paid} of {chitFund.total_months} months</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Started: {format(new Date(chitFund.start_date), 'MMM dd, yyyy')}</span>
                    <span>{Math.round(progressPercent)}% Complete</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Monthly Amount</p>
                    <p className="font-serif font-semibold text-lg">{formatPrice(chitFund.monthly_amount)}</p>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Coins className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Total Gold</p>
                    <p className="font-serif font-semibold text-lg">{(chitFund.total_gold_grams || 0).toFixed(3)}g</p>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                    <p className="font-serif font-semibold text-lg">
                      {formatPrice(chitFund.months_paid * chitFund.monthly_amount)}
                    </p>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Next Due</p>
                    <p className="font-serif font-semibold text-lg">
                      {chitFund.next_due_date 
                        ? format(new Date(chitFund.next_due_date), 'MMM dd')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Payment Timeline
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: chitFund.total_months }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          index < chitFund.months_paid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Payment History
                </CardTitle>
                <CardDescription>All your recorded payments</CardDescription>
              </CardHeader>
              <CardContent>
                {chitFund.payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chitFund.payments.map((payment, index) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-serif font-semibold text-primary">
                              {chitFund.payments.length - index}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{formatPrice(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            +{payment.gold_grams.toFixed(3)}g
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @ ₹{payment.gold_rate_applied}/g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Not Found State */}
        {searched && !chitFund && !isLoading && (
          <div className="max-w-lg mx-auto text-center py-12">
            <Coins className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-serif text-xl font-semibold mb-2">Scheme Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't find a scheme with that ID or phone number. Please verify your details and try again.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
