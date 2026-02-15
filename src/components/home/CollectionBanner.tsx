import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CollectionBanner() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gold Collection Banner */}
          <Link 
            to="/collections/necklaces"
            className="group relative overflow-hidden rounded-3xl h-[400px] md:h-[500px]"
          >
            <img
              src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&h=600&fit=crop"
              alt="Gold Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rich-black/80 via-rich-black/40 to-transparent" />
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Premium Collection
              </span>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-ivory mb-4">
                22K Gold<br />Masterpieces
              </h3>
              <p className="text-ivory/80 mb-6 max-w-md">
                Discover our exquisite collection of handcrafted gold jewellery, designed for the modern connoisseur.
              </p>
              <Button className="btn-premium w-fit group/btn">
                Explore Gold Collection
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </Link>

          {/* Right Column - Two Smaller Banners */}
          <div className="flex flex-col gap-6">
            {/* Diamond Banner */}
            <Link 
              to="/collections/diamond-jewellery"
              className="group relative overflow-hidden rounded-3xl h-[190px] md:h-[237px]"
            >
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=300&fit=crop"
                alt="Diamond Collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-rich-black/70 to-transparent" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-primary text-xs uppercase tracking-widest font-medium mb-2">
                  Brilliance Redefined
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ivory mb-2">
                  Diamond Collection
                </h3>
                <span className="text-ivory/70 text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Wedding Banner */}
            <Link 
              to="/collections/wedding-sets"
              className="group relative overflow-hidden rounded-3xl h-[190px] md:h-[237px]"
            >
              <img
                src="https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=600&h=300&fit=crop"
                alt="Wedding Collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-maroon/80 to-transparent" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-gold-light text-xs uppercase tracking-widest font-medium mb-2">
                  Bridal 2025
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-ivory mb-2">
                  Wedding Collection
                </h3>
                <span className="text-ivory/70 text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                  View Bridal Sets <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
