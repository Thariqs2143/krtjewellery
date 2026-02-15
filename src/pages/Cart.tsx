import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const { items, subtotal, gstTotal, total, isLoading, updateQuantity, removeFromCart, itemCount } = useCart();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;
  const { isAuthenticated } = useAuth();
  const formatSelectedValue = (value: any) => {
    if (value && typeof value === 'object' && 'text' in value && 'font' in value) {
      return `${value.text} (${value.font})`;
    }
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-3xl mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Please sign in to view your cart</p>
          <Link to="/auth">
            <Button className="btn-premium">Sign In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl mb-8">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-3xl mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some beautiful jewellery to get started</p>
          <Link to="/collections/necklaces">
            <Button className="btn-premium">Browse Collections</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <div className="w-32 h-32 bg-secondary/30">
                      <img
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item.product.slug}`} className="hover:text-primary">
                        <h3 className="font-serif text-lg font-semibold line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {(item.product.weight_grams + (item.variation_weight_adjustment || 0)).toFixed(2)}g •{' '}
                        {formatPrice(item.product.calculated_price.gold_rate_applied)}/g
                      </p>
                      {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          {Object.entries(item.selected_variations).map(([key, value]) => (
                            <div key={key} className="flex gap-1">
                              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span>{formatSelectedValue(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <p className="price-tag text-lg font-semibold text-primary">
                        {formatPrice(
                          (item.product.calculated_price.total + (item.variation_price_adjustment || 0)) *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="m-2 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({gstRate}%)</span>
                  <span>{formatPrice(gstTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="divider-gold" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="price-tag text-primary text-xl">{formatPrice(total)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Link to="/checkout" className="w-full">
                  <Button className="btn-premium w-full py-6 gap-2">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/collections/necklaces" className="w-full">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
