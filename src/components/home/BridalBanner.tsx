import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function BridalBanner() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=1920&h=800&fit=crop"
          alt="Bridal Collection"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/95 via-maroon/80 to-maroon/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon/60 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-8 right-8 w-32 h-32 border border-primary/20 rounded-full hidden lg:block" />
      <div className="absolute bottom-12 right-24 w-20 h-20 border border-primary/30 rounded-full hidden lg:block" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-primary" />
            <span className="text-primary text-sm uppercase tracking-[0.3em] font-medium">
              Exclusive Collection
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ivory font-medium mb-6 leading-tight">
            <span className="text-glow">Wedding & Bridal</span>
          </h2>
          <p className="text-ivory/85 text-lg md:text-xl mb-10 max-w-md leading-relaxed">
            Make your special day unforgettable with our exquisite bridal sets. Each piece 
            is handcrafted to celebrate the beginning of your beautiful journey.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/collections/wedding-sets">
              <Button className="btn-premium text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full shadow-xl">
                Explore Bridal Sets
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full border-2 border-ivory/50 text-ivory bg-ivory/5 backdrop-blur-sm hover:bg-ivory hover:text-maroon transition-all"
              >
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
