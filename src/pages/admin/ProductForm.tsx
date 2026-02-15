import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { METAL_TYPE_NAMES, MetalType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ProductVariationsForm } from '@/components/admin/ProductVariationsForm';
import { useAttributeTemplates } from '@/hooks/useAttributeTemplates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Package, Settings, Sparkles, Image as ImageIcon } from 'lucide-react';

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
}

interface MenuSubcategory {
  id: string;
  product_category_id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  subcategory_id: string;
  metal_type: MetalType;
  weight_grams: number;
  making_charge_percent: number | null;
  diamond_cost: number;
  stone_cost: number;
  images: string[];
  sku: string;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_bridal: boolean;
  is_active: boolean;
}

const defaultFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  category_id: '',
  subcategory_id: '',
  metal_type: 'gold_22k',
  weight_grams: 0,
  making_charge_percent: null,
  diamond_cost: 0,
  stone_cost: 0,
  images: [],
  sku: '',
  stock_quantity: 1,
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  is_bridal: false,
  is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [productCategories, setProductCategories] = useState<MenuCategory[]>([]);
  const [productSubcategories, setProductSubcategories] = useState<MenuSubcategory[]>([]);
  const { data: attributeTemplates = [] } = useAttributeTemplates();
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const { data: productTemplates = [] } = useQuery({
    queryKey: ['productAttributeTemplates', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('product_attribute_templates')
        .select('template_id')
        .eq('product_id', id);
      if (error) throw error;
      return (data || []).map((row) => row.template_id as string);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    fetchProductCategories();
  }, []);

  useEffect(() => {
    if (productTemplates.length > 0) {
      setSelectedTemplateIds(productTemplates);
    }
  }, [productTemplates]);

  const fetchProductCategories = async () => {
    const { data: categories, error: catError } = await supabase
      .from('product_categories')
      .select('id, name, slug')
      .order('display_order');

    if (!catError) {
      setProductCategories(categories || []);
    }

    const { data: subcategories, error: subError } = await supabase
      .from('product_subcategories')
      .select('id, product_category_id, name, slug')
      .order('display_order');

    if (!subError) {
      setProductSubcategories(subcategories || []);
    }
  };

  const fetchProduct = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        short_description: data.short_description || '',
        category_id: data.product_category_id || '',
        subcategory_id: data.product_subcategory_id || '',
        metal_type: data.metal_type as MetalType,
        weight_grams: data.weight_grams,
        making_charge_percent: data.making_charge_percent,
        diamond_cost: data.diamond_cost || 0,
        stone_cost: data.stone_cost || 0,
        images: data.images || [],
        sku: data.sku || '',
        stock_quantity: data.stock_quantity || 1,
        is_featured: data.is_featured || false,
        is_bestseller: data.is_bestseller || false,
        is_new_arrival: data.is_new_arrival || false,
        is_bridal: data.is_bridal || false,
        is_active: data.is_active ?? true,
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
      navigate('/admin/products');
    } finally {
      setIsFetching(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-krt';
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        product_category_id: formData.category_id || null,
        product_subcategory_id: formData.subcategory_id || null,
        metal_type: formData.metal_type,
        weight_grams: formData.weight_grams,
        making_charge_percent: formData.making_charge_percent,
        diamond_cost: formData.diamond_cost,
        stone_cost: formData.stone_cost,
        images: formData.images,
        sku: formData.sku || null,
        stock_quantity: formData.stock_quantity,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        is_new_arrival: formData.is_new_arrival,
        is_bridal: formData.is_bridal,
        is_active: formData.is_active,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;

        
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });

        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });

        navigate('/admin/products');
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').single();

        if (error) throw error;


        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });

        toast({
          title: 'Success',
          description: 'Product created! You can now add variations.',
        });

        // Redirect to edit mode so variations tab is available
        navigate(`/admin/products/${data.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplatesToProduct = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const selectedSet = new Set(selectedTemplateIds);
      const existing = productTemplates;

      // Upsert product_attribute_templates
      const upsertPayload = selectedTemplateIds.map((templateId, index) => ({
        product_id: id,
        template_id: templateId,
        display_order: index,
        is_enabled: true,
      }));

      if (upsertPayload.length > 0) {
        const { error: upsertError } = await supabase
          .from('product_attribute_templates')
          .upsert(upsertPayload, { onConflict: 'product_id,template_id' });
        if (upsertError) throw upsertError;
      }

      // Remove unselected templates
      const toRemove = existing.filter((templateId) => !selectedSet.has(templateId));
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('product_attribute_templates')
          .delete()
          .eq('product_id', id)
          .in('template_id', toRemove);
        if (deleteError) throw deleteError;
      }

      // Fetch selected templates + options
      const { data: templates, error: templateError } = await supabase
        .from('attribute_templates')
        .select('*')
        .in('id', selectedTemplateIds);
      if (templateError) throw templateError;

      const { data: options, error: optionsError } = await supabase
        .from('attribute_template_options')
        .select('*')
        .in('template_id', selectedTemplateIds);
      if (optionsError) throw optionsError;

      // Remove existing variations for these templates
      for (const template of templates || []) {
        await supabase
          .from('product_variations')
          .delete()
          .eq('product_id', id)
          .eq('variation_group', template.name);
      }

      const variationsToInsert = (options || []).map((opt) => {
        const template = (templates || []).find((t) => t.id === opt.template_id);
        const templateType = template?.template_type || 'custom';
        const variationType =
          templateType === 'add_on' ? 'custom' : templateType;

        return {
          product_id: id,
          variation_type: variationType,
          size_value: templateType === 'size' ? opt.value : opt.value,
          size_label:
            templateType === 'size'
              ? opt.label
              : templateType === 'gemstone_quality'
              ? opt.label
              : templateType === 'carat_weight'
              ? opt.label
              : templateType === 'certificate'
              ? opt.label
              : templateType === 'add_on'
              ? opt.label
              : null,
          metal_type: templateType === 'metal_type' ? opt.metal_type : null,
          metal_label: templateType === 'metal_type' ? opt.label : null,
          selection_mode: template?.selection_mode || 'single',
          variation_group: template?.name || null,
          price_adjustment: opt.price_adjustment || 0,
          weight_adjustment: opt.weight_adjustment || 0,
          stock_quantity: 1,
          is_available: opt.is_active ?? true,
          is_default: opt.is_default ?? false,
          sku_suffix: null,
          image_url: opt.image_url || null,
        };
      });

      if (variationsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('product_variations')
          .insert(variationsToInsert);
        if (insertError) throw insertError;
      }

      toast({ title: 'Applied', description: 'Attributes applied to product variations' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to apply templates', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin/products')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <h1 className="font-serif text-3xl font-semibold mb-6">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="details" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger value="variations" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Variations</span>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Temple Gold Necklace"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="temple-gold-necklace-krt"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_description">Short Description</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                      }
                      placeholder="Brief one-line description for cards"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Detailed product description..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: value,
                            subcategory_id: '',
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Metal Type *</Label>
                      <Select
                        value={formData.metal_type}
                        onValueChange={(value: MetalType) =>
                          setFormData((prev) => ({ ...prev, metal_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(METAL_TYPE_NAMES).map(([key, name]) => (
                            <SelectItem key={key} value={key}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">Visible on store</p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Featured</Label>
                      <p className="text-xs text-muted-foreground">Show on homepage</p>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_featured: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bestseller</Label>
                      <p className="text-xs text-muted-foreground">Mark as popular</p>
                    </div>
                    <Switch
                      checked={formData.is_bestseller}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_bestseller: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Arrival</Label>
                      <p className="text-xs text-muted-foreground">Show new badge</p>
                    </div>
                    <Switch
                      checked={formData.is_new_arrival}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_new_arrival: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bridal Collection</Label>
                      <p className="text-xs text-muted-foreground">Wedding jewellery</p>
                    </div>
                    <Switch
                      checked={formData.is_bridal}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_bridal: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Subcategory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.subcategory_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subcategory_id: value }))
                  }
                  disabled={!formData.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {productSubcategories
                      .filter((sub) => sub.product_category_id === formData.category_id)
                      .map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_grams">Weight (grams) *</Label>
                    <Input
                      id="weight_grams"
                      type="number"
                      step="0.01"
                      value={formData.weight_grams || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, weight_grams: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="making_charge_percent">Making Charge %</Label>
                    <Input
                      id="making_charge_percent"
                      type="number"
                      step="0.1"
                      value={formData.making_charge_percent ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          making_charge_percent: e.target.value ? parseFloat(e.target.value) : null,
                        }))
                      }
                      placeholder="Category default"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use category default</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diamond_cost">Diamond Cost (₹)</Label>
                    <Input
                      id="diamond_cost"
                      type="number"
                      value={formData.diamond_cost || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, diamond_cost: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stone_cost">Stone Cost (₹)</Label>
                    <Input
                      id="stone_cost"
                      type="number"
                      value={formData.stone_cost || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stone_cost: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                      placeholder="KRT-001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={formData.images}
                  onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                  maxImages={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variations Tab */}
          <TabsContent value="variations" className="space-y-6">
            {isEditing && id ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Global Attributes</CardTitle>
                    <CardDescription>Select attributes to apply to this product.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {attributeTemplates.map((attr) => (
                        <label key={attr.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedTemplateIds.includes(attr.id)}
                            onChange={(e) => {
                              setSelectedTemplateIds((prev) => {
                                if (e.target.checked) return [...prev, attr.id];
                                return prev.filter((id) => id !== attr.id);
                              });
                            }}
                          />
                          <span>{attr.name}</span>
                        </label>
                      ))}
                    </div>
                    <Button type="button" className="btn-premium" onClick={applyTemplatesToProduct}>
                      Apply Attributes to Product
                    </Button>
                  </CardContent>
                </Card>

                <ProductVariationsForm productId={id} category={formData.category} />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground font-medium">Save the product first</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can add variations after creating the product.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" className="btn-premium gap-2 min-w-[140px]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  </AdminLayout>
);
}
