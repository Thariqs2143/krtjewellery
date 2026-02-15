import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Heart, Eye, Scale, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useProductComparison } from '@/hooks/useProductComparison';
import { formatPrice, METAL_TYPE_NAMES } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { ProductCardSlider } from './ProductCardSlider';
import { StockBadge } from '@/components/product/StockBadge';
import { AuthPromptModal } from '@/components/product/AuthPromptModal';
import { useToast } from '@/hooks/use-toast';
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector';
import { ProductActions } from '@/components/product/ProductActions';
import type { ProductWithPrice } from '@/lib/types';

interface ProductCardProps {
  product: ProductWithPrice;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addProduct, removeProduct, isInComparison } = useProductComparison();
  const { toast } = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
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
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  
  const inWishlist = isInWishlist(product.id);
  const inComparison = isInComparison(product.id);
  const isOutOfStock = (product.stock_quantity ?? 1) <= 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inComparison) {
      removeProduct(product.id);
      toast({ title: 'Removed from comparison' });
    } else {
      const added = addProduct(product);
      if (!added) {
        toast({ title: 'Limit reached', description: 'You can compare up to 3 products', variant: 'destructive' });
      } else {
        toast({ title: 'Added to comparison' });
      }
    }
  };

  const images = product.images.length > 0 ? product.images : ['/placeholder.svg'];

  return (
    <>
      <Link to={`/product/${product.slug}`} className="group block select-none">
        <div className={`card-luxury bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-colors select-none cursor-default ${isOutOfStock ? 'opacity-75' : ''}`}>
          {/* Image Container with Slider */}
          <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20">
            <ProductCardSlider images={images} productName={product.name} />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-rich-black/40 flex items-center justify-center z-20">
                <span className="bg-rich-black/80 text-ivory px-4 py-2 rounded-full text-sm font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
            
            {/* Badges - Premium styling */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.is_new_arrival && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-primary to-gold-shimmer text-rich-black shadow-md">
                  ✨ New
                </span>
              )}
              {product.is_bestseller && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground shadow-md">
                  🔥 Bestseller
                </span>
              )}
              {product.is_bridal && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-maroon text-ivory shadow-md">
                  💍 Bridal
                </span>
              )}
              {/* Low Stock Badge */}
              {!isOutOfStock && (product.stock_quantity ?? 99) <= 5 && (
                <StockBadge stockQuantity={product.stock_quantity} showCount />
              )}
            </div>

            {/* Quick Actions - Premium styling */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleToggleWishlist}
                className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-md ${
                  inWishlist 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white/90 hover:bg-white text-foreground'
                }`}
              >
                {!isAuthenticated ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleToggleCompare}
                className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-md ${
                  inComparison 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-white/90 hover:bg-white text-foreground'
                }`}
              >
                <Scale className="w-4 h-4" />
              </Button>
            </div>

            {/* View Details Overlay - Enhanced */}
            <div className="absolute inset-0 bg-gradient-to-t from-rich-black/60 via-rich-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6 pointer-events-none z-[5]">
              <div className="flex items-center gap-2 text-ivory font-medium bg-primary/90 px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Eye className="w-4 h-4" />
                <span className="text-sm">View Details</span>
              </div>
            </div>
          </div>

          {/* Content - Enhanced */}
          <div className="p-4 md:p-5">
            {/* Category & Metal */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-primary font-medium uppercase tracking-wider">
                {METAL_TYPE_NAMES[product.metal_type]}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">
                {product.weight_grams}g
              </span>
            </div>

            {/* Name */}
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
                {product.short_description}
              </p>
            )}

            {/* Price & Action */}
            <div className="flex items-end justify-between pt-3 border-t border-border/50">
              <div>
                <p className="price-tag text-xl md:text-2xl text-primary font-bold">
                  {formatPrice(product.calculated_price.total)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Incl. {formatPrice(product.calculated_price.gst)} GST ({gstRate}%)
                </p>
              </div>

              {/* Add to Cart */}
              {!isOutOfStock && (
                <>
                  <Button
                    size="sm"
                    className="btn-premium hidden sm:inline-flex"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowQuickAdd(true);
                    }}
                  >
                    Select Options
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="sm:hidden"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowQuickAdd(true);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Add Modal */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select options for {product.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ProductVariantSelector
              productId={product.id}
              category={product.category}
              baseMetalType={product.metal_type}
              baseWeightGrams={product.weight_grams}
              onVariationChange={(state) => setVariationState(state)}
            />
            <ProductActions product={product} variationState={variationState} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="save items to your wishlist"
      />
    </>
  );
}
