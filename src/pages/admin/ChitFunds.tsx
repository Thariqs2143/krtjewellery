import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGoldRate } from '@/hooks/useGoldRate';
import { formatPrice } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Wallet, Users, IndianRupee, Weight, Receipt, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChitFund {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  plan_name: string;
  monthly_amount: number;
  total_months: number;
  months_paid: number;
  total_gold_grams: number;
  start_date: string;
  next_due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface ChitPayment {
  id: string;
  chit_fund_id: string;
  payment_date: string;
  amount: number;
  gold_grams: number;
  gold_rate_applied: number;
  payment_method: string;
  receipt_number: string | null;
}

export default function AdminChitFunds() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: goldRate } = useGoldRate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedChit, setSelectedChit] = useState<ChitFund | null>(null);
  const [deleteChitId, setDeleteChitId] = useState<string | null>(null);
  
  const [newChit, setNewChit] = useState({
    customer_name: '',
    phone: '',
    email: '',
    plan_name: '',
    monthly_amount: '',
    total_months: '12',
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'cash',
    receipt_number: '',
  });

  // Fetch chit funds
  const { data: chitFunds, isLoading } = useQuery({
    queryKey: ['chitFunds'],
    queryFn: async (): Promise<ChitFund[]> => {
      const { data, error } = await supabase
        .from('chit_funds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Add new chit fund
  const addChitMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date();
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);

      const { error } = await supabase.from('chit_funds').insert({
        customer_name: newChit.customer_name,
        phone: newChit.phone,
        email: newChit.email || null,
        plan_name: newChit.plan_name,
        monthly_amount: parseFloat(newChit.monthly_amount),
        total_months: parseInt(newChit.total_months),
        start_date: startDate.toISOString().split('T')[0],
        next_due_date: nextDue.toISOString().split('T')[0],
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chitFunds'] });
      setIsAddDialogOpen(false);
      setNewChit({
        customer_name: '',
        phone: '',
        email: '',
        plan_name: '',
        monthly_amount: '',
        total_months: '12',
      });
      toast({ title: 'Chit fund created successfully!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create chit fund',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChit || !goldRate) return;

      const amount = parseFloat(newPayment.amount);
      const goldGrams = amount / goldRate.rate_22k;

      // Insert payment
      const { error: paymentError } = await supabase.from('chit_payments').insert({
        chit_fund_id: selectedChit.id,
        amount: amount,
        gold_grams: goldGrams,
        gold_rate_applied: goldRate.rate_22k,
        payment_method: newPayment.payment_method,
        receipt_number: newPayment.receipt_number || null,
      });

      if (paymentError) throw paymentError;

      // Update chit fund
      const newMonthsPaid = selectedChit.months_paid + 1;
      const newTotalGold = (selectedChit.total_gold_grams || 0) + goldGrams;
      const newStatus = newMonthsPaid >= selectedChit.total_months ? 'completed' : 'active';
      
      const nextDue = new Date(selectedChit.next_due_date || new Date());
      nextDue.setMonth(nextDue.getMonth() + 1);

      const { error: updateError } = await supabase
        .from('chit_funds')
        .update({
          months_paid: newMonthsPaid,
          total_gold_grams: newTotalGold,
          status: newStatus,
          next_due_date: newStatus === 'completed' ? null : nextDue.toISOString().split('T')[0],
        })
        .eq('id', selectedChit.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chitFunds'] });
      setIsPaymentDialogOpen(false);
      setSelectedChit(null);
      setNewPayment({ amount: '', payment_method: 'cash', receipt_number: '' });
      toast({ title: 'Payment recorded successfully!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to record payment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteChitMutation = useMutation({
    mutationFn: async (chitId: string) => {
      const { error: paymentsError } = await supabase
        .from('chit_payments')
        .delete()
        .eq('chit_fund_id', chitId);

      if (paymentsError) throw paymentsError;

      const { error: chitError } = await supabase
        .from('chit_funds')
        .delete()
        .eq('id', chitId);

      if (chitError) throw chitError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chitFunds'] });
      setDeleteChitId(null);
      toast({ title: 'Scheme deleted' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete scheme',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDeleteChit = async () => {
    if (!deleteChitId || deleteChitMutation.isPending) return;
    await deleteChitMutation.mutateAsync(deleteChitId);
  };

  const stats = [
    {
      title: 'Total Schemes',
      value: chitFunds?.length || 0,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Customers',
      value: chitFunds?.filter(c => c.status === 'active').length || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Monthly Collection',
      value: formatPrice(chitFunds?.filter(c => c.status === 'active').reduce((sum, c) => sum + c.monthly_amount, 0) || 0),
      icon: IndianRupee,
      color: 'text-primary',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Total Gold (grams)',
      value: (chitFunds?.reduce((sum, c) => sum + (c.total_gold_grams || 0), 0) || 0).toFixed(2) + 'g',
      icon: Weight,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold">Chit Funds / Digital Gold</h1>
            <p className="text-muted-foreground">Manage monthly gold savings schemes</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-premium gap-2">
                <Plus className="w-4 h-4" />
                New Scheme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chit Fund</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={newChit.customer_name}
                      onChange={(e) => setNewChit(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={newChit.phone}
                      onChange={(e) => setNewChit(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newChit.email}
                    onChange={(e) => setNewChit(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={newChit.plan_name}
                    onChange={(e) => setNewChit(prev => ({ ...prev, plan_name: e.target.value }))}
                    placeholder="e.g., Gold Savings - 1 Year"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={newChit.monthly_amount}
                      onChange={(e) => setNewChit(prev => ({ ...prev, monthly_amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Months *</Label>
                    <Select
                      value={newChit.total_months}
                      onValueChange={(value) => setNewChit(prev => ({ ...prev, total_months: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="18">18 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full btn-premium"
                  onClick={() => addChitMutation.mutate()}
                  disabled={addChitMutation.isPending || !newChit.customer_name || !newChit.phone || !newChit.plan_name || !newChit.monthly_amount}
                >
                  {addChitMutation.isPending ? 'Creating...' : 'Create Scheme'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : chitFunds && chitFunds.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Gold Accumulated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chitFunds.map((chit) => (
                      <TableRow key={chit.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{chit.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{chit.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{chit.plan_name}</TableCell>
                        <TableCell>{formatPrice(chit.monthly_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(chit.months_paid / chit.total_months) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{chit.months_paid}/{chit.total_months}</span>
                          </div>
                        </TableCell>
                        <TableCell>{(chit.total_gold_grams || 0).toFixed(3)}g</TableCell>
                        <TableCell>{getStatusBadge(chit.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {chit.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedChit(chit);
                                  setNewPayment(prev => ({ ...prev, amount: chit.monthly_amount.toString() }));
                                  setIsPaymentDialogOpen(true);
                                }}
                              >
                                <Receipt className="w-4 h-4 mr-1" />
                                Record Payment
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteChitId(chit.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No chit funds yet. Create your first scheme!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {selectedChit && goldRate && (
              <div className="space-y-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-medium">{selectedChit.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedChit.plan_name}</p>
                  <p className="text-sm mt-1">
                    Current Gold Rate: <span className="font-semibold">{formatPrice(goldRate.rate_22k)}/g</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  {newPayment.amount && (
                    <p className="text-sm text-muted-foreground">
                      Gold: {(parseFloat(newPayment.amount) / goldRate.rate_22k).toFixed(4)} grams
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={newPayment.payment_method}
                      onValueChange={(value) => setNewPayment(prev => ({ ...prev, payment_method: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Number</Label>
                    <Input
                      value={newPayment.receipt_number}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, receipt_number: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  className="w-full btn-premium"
                  onClick={() => recordPaymentMutation.mutate()}
                  disabled={recordPaymentMutation.isPending || !newPayment.amount}
                >
                  {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteChitId} onOpenChange={(open) => !open && setDeleteChitId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this scheme? This will also remove all related payments and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteChit}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteChitMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
