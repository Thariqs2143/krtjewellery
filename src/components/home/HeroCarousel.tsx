import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Timeless Elegance',
    subtitle: 'Wedding Collection 2025',
    description: 'Discover our exquisite bridal sets, handcrafted with love and tradition for your most special day.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop',
    cta: { text: 'Explore Bridal', href: '/collections/wedding-sets' },
  },
  {
    id: 2,
    title: 'Pure Gold Craftsmanship',
    subtitle: '22K Gold Collection',
    description: 'Every piece tells a story of heritage and mastery, passed down through generations of master artisans.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=1080&fit=crop',
    cta: { text: 'Shop Gold', href: '/collections/necklaces' },
  },
  {
    id: 3,
    title: 'Diamond Dreams',
    subtitle: 'Certified Diamond Jewellery',
    description: 'Brilliant cuts, exceptional clarity. Our diamonds are hand-selected for their unmatched brilliance.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=1080&fit=crop',
    cta: { text: 'View Diamonds', href: '/collections/diamond-jewellery' },
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[65vh] md:h-[85vh] overflow-hidden">
      {/* Background Images */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img 
            src={s.image}
            alt={s.title}
            loading={index === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-[8000ms] ease-out ${
              index === currentSlide ? 'scale-105' : 'scale-100'
            }`}
          />
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-rich-black/90 via-rich-black/60 to-rich-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-rich-black/50 via-transparent to-transparent" />
        </div>
      ))}

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse hidden lg:block" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-2xl hidden lg:block" />

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          {/* Premium Label */}
          <div 
            key={`subtitle-${currentSlide}`}
            className="inline-flex items-center gap-3 mb-6 animate-fade-in-up"
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-sm md:text-base uppercase tracking-[0.3em] font-medium">
              {slide.subtitle}
            </span>
          </div>
          
          <h1 
            key={`title-${currentSlide}`}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-ivory font-medium mb-6 animate-fade-in-up leading-tight"
            style={{ animationDelay: '100ms' }}
          >
            <span className="text-glow">{slide.title}</span>
          </h1>
          
          <p 
            key={`desc-${currentSlide}`}
            className="text-ivory/80 text-base md:text-xl mb-10 max-w-lg animate-fade-in-up leading-relaxed"
            style={{ animationDelay: '200ms' }}
          >
            {slide.description}
          </p>
          
          <div 
            key={`cta-${currentSlide}`}
            className="flex flex-wrap gap-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link to={slide.cta.href}>
              <Button className="btn-premium text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full font-medium shadow-xl hover:shadow-2xl transition-all">
                {slide.cta.text}
              </Button>
            </Link>
            <Link to="/gold-rate">
              <Button 
                variant="outline" 
                className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full border-2 border-ivory/40 text-ivory bg-ivory/5 backdrop-blur-sm hover:bg-ivory/15 hover:border-ivory/70 transition-all"
              >
                Today's Rate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-ivory/10 backdrop-blur-sm border border-ivory/20 flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-ivory/10 backdrop-blur-sm border border-ivory/20 flex items-center justify-center text-ivory hover:bg-ivory/20 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-10 md:w-12 bg-primary' 
                : 'w-5 md:w-6 bg-ivory/40 hover:bg-ivory/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 text-ivory/60 text-xs">
        <span className="writing-vertical tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-ivory/30 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-ivory animate-pulse" />
        </div>
      </div>
    </section>
  );
}
