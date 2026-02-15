import { useState } from 'react';
import { ShoppingBag, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { AuthPromptModal } from '@/components/product/AuthPromptModal';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  className?: string;
  showText?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  className = '',
  showText = true,
  size = 'default',
  onSuccess
}: AddToCartButtonProps) {
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setIsAnimating(true);
    addToCart({ productId, quantity });
    
    setTimeout(() => {
      setIsAdded(true);
      setIsAnimating(false);
      onSuccess?.();
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 500);
  };

  return (
    <>
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        size={size}
        className={cn(
          'btn-premium gap-2 relative overflow-hidden transition-all duration-300',
          isAnimating && 'animate-pulse',
          isAdded && 'bg-green-600 hover:bg-green-700',
          className
        )}
      >
        <span className={cn(
          'flex items-center gap-2 transition-transform duration-300',
          isAnimating && 'translate-x-full opacity-0',
          isAdded && 'translate-x-0 opacity-100'
        )}>
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              {showText && <span>Added!</span>}
            </>
          ) : !isAuthenticated ? (
            <>
              <Lock className={cn('w-4 h-4')} />
              {showText && (
                <span className="hidden sm:inline">Sign In</span>
              )}
            </>
          ) : (
            <>
              <ShoppingBag className={cn(
                'w-4 h-4 transition-transform',
                isAnimating && 'animate-bounce'
              )} />
              {showText && (
                <span className="hidden sm:inline">Add to Cart</span>
              )}
            </>
          )}
        </span>
        
        {/* Cart animation overlay */}
        {isAnimating && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-slide-in-right text-lg">🛒</span>
          </span>
        )}
      </Button>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action="add items to your cart"
      />
    </>
  );
}
