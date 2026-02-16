import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, METAL_TYPE_NAMES } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { ProductCardSlider } from './ProductCardSlider';
import { AuthPromptModal } from '@/components/product/AuthPromptModal';
import type { ProductWithPrice } from '@/lib/types';

interface ProductCardProps {
  product: ProductWithPrice;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  
  const inWishlist = isInWishlist(product.id);
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

  const images = product.images.length > 0 ? product.images : ['/placeholder.svg'];
  const lowStockCount = product.stock_quantity ?? 0;
  const showLowStock = !isOutOfStock && lowStockCount > 0 && lowStockCount <= 5;

  return (
    <>
      <Link to={`/product/${product.slug}`} className="group block select-none">
        <div className={`bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border/80 transition-colors select-none cursor-default ${isOutOfStock ? 'opacity-75' : ''}`}>
          {/* Image Container with Slider */}
          <div className="relative aspect-[4/5] overflow-hidden bg-white">
            <ProductCardSlider images={images} productName={product.name} />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-rich-black/40 flex items-center justify-center z-20">
                <span className="bg-rich-black/80 text-ivory px-4 py-2 rounded-full text-sm font-semibold">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist - Minimal */}
            <Button
              variant="secondary"
              size="icon"
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full shadow-sm ${
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
          </div>

          {/* Content - Enhanced */}
          <div className="p-4 md:p-5 bg-white">
            {/* Category & Metal */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {METAL_TYPE_NAMES[product.metal_type]}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">
                {product.weight_grams}g
              </span>
            </div>

            {/* Name */}
            <h3 className="font-serif text-base md:text-lg font-semibold text-foreground line-clamp-2 mb-2 leading-snug">
              {product.name}
            </h3>

            {/* Tags - Below image to keep visuals clean */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.is_new_arrival && (
                <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border border-border text-foreground/80">
                  New
                </span>
              )}
              {product.is_bestseller && (
                <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border border-border text-foreground/80">
                  Bestseller
                </span>
              )}
              {product.is_bridal && (
                <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border border-border text-foreground/80">
                  Bridal
                </span>
              )}
              {showLowStock && (
                <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full border border-border text-foreground/80">
                  Only {lowStockCount} left
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
                {product.short_description}
              </p>
            )}

            {/* Price & Action */}
            <div className="pt-3 border-t border-border/50">
              <div>
                <p className="price-tag text-lg md:text-xl text-foreground font-semibold">
                  {formatPrice(product.calculated_price.total)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Incl. {formatPrice(product.calculated_price.gst)} GST ({gstRate}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="save items to your wishlist"
      />
    </>
  );
}
