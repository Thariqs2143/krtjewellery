import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { CATEGORY_NAMES, ProductCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Save, Settings } from 'lucide-react';

interface CategoryMakingCharge {
  id: string;
  category: ProductCategory;
  making_charge_percent: number;
  min_making_charge: number;
}

export default function AdminMakingCharges() {
  const [charges, setCharges] = useState<Record<string, { percent: string; min: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categoryCharges, isLoading } = useQuery({
    queryKey: ['categoryMakingCharges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_making_charges')
        .select('*');
      
      if (error) throw error;
      return data as CategoryMakingCharge[];
    },
  });

  useEffect(() => {
    if (categoryCharges) {
      const chargesMap: Record<string, { percent: string; min: string }> = {};
      categoryCharges.forEach((charge) => {
        chargesMap[charge.category] = {
          percent: charge.making_charge_percent.toString(),
          min: charge.min_making_charge?.toString() || '0',
        };
      });
      // Initialize all categories with defaults if not present
      Object.keys(CATEGORY_NAMES).forEach((cat) => {
        if (!chargesMap[cat]) {
          chargesMap[cat] = { percent: '12', min: '0' };
        }
      });
      setCharges(chargesMap);
    }
  }, [categoryCharges]);

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Upsert all making charges
      for (const [category, values] of Object.entries(charges)) {
        const existingCharge = categoryCharges?.find((c) => c.category === category);
        
        if (existingCharge) {
          await supabase
            .from('category_making_charges')
            .update({
              making_charge_percent: parseFloat(values.percent),
              min_making_charge: parseFloat(values.min),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCharge.id);
        } else {
          await supabase.from('category_making_charges').insert({
            category: category as ProductCategory,
            making_charge_percent: parseFloat(values.percent),
            min_making_charge: parseFloat(values.min),
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['categoryMakingCharges'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: 'Success!',
        description: 'Making charges updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update making charges',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCharge = (category: string, field: 'percent' | 'min', value: string) => {
    setCharges((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-1">Making Charges</h1>
          <p className="text-muted-foreground">
            Set category-wise making charge percentages
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Category Making Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-[150px]">Making Charge (%)</TableHead>
                      <TableHead className="w-[150px]">Min Charge (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={charges[key]?.percent || '12'}
                            onChange={(e) => updateCharge(key, 'percent', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="100"
                            value={charges[key]?.min || '0'}
                            onChange={(e) => updateCharge(key, 'min', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="btn-premium gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save All Changes'}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  * Product prices will automatically recalculate using these defaults when individual making charges are not set.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
