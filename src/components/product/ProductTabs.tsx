import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductWithPrice } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';

interface ProductTabsProps {
  product: ProductWithPrice;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['product-details']));
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const sections = [
    {
      id: 'product-details',
      icon: FileText,
      title: 'Product Details',
      content: (
        <div className="space-y-4">
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium">{product.weight_grams}g</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Purity</span>
              <span className="font-medium">{product.metal_type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-medium">{product.sku || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Hallmark</span>
              <span className="font-medium">BIS Certified</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'price-breakdown',
      icon: Award,
      title: 'Price Breakdown',
      content: (
        <div className="space-y-2.5 max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gold Value ({product.weight_grams}g)</span>
            <span>₹{product.calculated_price.gold_value.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Making Charges ({product.making_charge_percent || 12}%)</span>
            <span>₹{product.calculated_price.making_charges.toLocaleString('en-IN')}</span>
          </div>
          {product.diamond_cost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diamond Cost</span>
              <span>₹{product.diamond_cost.toLocaleString('en-IN')}</span>
            </div>
          )}
          {product.stone_cost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stone Cost</span>
              <span>₹{product.stone_cost.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{product.calculated_price.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST ({gstRate}%)</span>
            <span>₹{product.calculated_price.gst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-primary/30">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-serif font-bold text-primary">
              ₹{product.calculated_price.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'certificate',
      icon: ShieldCheck,
      title: 'Certificate & Authenticity',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'BIS Hallmark Certified', desc: 'Guaranteeing purity and authenticity of the gold.' },
            { title: 'Certificate of Authenticity', desc: 'Includes weight, purity, and making charges.' },
            { title: 'Detailed Invoice', desc: 'Itemized breakdown for gold, making charges, and taxes.' },
            { title: 'Lifetime Exchange', desc: '100% gold value buyback and lifetime exchange.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'manufacturer',
      icon: FileText,
      title: 'Manufacturer & Origin',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Manufacturer', 'KRT Jewels'],
            ['Country', 'India'],
            ['Imported By', 'N/A (Domestic)'],
            ['Packer', 'KRT Jewels'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-border last:border-b-0">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
          >
            <span className="font-medium text-sm">{section.title}</span>
            {expandedSections.has(section.id) ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              expandedSections.has(section.id) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-4 pb-4">{section.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
