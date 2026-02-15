import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { AuthPromptModal } from './AuthPromptModal';
import { formatPrice } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { ProductWithPrice } from '@/lib/types';

interface ProductActionsProps {
  product: ProductWithPrice;
  variationState?: {
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
  } | null;
}

export function ProductActions({ product, variationState }: ProductActionsProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = (product.stock_quantity ?? 1) <= 0;
  const maxQuantity = product.stock_quantity ?? 99;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setAuthAction('add items to your cart');
      setShowAuthModal(true);
      return;
    }
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      quantity,
      variation: {
        priceAdjustment: variationState?.priceAdjustment || 0,
        weightAdjustment: variationState?.weightAdjustment || 0,
        imageUrl: variationState?.imageUrl || null,
        selectedOptions: variationState?.selectedOptions || null,
      },
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      setAuthAction('save items to your wishlist');
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleWhatsAppEnquiry = () => {
    const message = `Hi KRT Jewels! I'm interested in the ${product.name} (${formatPrice(product.calculated_price.total)}). Can you please provide more details?`;
    window.open(`https://wa.me/919843010986?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div className="space-y-3">
        {/* Stock alerts */}
        {isOutOfStock ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
            <p className="text-destructive font-semibold text-sm">Out of Stock</p>
          </div>
        ) : (product.stock_quantity ?? 0) <= 5 && (product.stock_quantity ?? 0) > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
            <p className="text-amber-700 font-medium text-xs">
              Only {product.stock_quantity} left – order soon!
            </p>
          </div>
        ) : null}

        {/* Angara-style: Wishlist + Price + ADD TO BAG inline */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={isToggling}
            className={cn(
              'h-12 w-12 rounded-lg border-2 flex-shrink-0 transition-all',
              inWishlist 
                ? 'bg-red-50 border-red-300 text-red-600' 
                : 'hover:border-primary'
            )}
          >
            <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
          </Button>

          {/* Price display */}
          <div className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-center">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {formatPrice((product.calculated_price.total + (variationState?.priceAdjustment || 0)) * quantity)}
            </span>
            {quantity > 1 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({formatPrice(product.calculated_price.total + (variationState?.priceAdjustment || 0))} × {quantity})
              </span>
            )}
          </div>

          {/* ADD TO BAG button */}
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={cn(
              'h-12 px-6 font-semibold rounded-lg transition-all flex-shrink-0',
              isAdded 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-foreground hover:bg-foreground/90 text-background'
            )}
          >
            {isAdded ? (
              <><Check className="w-4 h-4 mr-1" /> Added</>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <><ShoppingBag className="w-4 h-4 mr-1" /> ADD TO BAG</>
            )}
          </Button>
        </div>

        {/* Mobile sticky action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-foreground text-background border-t border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleWishlist}
              disabled={isToggling}
              className={cn(
                'h-12 w-12 rounded-lg border-2 flex-shrink-0 transition-all bg-background text-foreground',
                inWishlist
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'hover:border-primary'
              )}
            >
              <Heart className={cn('w-5 h-5', inWishlist && 'fill-current')} />
            </Button>

            <div className="flex-1 rounded-lg px-3 py-2 text-center">
              <span className="text-base font-semibold tracking-tight text-background">
                {formatPrice((product.calculated_price.total + (variationState?.priceAdjustment || 0)) * quantity)}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={cn(
                'h-12 px-4 font-semibold rounded-lg transition-all flex-shrink-0 bg-foreground text-background border border-background',
                isAdded
                  ? 'bg-green-600 hover:bg-green-700 text-white border-none'
                  : 'hover:bg-foreground/90'
              )}
            >
              {isAdded ? (
                <><Check className="w-4 h-4 mr-1" /> Added</>
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                <><ShoppingBag className="w-4 h-4 mr-1" /> ADD TO BAG</>
              )}
            </Button>
          </div>
        </div>

        {/* Quantity selector — compact inline */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Qty:</span>
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="h-8 w-8 rounded-l-lg rounded-r-none"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity || isOutOfStock}
              className="h-8 w-8 rounded-r-lg rounded-l-none"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            Order Now for estimated delivery by{' '}
            <span className="font-semibold text-foreground">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </span>
        </div>

        {/* WhatsApp Enquiry */}
        <Button
          variant="outline"
          onClick={handleWhatsAppEnquiry}
          className="w-full py-5 gap-2 rounded-lg border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 font-semibold text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Enquire on WhatsApp
        </Button>
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
      />
    </>
  );
}
