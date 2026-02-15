import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Trash2, Search, MessageSquare, Calendar, CheckCircle2 } from 'lucide-react';

interface Enquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_replied: boolean;
  created_at: string;
}

export default function AdminEnquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();

    // Set up realtime subscription
    const channel = supabase
      .channel('admin-enquiries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enquiries' },
        () => fetchEnquiries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch enquiries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ is_replied: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Enquiry Updated',
        description: 'Marked as replied.',
      });

      fetchEnquiries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update enquiry',
        variant: 'destructive',
      });
    }
  };

  const deleteEnquiry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Enquiry Deleted',
        description: 'The enquiry has been removed.',
      });

      fetchEnquiries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete enquiry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEnquiry(deleteId);
    setDeleteId(null);
  };

  // Filter by search term
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const term = searchTerm.toLowerCase();
    return (
      enquiry.name.toLowerCase().includes(term) ||
      enquiry.email.toLowerCase().includes(term) ||
      enquiry.phone.includes(term) ||
      enquiry.subject.toLowerCase().includes(term) ||
      enquiry.message.toLowerCase().includes(term)
    );
  });

  const pendingEnquiries = filteredEnquiries.filter((e) => !e.is_replied);
  const repliedEnquiries = filteredEnquiries.filter((e) => e.is_replied);

  const EnquiryCard = ({ enquiry }: { enquiry: Enquiry }) => (
    <Card key={enquiry.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{enquiry.name}</CardTitle>
              {enquiry.is_replied ? (
                <Badge className="bg-green-500/20 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Replied
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-200">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">{enquiry.subject}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/30 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a href={`mailto:${enquiry.email}`} className="text-sm font-medium hover:text-primary">
                {enquiry.email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <a href={`tel:${enquiry.phone}`} className="text-sm font-medium hover:text-primary">
                {enquiry.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Message</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{enquiry.message}</p>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date(enquiry.created_at).toLocaleString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!enquiry.is_replied && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => markAsReplied(enquiry.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Replied
            </Button>
          )}

          <AlertDialog open={deleteId === enquiry.id} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteId(enquiry.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this enquiry from {enquiry.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Contact Enquiries</h1>
            <p className="text-muted-foreground mt-1">Manage customer contact form submissions</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{filteredEnquiries.length}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Replies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingEnquiries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{repliedEnquiries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Responses sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-10" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No enquiries found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingEnquiries.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Pending Replies ({pendingEnquiries.length})</h2>
                {pendingEnquiries.map((enquiry) => (
                  <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                ))}
              </div>
            )}

            {repliedEnquiries.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3 mt-6">Replied ({repliedEnquiries.length})</h2>
                {repliedEnquiries.map((enquiry) => (
                  <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
