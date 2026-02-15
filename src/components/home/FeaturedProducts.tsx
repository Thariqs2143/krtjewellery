import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-14">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium mb-3">
              <span className="w-8 h-px bg-primary" />
              Curated Selection
              <span className="w-8 h-px bg-primary hidden md:block" />
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold section-heading">
              Featured Pieces
            </h2>
          </div>
          <Link to="/shop">
            <Button
              variant="outline"
              className="group border-primary/30 text-foreground hover:text-foreground hover:border-primary hover:bg-primary/5 rounded-full px-6"
            >
              View All Collection
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Products */}
        <ProductGrid 
          products={products?.slice(0, 8) || []} 
          isLoading={isLoading}
          emptyMessage="No featured products available"
        />
      </div>
    </section>
  );
}
