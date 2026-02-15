import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X } from 'lucide-react';

interface StockBadgeProps {
  stockQuantity: number | null;
  threshold?: number;
  showCount?: boolean;
  className?: string;
}

export function StockBadge({ 
  stockQuantity, 
  threshold = 5, 
  showCount = false,
  className 
}: StockBadgeProps) {
  const stock = stockQuantity ?? 0;
  
  if (stock <= 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive',
        className
      )}>
        <X className="w-3 h-3" />
        Out of Stock
      </span>
    );
  }
  
  if (stock <= threshold) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
        className
      )}>
        <AlertTriangle className="w-3 h-3" />
        {showCount ? `Only ${stock} left` : 'Low Stock'}
      </span>
    );
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700',
      className
    )}>
      <Check className="w-3 h-3" />
      In Stock
    </span>
  );
}
