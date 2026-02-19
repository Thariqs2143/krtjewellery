import { useGoldRate } from '@/hooks/useGoldRate';
import { formatPrice } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function GoldRateWidget() {
  const { data: goldRate, isLoading, isError } = useGoldRate();

  if (isLoading) {
    return (
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex items-center justify-center gap-8">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="h-8 w-40 bg-muted rounded" />
          </div>
        </div>
      </section>
    );
  }

  // Show fallback UI when no rate available instead of returning null
  if (!goldRate || isError) {
    return (
      <section className="py-8 md:py-10 bg-gradient-to-r from-rich-black via-charcoal to-rich-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-ivory/60">
            <p className="text-sm">Gold rates temporarily unavailable. Check back soon.</p>
            <Link to="/gold-rate" className="text-primary underline text-sm mt-2 inline-block">
              View rate history
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-10 bg-gradient-to-r from-rich-black via-charcoal to-rich-black relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
          {/* Left - Title */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Live</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-ivory font-medium">Today's Gold Rate</h3>
            <p className="text-ivory/50 text-sm mt-1">
              Updated: {new Date(goldRate.effective_date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Center - Rates */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-10 w-full lg:w-auto">
            {/* 22K Rate */}
            <div className="text-center px-5 py-4 rounded-2xl bg-ivory/5 backdrop-blur-sm border border-ivory/10 w-full md:w-auto">
              <span className="text-primary text-[11px] uppercase tracking-[0.2em] font-semibold">22K Gold</span>
              <div className="flex items-baseline justify-center gap-1.5 mt-2">
                <span className="font-semibold text-2xl md:text-4xl text-gold-gradient">
                  {formatPrice(goldRate.rate_22k)}
                </span>
                <span className="text-ivory/40 text-xs">/gram</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-16 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

            {/* 24K Rate */}
            <div className="text-center px-5 py-4 rounded-2xl bg-ivory/5 backdrop-blur-sm border border-ivory/10 w-full md:w-auto">
              <span className="text-primary text-[11px] uppercase tracking-[0.2em] font-semibold">24K Gold</span>
              <div className="flex items-baseline justify-center gap-1.5 mt-2">
                <span className="font-semibold text-2xl md:text-4xl text-gold-gradient">
                  {formatPrice(goldRate.rate_24k)}
                </span>
                <span className="text-ivory/40 text-xs">/gram</span>
              </div>
            </div>
          </div>

          {/* Right - CTA */}
          <Link to="/gold-rate" className="w-full lg:w-auto">
            <Button className="rounded-full px-8 py-6 shadow-xl bg-gold-shimmer text-rich-black font-semibold hover:brightness-110 w-full lg:w-auto">
              View Rate History
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
