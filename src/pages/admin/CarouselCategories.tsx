import { Link } from 'react-router-dom';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_view_all: boolean;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Rings', slug: 'rings', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', is_view_all: false },
  { id: '2', name: 'Necklaces', slug: 'necklaces', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop', is_view_all: false },
  { id: '3', name: 'Earrings', slug: 'earrings', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop', is_view_all: false },
  { id: '4', name: 'Bangles', slug: 'bangles', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&h=200&fit=crop', is_view_all: false },
  { id: '5', name: 'Bracelets', slug: 'bracelets', image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop', is_view_all: false },
  { id: '6', name: 'Chains', slug: 'chains', image_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&h=200&fit=crop', is_view_all: false },
  { id: '7', name: 'Pendants', slug: 'pendants', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', is_view_all: false },
  { id: '8', name: 'Wedding Sets', slug: 'wedding-bridal', image_url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=200&h=200&fit=crop', is_view_all: false },
  { id: '9', name: 'Diamond', slug: 'diamond-jewellery', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop', is_view_all: false },
  { id: '10', name: "Men's", slug: 'mens-jewellery', image_url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop', is_view_all: false },
  { id: '11', name: 'View All', slug: 'shop', image_url: null, is_view_all: true },
];

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const dragAxisRef = useRef<'x' | 'y' | null>(null);

  const { data: categories = defaultCategories } = useQuery({
    queryKey: ['carouselCategories'],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as { from: (table: string) => any })
        .from('carousel_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) {
        console.error('Error fetching carousel categories:', error);
        return defaultCategories;
      }
      // Return default categories if none found in database
      return (data && data.length > 0 ? data : defaultCategories) as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if scrolling is needed
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        setShowArrows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = 120;
      
      if (direction === 'right') {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (container.scrollLeft <= 10) {
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !showArrows) return;

    autoPlayRef.current = setInterval(() => {
      scroll('right');
    }, 3000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, scroll, showArrows]);

  const handleInteractionStart = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleInteractionEnd = () => {
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    dragScrollLeftRef.current = scrollRef.current.scrollLeft;
    dragAxisRef.current = null;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    if (!isDraggingRef.current || !scrollRef.current) return;
    const deltaX = event.clientX - dragStartXRef.current;
    const deltaY = event.clientY - dragStartYRef.current;
    if (!dragAxisRef.current && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
      dragAxisRef.current = Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y';
    }
    if (dragAxisRef.current === 'y') {
      isDraggingRef.current = false;
      return;
    }
    if (Math.abs(deltaX) > 4) {
      didDragRef.current = true;
    }
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - deltaX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    isDraggingRef.current = false;
    dragAxisRef.current = null;
    setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  return (
    <section className="py-4 md:py-6 bg-background border-b">
      <div className="w-full px-4 md:px-8">
        <div className="relative">
          {/* Scroll Buttons - Only show if content overflows */}
          {/* Categories Container - Spread evenly on large screens */}
          <div
            ref={scrollRef}
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="flex gap-4 sm:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-6 snap-x snap-mandatory lg:flex-nowrap lg:justify-start lg:gap-4 lg:overflow-x-auto cursor-grab active:cursor-grabbing touch-pan-y"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.filter((category) => !category.is_view_all).map((category) => (
              <Link
                key={category.slug}
                to={`/collections/${category.slug}`}
                className="flex-shrink-0 lg:flex-shrink group snap-start"
                onClick={(event) => {
                  if (didDragRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                  }
                  handleInteractionStart();
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  {/* Circular Image Container */}
                  <div className="w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-2xl border-2 border-transparent group-hover:border-primary overflow-hidden transition-all duration-300 group-hover:shadow-gold group-hover:scale-105">
                    <img 
                      src={category.image_url || '/placeholder.svg'} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                  {/* Category Name */}
                  <span className="text-xs sm:text-xs md:text-sm font-medium text-center whitespace-nowrap group-hover:text-primary transition-colors select-none">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
