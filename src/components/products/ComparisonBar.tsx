import { Link } from 'react-router-dom';
import { X, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { cn } from '@/lib/utils';

export function ComparisonBar() {
  const { products, removeProduct, clearAll } = useProductComparison();

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">
              Compare ({products.length}/3)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative flex items-center gap-2 bg-secondary rounded-lg px-3 py-2"
              >
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
                  {product.name}
                </span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Empty slots */}
            {[...Array(3 - products.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-16 h-14 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground">+</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Link to="/compare">
              <Button size="sm" className="gap-2" disabled={products.length < 2}>
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
