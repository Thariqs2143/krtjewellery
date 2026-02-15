import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useProduct, useBestsellerProducts } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { CATEGORY_NAMES } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ImageLightbox } from '@/components/products/ImageLightbox';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector';
import { ProductPricing } from '@/components/product/ProductPricing';
import { ProductActions } from '@/components/product/ProductActions';
import { ProductTabs } from '@/components/product/ProductTabs';
import { TrustPromise } from '@/components/product/TrustPromise';
import { StockBadge } from '@/components/product/StockBadge';
import { ProductReviews } from '@/components/products/ProductReviews';
import { ChevronRight, Shield, RefreshCw, Truck, Award, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MetalType } from '@/lib/types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || '');
  const { data: relatedProducts } = useBestsellerProducts();
  const { addToRecentlyViewed, getRecentlyViewed } = useRecentlyViewed();
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<any[]>([]);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [variationState, setVariationState] = useState<{
    metalType: string;
    size: string | null;
    priceAdjustment: number;
    weightAdjustment: number;
    imageUrl: string | null;
    selectedOptions?: {
      gemstoneQuality?: string | string[] | null;
      caratWeight?: string | string[] | null;
      certificates?: string[];
      addOns?: string[];
      metalType: string;
      size?: string | null;
    };
  } | null>(null);

  // Track product view on load
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      // Update recently viewed list (excluding current product)
      const viewed = getRecentlyViewed().filter(item => item.id !== product.id);
      setRecentlyViewedItems(viewed);
    }
  }, [product?.id]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-medium mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button className="btn-premium">Browse Collections</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-foreground">Jewellery</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/collections/${product.category.replace('_', '-')}`} className="hover:text-foreground">
              {CATEGORY_NAMES[product.category]}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section — Angara two-column */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left — Image Gallery */}
            <ProductImageGallery
              images={product.images.length > 0 ? product.images : ['/placeholder.svg']}
              productName={product.name}
              videoUrl={(product as any).video_url}
              variationImageUrl={null}
              badges={{
                isNewArrival: product.is_new_arrival,
                isBestseller: product.is_bestseller,
              isBridal: product.is_bridal,
            }}
            onOpenLightbox={handleOpenLightbox}
          />

          {/* Right — Product Info */}
          <div className="space-y-4 pb-20 md:pb-0">
            {/* Title + SKU */}
            <div>
              <h1 className="text-lg md:text-xl font-medium leading-snug mb-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <StockBadge stockQuantity={product.stock_quantity} showCount />
                {product.sku && (
                  <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Price */}
            <ProductPricing
              calculatedPrice={{
                ...product.calculated_price,
                total: product.calculated_price.total + (variationState?.priceAdjustment || 0),
              }}
              quantity={1}
            />

            {/* Variant Selectors — image-based swatches */}
            <ProductVariantSelector
              productId={product.id}
              category={product.category}
              baseMetalType={product.metal_type}
              baseWeightGrams={product.weight_grams}
              specifications={product.specifications}
              onVariationChange={setVariationState}
            />

            {/* Actions (Wishlist + Price + Add to Bag) */}
            <ProductActions
              product={product}
              variationState={variationState}
            />

            {/* Why Shop With Us — Angara horizontal trust strip */}
            <div className="border border-border rounded-xl p-4">
              <h4 className="text-sm font-semibold mb-3">Why Shop With Us</h4>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { icon: Shield, label: 'BIS\nHallmark' },
                  { icon: RefreshCw, label: 'Exchange &\nBuyback' },
                  { icon: Truck, label: 'Free 15-day\nReturns' },
                  { icon: Award, label: 'KRT\nCertified' },
                  { icon: Star, label: 'Rated\n4.8/5' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight whitespace-pre-line">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordion Tabs */}
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Trust Promise full-width */}
      <TrustPromise />

      {/* Reviews */}
      <section className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-medium text-center mb-8">
            Verified Customer Reviews
          </h2>
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-12 bg-secondary/20 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-8">
              You May Also Like
            </h2>
            <Tabs defaultValue="bestsellers" className="w-full">
              <TabsList className="w-full justify-center mb-6 bg-transparent gap-2">
                <TabsTrigger value="bestsellers" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
                  Bestsellers
                </TabsTrigger>
                <TabsTrigger value="same-category" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4">
                  {CATEGORY_NAMES[product.category]}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bestsellers">
                <ProductGrid products={relatedProducts.filter(p => p.id !== product.id).slice(0, 5)} isLoading={false} />
              </TabsContent>
              <TabsContent value="same-category">
                <ProductGrid products={relatedProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 5)} isLoading={false} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewedItems.length > 0 && (
        <section className="py-12 bg-white border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-medium text-center mb-8">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {recentlyViewedItems.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className="group"
                >
                  <div className="relative bg-white rounded-lg overflow-hidden shadow-soft transition-all duration-300 hover:shadow-gold">
                    {/* Image */}
                    <div className="aspect-square bg-secondary overflow-hidden rounded-lg">
                      <img
                        src={item.images[0] || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {CATEGORY_NAMES[item.category]}
                      </p>
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.metal_type.replace('_', ' ').toUpperCase()} • {item.weight_grams}g
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={product.images.length > 0 ? product.images : ['/placeholder.svg']}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </Layout>
  );
}
