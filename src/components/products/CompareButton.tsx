import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useToast } from '@/hooks/use-toast';
import type { ProductWithPrice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
  product: ProductWithPrice;
  variant?: 'icon' | 'full';
  className?: string;
}

export function CompareButton({ product, variant = 'icon', className }: CompareButtonProps) {
  const { addProduct, removeProduct, isInComparison } = useProductComparison();
  const { toast } = useToast();
  const isComparing = isInComparison(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComparing) {
      removeProduct(product.id);
      toast({
        title: 'Removed from comparison',
        description: `${product.name} removed from comparison`,
      });
    } else {
      const added = addProduct(product);
      if (added) {
        toast({
          title: 'Added to comparison',
          description: `${product.name} added. Compare up to 3 products.`,
        });
      } else {
        toast({
          title: 'Comparison limit reached',
          description: 'You can compare up to 3 products. Remove one to add another.',
          variant: 'destructive',
        });
      }
    }
  };

  if (variant === 'full') {
    return (
      <Button
        variant={isComparing ? 'secondary' : 'outline'}
        className={cn('gap-2', className)}
        onClick={handleClick}
      >
        <Scale className="w-4 h-4" />
        {isComparing ? 'Remove from Compare' : 'Compare'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full',
        isComparing && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      onClick={handleClick}
    >
      <Scale className="w-4 h-4" />
    </Button>
  );
}
