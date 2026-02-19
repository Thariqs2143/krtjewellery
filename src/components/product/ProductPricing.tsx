import { formatPrice } from '@/lib/types';
import { Tag } from 'lucide-react';
import type { CalculatedPrice } from '@/lib/types';

interface ProductPricingProps {
  calculatedPrice: CalculatedPrice;
  quantity: number;
}

export function ProductPricing({ calculatedPrice, quantity }: ProductPricingProps) {
  const totalPrice = calculatedPrice.total * quantity;

  return (
    <div className="space-y-2">
      {/* Main Price — Angara: large bold with MRP */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          {formatPrice(totalPrice)}
        </span>
        <span className="text-xs text-muted-foreground">(incl. of all taxes)</span>
      </div>

      {/* Exclusive Offer */}
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
        <Tag className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs text-foreground">
          Exclusive Offer: Flat ₹1,000 off on first purchase!
        </span>
      </div>

    </div>
  );
}
