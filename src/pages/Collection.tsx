import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { CATEGORY_NAMES, type ProductCategory, formatPrice } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

const categoryRouteMap: Record<string, ProductCategory> = {
  'necklaces': 'necklaces',
  'earrings': 'earrings',
  'rings': 'rings',
  'bangles': 'bangles',
  'bracelets': 'bracelets',
  'chains': 'chains',
  'pendants': 'pendants',
  'wedding-bridal': 'wedding_sets',
  'diamond-jewellery': 'diamond_jewellery',
  'mens-jewellery': 'mens_jewellery',
};

export default function CollectionPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const category = categorySlug ? categoryRouteMap[categorySlug] : undefined;

  const [weightRange, setWeightRange] = useState<[number, number]>([0, 200]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [metalFilter, setMetalFilter] = useState<string>('all');

  const { data: products, isLoading } = useProducts({
    category,
    metalType: metalFilter !== 'all' ? metalFilter as any : undefined,
    minWeight: weightRange[0] > 0 ? weightRange[0] : undefined,
    maxWeight: weightRange[1] < 200 ? weightRange[1] : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
  });

  // Sort products
  const sortedProducts = [...(products || [])].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.calculated_price.total - b.calculated_price.total;
      case 'price-high':
        return b.calculated_price.total - a.calculated_price.total;
      case 'weight-low':
        return a.weight_grams - b.weight_grams;
      case 'weight-high':
        return b.weight_grams - a.weight_grams;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const categoryName = category ? CATEGORY_NAMES[category] : 'All Jewellery';

  const hasActiveFilters = metalFilter !== 'all' || weightRange[0] > 0 || weightRange[1] < 200 || priceRange[0] > 0 || priceRange[1] < 1000000;

  const clearAllFilters = () => {
    setMetalFilter('all');
    setWeightRange([0, 200]);
    setPriceRange([0, 1000000]);
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=400&fit=crop"
            alt={categoryName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rich-black/80 to-rich-black/40" />
        </div>
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div>
            <span className="text-gold-light text-sm uppercase tracking-[0.3em]">Collection</span>
            <h1 className="font-serif text-4xl md:text-5xl text-ivory font-semibold mt-2">
              {categoryName}
            </h1>
            <p className="text-ivory/70 mt-2 max-w-md">
              Discover our exquisite collection of handcrafted {categoryName.toLowerCase()}, 
              each piece a testament to timeless elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </p>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="weight-low">Weight: Low to High</SelectItem>
                  <SelectItem value="weight-high">Weight: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Metal Type */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Metal Type</Label>
                      <Select value={metalFilter} onValueChange={setMetalFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All metals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Metals</SelectItem>
                          <SelectItem value="gold_22k">22K Gold</SelectItem>
                          <SelectItem value="gold_24k">24K Gold</SelectItem>
                          <SelectItem value="gold_18k">18K Gold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Weight Range */}
                    <div>
                      <Label className="text-sm font-medium mb-4 block">
                        Weight Range: {weightRange[0]}g - {weightRange[1]}g
                      </Label>
                      <Slider
                        value={weightRange}
                        onValueChange={(value) => setWeightRange(value as [number, number])}
                        min={0}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <Label className="text-sm font-medium mb-4 block">
                        Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        min={0}
                        max={1000000}
                        step={10000}
                        className="mt-2"
                      />
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {metalFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  {metalFilter.replace('_', ' ').toUpperCase()}
                  <button onClick={() => setMetalFilter('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(weightRange[0] > 0 || weightRange[1] < 200) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  Weight: {weightRange[0]}g - {weightRange[1]}g
                  <button onClick={() => setWeightRange([0, 200])}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm">
                  Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <button onClick={() => setPriceRange([0, 1000000])}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button 
                onClick={clearAllFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid
            products={sortedProducts}
            isLoading={isLoading}
            emptyMessage={`No ${categoryName.toLowerCase()} found matching your criteria`}
          />
        </div>
      </section>
    </Layout>
  );
}
