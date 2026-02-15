import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Star, Check, X, Eye, EyeOff, Trash2, Search, MessageSquare, Clock, User } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string | null;
  content: string;
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
  product?: { name: string };
}

export default function AdminReviews() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();

    // Set up realtime subscription
    const channel = supabase
      .channel('admin-reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => fetchReviews()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, product:products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Review Updated',
        description: 'The review has been updated successfully.',
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Review Deleted',
        description: 'The review has been removed.',
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved && !r.is_published);
  const publishedReviews = reviews.filter((r) => r.is_published);

  // Filter by search term
  const filterReviews = (reviewList: Review[]) => {
    if (!searchTerm) return reviewList;
    const term = searchTerm.toLowerCase();
    return reviewList.filter(
      (r) =>
        r.user_name.toLowerCase().includes(term) ||
        r.content.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.product?.name?.toLowerCase().includes(term)
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteReview(deleteId);
    setDeleteId(null);
  };

  const renderReviewCard = (review: Review) => (
    <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Review Content */}
          <div className="flex-1 p-6">
            {/* Header with rating and status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <Badge 
                  variant={review.is_published ? 'default' : review.is_approved ? 'secondary' : 'outline'}
                  className={review.is_published ? 'bg-green-600' : review.is_approved ? 'bg-blue-600 text-white' : ''}
                >
                  {review.is_published ? 'Published' : review.is_approved ? 'Approved' : 'Pending Review'}
                </Badge>
              </div>
            </div>
            
            {/* Title */}
            {review.title && (
              <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
            )}
            
            {/* Content */}
            <p className="text-muted-foreground mb-4 line-clamp-3">{review.content}</p>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{review.user_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{review.product?.name || 'Unknown Product'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{new Date(review.created_at).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          
          {/* Actions Panel */}
          <div className="flex md:flex-col gap-2 p-4 md:p-6 bg-secondary/30 md:w-48 justify-center md:justify-start border-t md:border-t-0 md:border-l">
            {!review.is_approved && (
              <>
                <Button
                  size="sm"
                  className="gap-2 flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                  onClick={() => updateReview(review.id, { is_approved: true })}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 flex-1 md:flex-none bg-white text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteId(review.id)}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </>
            )}
            
            {review.is_approved && !review.is_published && (
              <>
                <Button
                  size="sm"
                  className="gap-2 flex-1 md:flex-none"
                  onClick={() => updateReview(review.id, { is_published: true })}
                >
                  <Eye className="w-4 h-4" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 flex-1 md:flex-none"
                  onClick={() => updateReview(review.id, { is_approved: false })}
                >
                  <X className="w-4 h-4" />
                  Revoke
                </Button>
              </>
            )}
            
            {review.is_published && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 flex-1 md:flex-none"
                onClick={() => updateReview(review.id, { is_published: false })}
              >
                <EyeOff className="w-4 h-4" />
                Unpublish
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="gap-2 flex-1 md:flex-none text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setDeleteId(review.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="py-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 mb-4" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Review Management</h1>
            <p className="text-muted-foreground">Approve and publish customer reviews</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                  <div className="text-3xl font-bold">{pendingReviews.length}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Approved</p>
                  <div className="text-3xl font-bold">{approvedReviews.length}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Published</p>
                  <div className="text-3xl font-bold">{publishedReviews.length}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex">
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingReviews.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              Approved
              {approvedReviews.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {approvedReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              Published
              {publishedReviews.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {publishedReviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {filterReviews(pendingReviews).length === 0 ? (
              renderEmptyState(
                searchTerm 
                  ? 'No pending reviews match your search' 
                  : 'No pending reviews - all caught up! 🎉'
              )
            ) : (
              filterReviews(pendingReviews).map(renderReviewCard)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {filterReviews(approvedReviews).length === 0 ? (
              renderEmptyState(
                searchTerm 
                  ? 'No approved reviews match your search' 
                  : 'No approved reviews waiting to be published'
              )
            ) : (
              filterReviews(approvedReviews).map(renderReviewCard)
            )}
          </TabsContent>

          <TabsContent value="published" className="space-y-4 mt-6">
            {filterReviews(publishedReviews).length === 0 ? (
              renderEmptyState(
                searchTerm 
                  ? 'No published reviews match your search' 
                  : 'No published reviews yet'
              )
            ) : (
              filterReviews(publishedReviews).map(renderReviewCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
