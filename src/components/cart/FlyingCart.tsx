import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { useFreeShippingSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/types';

interface FlyingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlyingCart({ isOpen, onClose }: FlyingCartProps) {
  const { items, itemCount, total, updateQuantity, removeFromCart } = useCart();
  const { data: shippingSettings } = useFreeShippingSettings();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const freeShippingThreshold = shippingSettings?.amount ?? 50000;
  const freeShippingEnabled = shippingSettings?.enabled ?? true;
  const amountRemaining = Math.max(0, freeShippingThreshold - total);
  const progressPercent = Math.min(100, (total / freeShippingThreshold) * 100);
  const hasFreeShipping = total >= freeShippingThreshold;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-rich-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Cart Sidebar - Opens from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-luxury flex flex-col animate-cart-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg font-semibold">Shopping Cart</span>
            <span className="text-sm text-muted-foreground">({itemCount} items)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Free Shipping Progress */}
        {freeShippingEnabled && items.length > 0 && (
          <div className="px-4 py-3 bg-secondary/30 border-b">
            {hasFreeShipping ? (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">🎉 You've unlocked free shipping!</span>
              </div>
            ) : (
              <>
                <div className="text-sm mb-2">
                  Add <span className="text-primary font-semibold">{formatPrice(amountRemaining)}</span> to get{' '}
                  <span className="font-semibold text-green-600">free shipping!</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Link to="/collections/necklaces" onClick={onClose}>
                <Button className="mt-4 btn-premium">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-secondary/30 rounded-lg">
                <img
                  src={item.product.images[0] || '/placeholder.svg'}
                  alt={item.product.name}
                  loading="lazy"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.product.weight_grams}g</p>
                  <p className="text-primary font-semibold mt-1">
                    {formatPrice(item.product.calculated_price.total)}
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-destructive hover:text-destructive ml-auto"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-serif text-xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasFreeShipping && freeShippingEnabled ? (
                <span className="text-green-600 font-medium">✓ Free shipping applied!</span>
              ) : (
                'Shipping calculated at checkout'
              )}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/cart" onClick={onClose}>
                <Button variant="outline" className="w-full">View Cart</Button>
              </Link>
              <Link to="/checkout" onClick={onClose}>
                <Button className="w-full btn-premium">Checkout</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
