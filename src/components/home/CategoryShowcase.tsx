import { Link } from 'react-router-dom';
import { CATEGORY_NAMES } from '@/lib/types';

const categories = [
  {
    id: 'necklaces',
    name: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
  },
  {
    id: 'earrings',
    name: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop',
  },
  {
    id: 'rings',
    name: 'Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=800&fit=crop',
  },
  {
    id: 'bangles',
    name: 'Bangles',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
  },
  {
    id: 'wedding_sets',
    name: 'Wedding Sets',
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=800&fit=crop',
  },
  {
    id: 'diamond_jewellery',
    name: 'Diamonds',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-pattern-lines opacity-20" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium mb-3">
            <span className="w-8 h-px bg-primary" />
            Explore
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium section-heading mb-4">
            Our Collections
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated categories to match every celebration and style.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/collections/${category.id.replace('_', '-')}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden card-luxury"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-rich-black/80 via-rich-black/20 to-transparent" />
              
              {/* Gold border effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 border-2 border-primary/50 rounded-xl" />
              </div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <h3 className="font-serif text-lg md:text-xl text-ivory font-medium group-hover:text-gold-light transition-colors">
                  {category.name}
                </h3>
                <span className="text-ivory/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View Collection
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
