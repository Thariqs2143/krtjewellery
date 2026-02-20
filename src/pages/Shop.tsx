import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { CATEGORY_NAMES, METAL_TYPE_NAMES, type ProductCategory, type MetalType, formatPrice } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, ChevronDown, ChevronUp, X, Search, ArrowUpDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ProductCategoryRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
};

type ProductSubcategoryRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
  product_category_id?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
};

type MenuAssignmentRow = {
  id: string;
  product_category_id?: string | null;
  product_subcategory_id?: string | null;
};


// Category icons for the filter list
const categoryIcons: Record<ProductCategory, string> = {
  rings: '💍',
  pendants: '📿',
  earrings: '💎',
  necklaces: '✨',
  bracelets: '⭐',
  bangles: '🔗',
  chains: '⛓️',
  wedding_sets: '👰',
  diamond_jewellery: '💠',
  mens_jewellery: '🎖️',
};

export default function ShopPage() {
  const supabaseAny = supabase as any;
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const { category: categorySlugParam, subcategory: subcategorySlugParam } = useParams();

  const parseListParam = (key: string) =>
    (searchParams.get(key) || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  const parseNumberParam = (key: string, fallback: number) => {
    const raw = searchParams.get(key);
    if (!raw) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  };
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(
    parseListParam('categories') as ProductCategory[]
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseNumberParam('minPrice', 0),
    parseNumberParam('maxPrice', 2000000),
  ]);
  const [selectedMetalTypes, setSelectedMetalTypes] = useState<MetalType[]>(
    parseListParam('metal') as MetalType[]
  );
  const [weightRange, setWeightRange] = useState<[number, number]>([
    parseNumberParam('minWeight', 0),
    parseNumberParam('maxWeight', 200),
  ]);
  const [tagFilter, setTagFilter] = useState<string>(searchParams.get('tag') || '');
  const [isBestsellerFilter, setIsBestsellerFilter] = useState<boolean>(searchParams.get('isBestseller') === 'true');
  const [isNewArrivalFilter, setIsNewArrivalFilter] = useState<boolean>(searchParams.get('isNewArrival') === 'true');
  const [isBridalFilter, setIsBridalFilter] = useState<boolean>(searchParams.get('isBridal') === 'true');
  const menuCategoryId = searchParams.get('menuCategoryId') || '';
  const menuSubcategoryId = searchParams.get('menuSubcategoryId') || '';

  const { data: categorySlugMatch } = useQuery<ProductCategoryRow | null>({
    queryKey: ['productCategorySlug', categorySlugParam],
    enabled: !!categorySlugParam,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('product_categories')
        .select('id, slug')
        .eq('slug', categorySlugParam)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategorySlugMatch } = useQuery<ProductSubcategoryRow | null>({
    queryKey: ['productSubcategorySlug', categorySlugParam, subcategorySlugParam],
    enabled: !!categorySlugParam && !!subcategorySlugParam,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('product_subcategories')
        .select('id, slug, product_category_id')
        .eq('slug', subcategorySlugParam)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [sortBy, setSortBy] = useState<string>('bestseller');
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState('');
  const [selectedProductSubcategoryId, setSelectedProductSubcategoryId] = useState('');
  const resolvedMenuCategoryId =
    subcategorySlugMatch?.product_category_id || categorySlugMatch?.id || menuCategoryId;
  const resolvedMenuSubcategoryId = subcategorySlugMatch?.id || menuSubcategoryId;
  const activeCategoryFilterId = resolvedMenuCategoryId || selectedProductCategoryId;
  const activeSubcategoryFilterId = resolvedMenuSubcategoryId || selectedProductSubcategoryId;
  
  // Collapsible states
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: false,
    metal: false,
    weight: false,
  });

  // Fetch all products (no category filter in hook, we filter client-side)
  const { data: allProducts, isLoading } = useProducts();

  const { data: menuAssignments } = useQuery<MenuAssignmentRow[]>({
    queryKey: ['productCategoryAssignments'],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('products')
        .select('id, product_category_id, product_subcategory_id');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: productCategoryOptions } = useQuery<ProductCategoryRow[]>({
    queryKey: ['productCategoryOptions'],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('product_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: productSubcategoryOptions } = useQuery<ProductSubcategoryRow[]>({
    queryKey: ['productSubcategoryOptions'],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('product_subcategories')
        .select('id, name, slug, product_category_id')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredProductSubcategoryOptions = (productSubcategoryOptions || []).filter((sub) =>
    selectedProductCategoryId ? sub.product_category_id === selectedProductCategoryId : true
  );

  const searchSuggestions = useMemo(() => {
    const query = productSearchTerm.trim().toLowerCase();
    if (!query || !allProducts) return [];
    return allProducts
      .filter((product) => product.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [allProducts, productSearchTerm]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    if (!allProducts) return {};
    return allProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allProducts]);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts.filter(product => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      
      // Price filter
      if (product.calculated_price.total < priceRange[0] || product.calculated_price.total > priceRange[1]) {
        return false;
      }
      
      // Metal type filter
      if (selectedMetalTypes.length > 0 && !selectedMetalTypes.includes(product.metal_type)) {
        return false;
      }
      
      // Weight filter
      if (product.weight_grams < weightRange[0] || product.weight_grams > weightRange[1]) {
        return false;
      }

      // Tag filter
      if (tagFilter && !(product.tags || []).includes(tagFilter)) {
        return false;
      }

      // Flags
      if (isBestsellerFilter && !product.is_bestseller) {
        return false;
      }
      if (isNewArrivalFilter && !product.is_new_arrival) {
        return false;
      }
      if (isBridalFilter && !product.is_bridal) {
        return false;
      }
      
      if (activeCategoryFilterId || activeSubcategoryFilterId) {
        const matchesMenu = (menuAssignments || []).some((assignment) => {
          if (assignment.id !== product.id) return false;
          if (activeSubcategoryFilterId) {
            return assignment.product_subcategory_id === activeSubcategoryFilterId;
          }
          return assignment.product_category_id === activeCategoryFilterId;
        });
        if (!matchesMenu) {
          return false;
        }
      }

      if (productSearchTerm.trim()) {
        if (!product.name.toLowerCase().includes(productSearchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [
    allProducts,
    selectedCategories,
    priceRange,
    selectedMetalTypes,
    weightRange,
    tagFilter,
    isBestsellerFilter,
    isNewArrivalFilter,
    isBridalFilter,
    menuAssignments,
    activeCategoryFilterId,
    activeSubcategoryFilterId,
    productSearchTerm,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.calculated_price.total - b.calculated_price.total);
      case 'price-high':
        return products.sort((a, b) => b.calculated_price.total - a.calculated_price.total);
      case 'newest':
        return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'weight-low':
        return products.sort((a, b) => a.weight_grams - b.weight_grams);
      case 'weight-high':
        return products.sort((a, b) => b.weight_grams - a.weight_grams);
      case 'bestseller':
      default:
        return products.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  // Filter categories by search
  const filteredCategoryList = Object.entries(CATEGORY_NAMES).filter(([, name]) =>
    name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleCategory = (category: ProductCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleMetalType = (metalType: MetalType) => {
    setSelectedMetalTypes(prev =>
      prev.includes(metalType)
        ? prev.filter(m => m !== metalType)
        : [...prev, metalType]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 2000000]);
    setSelectedMetalTypes([]);
    setWeightRange([0, 200]);
    setProductSearchTerm('');
    setSelectedProductCategoryId('');
    setSelectedProductSubcategoryId('');
    setTagFilter('');
    setIsBestsellerFilter(false);
    setIsNewArrivalFilter(false);
    setIsBridalFilter(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 2000000 || 
    selectedMetalTypes.length > 0 || 
    weightRange[0] > 0 || 
    weightRange[1] < 200 ||
    tagFilter.length > 0 ||
    isBestsellerFilter ||
    isNewArrivalFilter ||
    isBridalFilter ||
    productSearchTerm.trim().length > 0 ||
    selectedProductCategoryId.length > 0 ||
    selectedProductSubcategoryId.length > 0;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter sidebar content
  const renderFilterContent = () => (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Product Search */}
      <div className="py-4 border-b space-y-3">
        <span className="font-medium">Search Products</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product name"
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Product Category */}
      <div className="py-4 border-b space-y-3">
        <span className="font-medium">Product Category</span>
        <Select
          value={selectedProductCategoryId}
          onValueChange={(value) => {
            setSelectedProductCategoryId(value);
            setSelectedProductSubcategoryId('');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {(productCategoryOptions || []).map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Subcategory */}
      <div className="py-4 border-b space-y-3">
        <span className="font-medium">Product Subcategory</span>
        <Select
          value={selectedProductSubcategoryId}
          onValueChange={setSelectedProductSubcategoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {filteredProductSubcategoryOptions.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jewellery Types / Categories */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b">
          <span className="font-medium">Jewellery Types</span>
          {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-4 space-y-3 border-b">
          {/* Category Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Jewellery Types"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Category List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {filteredCategoryList.map(([key, name]) => {
              const category = key as ProductCategory;
              const count = categoryCounts[category] || 0;
              return (
                <label 
                  key={category}
                  className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-md transition-colors"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <span className="text-lg">{categoryIcons[category]}</span>
                  <span className="flex-1 text-sm">{name}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </label>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b">
          <span className="font-medium">Price Range</span>
          {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-4 space-y-4 border-b">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={2000000}
              step={10000}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Metal Purity */}
      <Collapsible open={openSections.metal} onOpenChange={() => toggleSection('metal')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b">
          <span className="font-medium">Metal Purity</span>
          {openSections.metal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-4 space-y-2 border-b">
          {Object.entries(METAL_TYPE_NAMES).map(([key, name]) => {
            const metalType = key as MetalType;
            // Only show gold types for jewelry
            if (metalType === 'silver' || metalType === 'platinum') return null;
            return (
              <label 
                key={metalType}
                className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-md transition-colors"
              >
                <Checkbox
                  checked={selectedMetalTypes.includes(metalType)}
                  onCheckedChange={() => toggleMetalType(metalType)}
                />
                <span className="text-sm">{name}</span>
              </label>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Metal Weight */}
      <Collapsible open={openSections.weight} onOpenChange={() => toggleSection('weight')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-4 border-b">
          <span className="font-medium">Metal Weight</span>
          {openSections.weight ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-4 space-y-4 border-b">
          <div className="px-2">
            <Slider
              value={weightRange}
              onValueChange={(value) => setWeightRange(value as [number, number])}
              min={0}
              max={200}
              step={5}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{weightRange[0]}g</span>
              <span>{weightRange[1]}g</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-secondary/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Shop All Jewellery</h1>
          <p className="text-muted-foreground mt-2">Discover our exquisite collection of handcrafted gold jewellery</p>
        </div>
      </section>

      {/* Shop Search */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-5">
          <div className="max-w-3xl relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jewellery, styles, or product names"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-9 pr-10 h-11 rounded-lg bg-secondary/20 focus-visible:bg-background transition-colors"
              />
              {productSearchTerm.trim() && (
                <button
                  type="button"
                  onClick={() => setProductSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {productSearchTerm.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-2 border-b bg-secondary/30">
                  <p className="text-xs text-muted-foreground">
                    Suggested Searches
                  </p>
                </div>
                {searchSuggestions.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchSuggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-secondary">
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_NAMES[product.category]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-muted-foreground">
                    No matches found. Try a different keyword.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <aside className="w-72 shrink-0 hidden lg:block">
              <div className="sticky top-24">
                {renderFilterContent()}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground text-sm font-medium">
                {sortedProducts.length} Products
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                {/* Desktop Filters Badge - Shows active filter count */}
                {!isMobile && hasActiveFilters && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {selectedCategories.length +
                        selectedMetalTypes.length +
                        (priceRange[0] > 0 || priceRange[1] < 2000000 ? 1 : 0) +
                        (weightRange[0] > 0 || weightRange[1] < 200 ? 1 : 0) +
                        (productSearchTerm.trim() ? 1 : 0) +
                        (selectedProductCategoryId ? 1 : 0) +
                        (selectedProductSubcategoryId ? 1 : 0)}{' '}
                      Active
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-primary hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Mobile Filter Button */}
                {isMobile && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <SlidersHorizontal className="w-4 h-4" />
                        {hasActiveFilters && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                            {selectedCategories.length +
                              selectedMetalTypes.length +
                              (priceRange[0] > 0 || priceRange[1] < 2000000 ? 1 : 0) +
                              (weightRange[0] > 0 || weightRange[1] < 200 ? 1 : 0) +
                              (productSearchTerm.trim() ? 1 : 0) +
                              (selectedProductCategoryId ? 1 : 0) +
                              (selectedProductSubcategoryId ? 1 : 0)}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="sr-only">Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        {renderFilterContent()}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}

                {/* Sort Dropdown - Icon Only */}
                <div className="flex items-center gap-2 ml-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-10 h-10 px-0 justify-center">
                      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bestseller">Best Seller</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="weight-low">Weight: Low to High</SelectItem>
                      <SelectItem value="weight-high">Weight: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map(category => (
                  <span 
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {CATEGORY_NAMES[category]}
                    <button onClick={() => toggleCategory(category)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedMetalTypes.map(metalType => (
                  <span 
                    key={metalType}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm"
                  >
                    {METAL_TYPE_NAMES[metalType]}
                    <button onClick={() => toggleMetalType(metalType)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 2000000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <button onClick={() => setPriceRange([0, 2000000])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(weightRange[0] > 0 || weightRange[1] < 200) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                    {weightRange[0]}g - {weightRange[1]}g
                    <button onClick={() => setWeightRange([0, 200])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-primary hover:underline px-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              products={sortedProducts}
              isLoading={isLoading}
              emptyMessage="No products found matching your criteria"
            />
          </main>
        </div>
      </div>
    </Layout>
  );
}
