import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Masila Mani',
    rating: 5,
    text: 'Been customer for the past 30 years since my grandma introduced us. Best service, best price, best quality and best design. Enjoyed shopping 916 hallmarked Jewellery.',
    date: '1 month ago',
    verified: true,
  },
  {
    id: 2,
    name: 'Zeenath Nisha',
    rating: 5,
    text: 'Bought 916 KDM chain and earrings. Best finishing, great discount. Highly recommend for anyone looking for quality gold jewellery.',
    date: '2 years ago',
    verified: true,
  },
  {
    id: 3,
    name: 'Manju Uma',
    rating: 5,
    text: 'Best store for fancy and trending light weight 916 jewellery. Best service and wonderful collection!',
    date: '1 month ago',
    verified: true,
  },
  {
    id: 4,
    name: 'Selvi Kumar',
    rating: 5,
    text: 'Got a gold stud here was very satisfied with their service as they had a personal touch. Also had superb designs and collection.',
    date: '2 years ago',
    verified: true,
  },
  {
    id: 5,
    name: 'Gnanesh Divine',
    rating: 5,
    text: 'We have been coming to this shop for more than 15 years. They are our trusted jewellers and they have wonderful designs and collections.',
    date: '2 years ago',
    verified: true,
  },
  {
    id: 6,
    name: 'Puganesh Ganesh',
    rating: 5,
    text: 'At KRT finding a perfect chain was a breeze. Their designs are not just cute but also friendly. The service was top notch with staff who genuinely cares.',
    date: '1 year ago',
    verified: true,
  },
  {
    id: 7,
    name: 'Rani Arumugam',
    rating: 5,
    text: "New to KRT, but already hooked! Their collection is irresistible, and the prices are unbeatable. It's more than a store. Can't wait to explore more!",
    date: '1 year ago',
    verified: true,
  },
  {
    id: 8,
    name: 'Mathan R',
    rating: 5,
    text: 'KRT Jewellers has been our family favorite shop for three generations now. Their collection is simply unmatched with exquisite 916 BIS Hallmarked gold jewelry at the best prices.',
    date: '1 year ago',
    verified: true,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export function CustomerReviews() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const averageRating = 5.0;
  const totalReviews = 286;

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (direction === 'next') {
        if (!api.canScrollNext()) {
          setDirection('prev');
          api.scrollPrev();
          return;
        }
        api.scrollNext();
        return;
      }

      if (!api.canScrollPrev()) {
        setDirection('next');
        api.scrollNext();
        return;
      }
      api.scrollPrev();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, direction]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/20 to-secondary/40 relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-14">
          <span className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-[0.3em] font-medium">
            <span className="w-8 h-px bg-primary" />
            Testimonials
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium section-heading">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from families who trust KRT for every milestone.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-primary text-primary" />
              ))}
            </div>
            <span className="font-serif text-3xl font-bold text-primary">{averageRating}</span>
          </div>
          <p className="text-muted-foreground">
            Based on {totalReviews} verified Google reviews
          </p>
        </div>

        {/* Reviews Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-card rounded-xl p-6 h-full flex flex-col shadow-soft">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />

                  {/* Rating */}
                  <StarRating rating={review.rating} />

                  {/* Review Text */}
                  <p className="mt-4 text-foreground/80 flex-1 line-clamp-4">
                    {review.text}
                  </p>

                  {/* Author */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.name}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="relative inset-auto translate-y-0" />
            <CarouselNext className="relative inset-auto translate-y-0" />
          </div>
        </Carousel>

        {/* Google Reviews Link */}
        <div className="text-center mt-8">
          <a
            href="https://www.google.com/search?q=krt+jewellers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            See all reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}
