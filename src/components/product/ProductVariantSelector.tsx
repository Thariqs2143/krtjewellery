import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  METAL_TYPE_NAMES, 
  CATEGORY_SIZE_OPTIONS,
  type MetalType, 
  type ProductCategory,
} from '@/lib/types';
import { useProductVariations } from '@/hooks/useProductVariations';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductVariantSelectorProps {
  productId: string;
  category: ProductCategory;
  baseMetalType: MetalType;
  baseWeightGrams: number;
  specifications: Record<string, any> | null;
  onVariationChange?: (variation: { 
    metalType: string; 
    size: string | null;
    priceAdjustment: number;
    weightAdjustment: number;
    imageUrl: string | null;
    selectedOptions?: {
      gemstoneQuality?: string | string[] | null;
      caratWeight?: string | string[] | null;
      certificates?: string[];
      addOns?: string[];
      metalType: string;
      size?: string | null;
    };
  }) => void;
}

// Metal type options with colors
const METAL_OPTIONS: { type: MetalType; label: string; color: string }[] = [
  { type: 'gold_24k', label: '24K Yellow Gold', color: 'bg-amber-400' },
  { type: 'gold_22k', label: '22K Yellow Gold', color: 'bg-amber-500' },
  { type: 'gold_18k', label: '18K White Gold', color: 'bg-gray-200' },
  { type: 'silver', label: 'Sterling Silver', color: 'bg-slate-200' },
  { type: 'platinum', label: 'Platinum', color: 'bg-slate-300' },
];

export function ProductVariantSelector({
  productId,
  category,
  baseMetalType,
  baseWeightGrams,
  specifications,
  onVariationChange,
}: ProductVariantSelectorProps) {
  const { data: variations = [], isLoading } = useProductVariations(productId);

  // (debug logs moved below after computed options)
  
  const [selectedMetal, setSelectedMetal] = useState<string>(baseMetalType);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedGemstone, setSelectedGemstone] = useState<string>('');
  const [selectedCarat, setSelectedCarat] = useState<string>('');
  const [selectedGemstones, setSelectedGemstones] = useState<string[]>([]);
  const [selectedCarats, setSelectedCarats] = useState<string[]>([]);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedCustomAddons, setSelectedCustomAddons] = useState<string[]>([]);
  const [isEngravingOpen, setIsEngravingOpen] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingFont, setEngravingFont] = useState<'script' | 'block'>('script');

  // Get variations by type
  const sizeVariations = variations.filter(v => v.variation_type === 'size');
  const metalVariations = variations.filter(v => v.variation_type === 'metal_type');
  const gemstoneVariations = variations.filter(v => v.variation_type === 'gemstone_quality');
  const caratVariations = variations.filter(v => v.variation_type === 'carat_weight');
  const certificateVariations = variations.filter(v => v.variation_type === 'certificate');
  const customVariations = variations.filter(v => v.variation_type === 'custom');

  const categoryConfig = CATEGORY_SIZE_OPTIONS[category];
  const hasSizeVariations = sizeVariations.length > 0;
  const hasMetalVariations = metalVariations.length > 0;
  const hasGemstoneVariations = gemstoneVariations.length > 0;
  const hasCaratVariations = caratVariations.length > 0;
  const hasCertificateVariations = certificateVariations.length > 0;
  const hasCustomVariations = customVariations.length > 0;

  const sizeOptions = hasSizeVariations 
    ? sizeVariations.filter(v => v.is_available).map(v => ({
        value: v.size_value || '',
        label: v.size_label || '',
        priceAdjustment: v.price_adjustment || 0,
        weightAdjustment: v.weight_adjustment || 0,
        stock: v.stock_quantity || 0,
        isDefault: v.is_default,
        imageUrl: v.image_url || null,
      }))
    : categoryConfig?.sizes.map(s => ({
        value: s,
        label: categoryConfig.label,
        priceAdjustment: 0,
        weightAdjustment: 0,
        stock: 1,
        isDefault: false,
        imageUrl: null,
      })) || [];

  const metalColorMap: Partial<Record<MetalType, string>> = {
    gold_24k: 'bg-amber-400',
    gold_22k: 'bg-amber-500',
    gold_18k: 'bg-gray-200',
    silver: 'bg-slate-200',
    platinum: 'bg-slate-300',
  };

  const availableMetals = hasMetalVariations
    ? metalVariations
        .filter(v => v.is_available)
        .map(v => ({
          value: v.id,
          label:
            v.metal_label ||
            (v.metal_type ? METAL_TYPE_NAMES[v.metal_type as MetalType] : null) ||
            v.size_label ||
            v.size_value ||
            'Metal',
          metalType: v.metal_type || baseMetalType,
          priceAdjustment: v.price_adjustment || 0,
          weightAdjustment: v.weight_adjustment || 0,
          isDefault: v.is_default || false,
          imageUrl: v.image_url || null,
          color: v.metal_type ? metalColorMap[v.metal_type as MetalType] || 'bg-secondary' : 'bg-secondary',
        }))
    : METAL_OPTIONS.map(m => ({
        value: m.type,
        label: m.label,
        metalType: m.type,
        color: m.color,
        priceAdjustment: 0,
        weightAdjustment: 0,
        isDefault: m.type === baseMetalType,
        imageUrl: null,
      }));

  const sizeLabel = categoryConfig?.label || 'Size';

  const isUuidLike = (value?: string | null) =>
    !!value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  const looksLikeUrl = (value?: string | null) => !!value && /^https?:\/\//i.test(value);

  const normalizeLabel = (label?: string | null, value?: string | null) => {
    const trimmedLabel = label?.trim();
    if (trimmedLabel) return trimmedLabel;
    if (value && !isUuidLike(value) && !looksLikeUrl(value)) return value;
    return 'Option';
  };

  const inferImageUrl = (explicit: string | null, fallbackA?: string | null, fallbackB?: string | null) => {
    if (explicit) return explicit;
    if (looksLikeUrl(fallbackA)) return fallbackA as string;
    if (looksLikeUrl(fallbackB)) return fallbackB as string;
    return null;
  };

  const gemstoneOptions = hasGemstoneVariations
    ? gemstoneVariations.filter(v => v.is_available).map(v => ({
        value: v.size_value || v.size_label || v.id,
        label: normalizeLabel(v.size_label || v.size_value || v.metal_label || '', v.size_value || v.size_label || v.id),
        priceAdjustment: v.price_adjustment || 0,
        weightAdjustment: v.weight_adjustment || 0,
        isDefault: v.is_default,
        imageUrl: inferImageUrl(v.image_url || null, v.size_value, v.size_label),
        selectionMode: v.selection_mode || 'single',
        groupLabel: v.variation_group || 'Gemstone Quality',
      }))
    : [];

  const caratOptions = hasCaratVariations
    ? caratVariations.filter(v => v.is_available).map(v => ({
        value: v.size_value || v.size_label || v.id,
        label: normalizeLabel(v.size_label || v.size_value || '', v.size_value || v.size_label || v.id),
        priceAdjustment: v.price_adjustment || 0,
        weightAdjustment: v.weight_adjustment || 0,
        isDefault: v.is_default,
        imageUrl: inferImageUrl(v.image_url || null, v.size_value, v.size_label),
        selectionMode: v.selection_mode || 'single',
        groupLabel: v.variation_group || 'Total Carat Weight',
      }))
    : [];

  const certificateOptions = hasCertificateVariations
    ? certificateVariations.filter(v => v.is_available).map(v => ({
        value: v.id,
        label: normalizeLabel(v.size_label || v.size_value || '', v.id),
        priceAdjustment: v.price_adjustment || 0,
        imageUrl: inferImageUrl(v.image_url || null, v.size_value, v.size_label),
        isDefault: v.is_default,
        selectionMode: v.selection_mode || 'single',
        groupLabel: v.variation_group || 'Add Certificate',
      }))
    : [];

  const customOptions = hasCustomVariations
    ? customVariations.filter(v => v.is_available).map(v => ({
        value: v.id,
        label: normalizeLabel(v.size_label || v.size_value || '', v.id),
        priceAdjustment: v.price_adjustment || 0,
        imageUrl: inferImageUrl(v.image_url || null, v.size_value, v.size_label),
        isDefault: v.is_default,
        selectionMode: v.selection_mode || 'multi',
        groupLabel: v.variation_group || 'Add Ons',
      }))
    : [];

  // Debug: log variations and computed options to help diagnose issues
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('ProductVariantSelector debug', { productId, variations, sizeOptions, availableMetals });
  }

  // Set default selections
  useEffect(() => {
    if (availableMetals.length > 0 && !selectedMetal) {
      const defaultMetal = availableMetals.find(m => m.isDefault) || availableMetals[0];
      if (defaultMetal) {
        setSelectedMetal(defaultMetal.value);
      }
    }
  }, [availableMetals, selectedMetal]);

  useEffect(() => {
    if (sizeOptions.length > 0 && !selectedSize) {
      const defaultSize = sizeOptions.find(s => s.isDefault) || sizeOptions[0];
      if (defaultSize) {
        setSelectedSize(defaultSize.value);
      }
    }
  }, [sizeOptions]);

  useEffect(() => {
    if (gemstoneOptions.length > 0 && !selectedGemstone) {
      const defaultGem = gemstoneOptions.find(g => g.isDefault) || gemstoneOptions[0];
      if (defaultGem) {
        setSelectedGemstone(defaultGem.value);
        if (defaultGem.selectionMode === 'multi') {
          setSelectedGemstones([defaultGem.value]);
        }
      }
    }
  }, [gemstoneOptions]);

  useEffect(() => {
    if (caratOptions.length > 0 && !selectedCarat) {
      const defaultCarat = caratOptions.find(c => c.isDefault) || caratOptions[0];
      if (defaultCarat) {
        setSelectedCarat(defaultCarat.value);
        if (defaultCarat.selectionMode === 'multi') {
          setSelectedCarats([defaultCarat.value]);
        }
      }
    }
  }, [caratOptions]);

  useEffect(() => {
    if (certificateOptions.length > 0 && selectedCertificates.length === 0) {
      const defaults = certificateOptions.filter(c => c.isDefault).map(c => c.value);
      if (defaults.length > 0) {
        setSelectedCertificates(defaults);
      }
    }
  }, [certificateOptions]);

  useEffect(() => {
    if (customOptions.length > 0 && selectedCustomAddons.length === 0) {
      const defaults = customOptions.filter(c => c.isDefault).map(c => c.value);
      if (defaults.length > 0) {
        setSelectedCustomAddons(defaults);
      }
    }
  }, [customOptions]);

  useEffect(() => {
    const selectedMetalOption = availableMetals.find(m => m.value === selectedMetal);
    const selectedSizeOption = sizeOptions.find(s => s.value === selectedSize);
    const gemstoneIsMulti = gemstoneOptions[0]?.selectionMode === 'multi';
    const caratIsMulti = caratOptions[0]?.selectionMode === 'multi';
    const selectedGemOption = gemstoneOptions.find(g => g.value === selectedGemstone);
    const selectedCaratOption = caratOptions.find(c => c.value === selectedCarat);
    const selectedGemOptions = gemstoneIsMulti
      ? gemstoneOptions.filter(g => selectedGemstones.includes(g.value))
      : selectedGemOption
      ? [selectedGemOption]
      : [];
    const selectedCaratOptions = caratIsMulti
      ? caratOptions.filter(c => selectedCarats.includes(c.value))
      : selectedCaratOption
      ? [selectedCaratOption]
      : [];
    const selectedCertOptions = certificateOptions.filter(c => selectedCertificates.includes(c.value));
    const selectedCustomOptions = customOptions.filter(c => selectedCustomAddons.includes(c.value));
    const engravingOption = customOptions.find(c =>
      c.label.toLowerCase().includes('engraving') || c.value.toLowerCase().includes('engraving')
    );
    const engravingSelected = engravingOption ? selectedCustomAddons.includes(engravingOption.value) : false;

    // Only use metal/size images to swap the main product image.
    // Gemstone/carat/certificate/add-on images are for swatches only.
    const imageUrl =
      selectedMetalOption?.imageUrl ||
      selectedSizeOption?.imageUrl ||
      null;

    const certificatePrice = selectedCertOptions.reduce((sum, cert) => sum + (cert.priceAdjustment || 0), 0);
    const customPrice = selectedCustomOptions.reduce((sum, opt) => sum + (opt.priceAdjustment || 0), 0);
    const gemstonePrice = selectedGemOptions.reduce((sum, g) => sum + (g.priceAdjustment || 0), 0);
    const caratPrice = selectedCaratOptions.reduce((sum, c) => sum + (c.priceAdjustment || 0), 0);

    const gemstoneSelectionLabels = selectedGemOptions.map(g => g.label);
    const caratSelectionLabels = selectedCaratOptions.map(c => c.label);

    onVariationChange?.({
      metalType: selectedMetalOption?.label || METAL_TYPE_NAMES[baseMetalType] || selectedMetal,
      size: selectedSize || null,
      priceAdjustment:
        (selectedMetalOption?.priceAdjustment || 0) +
        (selectedSizeOption?.priceAdjustment || 0) +
        gemstonePrice +
        caratPrice +
        certificatePrice +
        customPrice,
      weightAdjustment: (selectedMetalOption?.weightAdjustment || 0) + (selectedSizeOption?.weightAdjustment || 0),
      imageUrl,
      selectedOptions: {
        gemstoneQuality: gemstoneIsMulti
          ? gemstoneSelectionLabels
          : selectedGemOption?.label || selectedGemOption?.value || null,
        caratWeight: caratIsMulti
          ? caratSelectionLabels
          : selectedCaratOption?.label || selectedCaratOption?.value || null,
        certificates: selectedCertOptions.map((cert) => cert.label),
        addOns: selectedCustomOptions.map((opt) => opt.label),
        engraving: engravingSelected && engravingText.trim()
          ? { text: engravingText.trim(), font: engravingFont }
          : undefined,
        metalType: selectedMetalOption?.label || METAL_TYPE_NAMES[baseMetalType] || selectedMetal,
        size: selectedSize || null,
      },
    });
  }, [
    selectedMetal,
    selectedSize,
    selectedGemstone,
    selectedCarat,
    selectedCertificates,
    selectedGemstones,
    selectedCarats,
    selectedCustomAddons,
    engravingText,
    engravingFont,
  ]);

  const selectedMetalOption = availableMetals.find(m => m.value === selectedMetal);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-16 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Gemstone Quality */}
      {gemstoneOptions.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              {gemstoneOptions[0]?.groupLabel || 'Gemstone Quality'}
              {(() => {
                const labels = gemstoneOptions[0]?.selectionMode === 'multi'
                  ? gemstoneOptions.filter(g => selectedGemstones.includes(g.value)).map(g => g.label || g.value)
                  : gemstoneOptions.find(g => g.value === selectedGemstone)?.label
                  ? [gemstoneOptions.find(g => g.value === selectedGemstone)!.label]
                  : gemstoneOptions.find(g => g.value === selectedGemstone)?.value
                  ? [String(gemstoneOptions.find(g => g.value === selectedGemstone)!.value)]
                  : [];
                return labels.length > 0 ? (
                  <>
                    {': '}
                    <span className="text-primary font-semibold">{labels.join(', ')}</span>
                  </>
                ) : null;
              })()}
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {gemstoneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (option.selectionMode === 'multi') {
                    setSelectedGemstones((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((id) => id !== option.value)
                        : [...prev, option.value]
                    );
                  } else {
                    setSelectedGemstone(option.value);
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md border-2 px-2 py-1.5 transition-all',
                  (option.selectionMode === 'multi'
                    ? selectedGemstones.includes(option.value)
                    : selectedGemstone === option.value)
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="w-10 h-10 rounded overflow-hidden bg-secondary/40 flex items-center justify-center">
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt={option.label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {(option.label || option.value || '•').toString().slice(0, 1)}
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">{option.label || option.value || 'Option'}</span>
                {option.isDefault && (
                  <span className="text-[9px] text-primary font-medium">Most Loved</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Total Carat Weight */}
      {caratOptions.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              {caratOptions[0]?.groupLabel || 'Total Carat Weight'}
              {(() => {
                const labels = caratOptions[0]?.selectionMode === 'multi'
                  ? caratOptions.filter(c => selectedCarats.includes(c.value)).map(c => c.label)
                  : caratOptions.find(c => c.value === selectedCarat)?.label
                  ? [caratOptions.find(c => c.value === selectedCarat)!.label]
                  : [];
                return labels.length > 0 ? (
                  <>
                    {': '}
                    <span className="text-primary font-semibold">{labels.join(', ')}</span>
                  </>
                ) : null;
              })()}
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {caratOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (option.selectionMode === 'multi') {
                    setSelectedCarats((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((id) => id !== option.value)
                        : [...prev, option.value]
                    );
                  } else {
                    setSelectedCarat(option.value);
                  }
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md border-2 px-2 py-1.5 transition-all',
                  (option.selectionMode === 'multi'
                    ? selectedCarats.includes(option.value)
                    : selectedCarat === option.value)
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="w-10 h-10 rounded overflow-hidden bg-secondary/40 flex items-center justify-center">
                  {option.imageUrl ? (
                    <img src={option.imageUrl} alt={option.label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{option.label}</span>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground">{option.label}</span>
                {option.isDefault && (
                  <span className="text-[9px] text-primary font-medium">Most Loved</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metal Type Selector — Angara style with image swatches */}
      {availableMetals.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              Metal Type:{' '}
              <span className="text-primary font-semibold">
                {selectedMetalOption?.label || METAL_TYPE_NAMES[baseMetalType]}
              </span>
            </label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 pr-1 -mr-1 flex-nowrap">
            {availableMetals.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMetal(option.value)}
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-lg border-2 transition-all duration-200 p-1 shrink-0 w-[70px]',
                  selectedMetal === option.value
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/50'
                )}
                // ensure pointer events in case parent overlays exist
                aria-pressed={selectedMetal === option.value}
                data-metal-type={option.metalType}
                style={{ zIndex: 1 }}
              >
                {/* Show image if available, otherwise show color swatch */}
                {option.imageUrl ? (
                  <div className="w-10 h-10 rounded overflow-hidden">
                    <img 
                      src={option.imageUrl} 
                      alt={option.label} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={cn('w-10 h-10 rounded flex items-center justify-center', option.color)}>
                    {selectedMetal === option.value && (
                      <Check className="w-4 h-4 text-foreground/80" />
                    )}
                  </div>
                )}
                <span className="text-[9px] text-muted-foreground leading-tight text-center max-w-[64px]">
                  {option.label}
                </span>
                {option.priceAdjustment !== 0 && (
                  <span className="text-[8px] text-muted-foreground">
                    {option.priceAdjustment > 0 ? '+' : ''}₹{option.priceAdjustment.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector — Angara style compact pills */}
      {sizeOptions.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              {sizeLabel}
              {selectedSize && <span className="text-primary font-semibold ml-1">: {selectedSize}</span>}
            </label>
            <button 
              className="text-[10px] text-primary hover:underline"
              onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setSelectedSize(size.value)}
                disabled={size.stock <= 0}
                className={cn(
                  'relative rounded-md border-2 transition-all duration-200 overflow-hidden',
                  selectedSize === size.value
                    ? 'border-primary shadow-md'
                    : size.stock <= 0
                    ? 'border-border bg-muted opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {/* Show image if available, otherwise show text pill */}
                {size.imageUrl ? (
                  <div className="flex flex-col items-center p-1">
                    <div className="w-10 h-10 rounded overflow-hidden">
                      <img src={size.imageUrl} alt={size.value} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-medium mt-0.5">{size.value}</span>
                  </div>
                ) : (
                  <div className="min-w-[34px] h-8 px-2.5 flex items-center justify-center">
                    <span className="text-[10px] font-medium">{size.value}</span>
                  </div>
                )}
                {size.priceAdjustment !== 0 && (
                  <span className="text-[8px] text-muted-foreground block text-center pb-0.5">
                    {size.priceAdjustment > 0 ? '+' : ''}₹{Math.abs(size.priceAdjustment)}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Size Guide Collapsible */}
          <Collapsible open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
            <CollapsibleContent className="mt-4">
              <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
                {category === 'rings' && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Ring Size Guide</p>
                    <p>Measure the inside diameter of a ring that fits you, then match it to our size chart.</p>
                  </div>
                )}
                {category === 'bangles' && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Bangle Size Guide</p>
                    <p>Measure your hand at its widest point (knuckles) with your thumb tucked in.</p>
                  </div>
                )}
                {(category === 'necklaces' || category === 'chains') && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Chain Length Guide</p>
                    <ul className="space-y-1">
                      <li>16" - Choker length</li>
                      <li>18" - Princess length, most popular</li>
                      <li>20-22" - Matinee length</li>
                      <li>24-30" - Opera length</li>
                    </ul>
                  </div>
                )}
                {category === 'bracelets' && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Bracelet Size Guide</p>
                    <p>Measure your wrist and add 0.5" to 1" for comfort.</p>
                  </div>
                )}
                {!['rings', 'bangles', 'necklaces', 'chains', 'bracelets'].includes(category) && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Size Information</p>
                    <p>Contact us for detailed sizing information.</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Add Certificate */}
      {certificateOptions.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              {certificateOptions[0]?.groupLabel || 'Add Certificate'}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {certificateOptions.map((cert) => {
              const isMulti = cert.selectionMode === 'multi';
              const selected = selectedCertificates.includes(cert.value);
              return (
                <button
                  key={cert.value}
                  type="button"
                  onClick={() => {
                    setSelectedCertificates((prev) => {
                      if (isMulti) {
                        return prev.includes(cert.value)
                          ? prev.filter((id) => id !== cert.value)
                          : [...prev, cert.value];
                      }
                      return prev.includes(cert.value) ? [] : [cert.value];
                    });
                  }}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md border-2 p-2 text-left transition-all',
                    selected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.label} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-secondary/40 flex items-center justify-center text-[10px]">
                        {cert.label.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px] font-medium">{cert.label}</span>
                  </div>
                  {cert.priceAdjustment !== 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      +₹{cert.priceAdjustment.toLocaleString('en-IN')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Ons */}
      {customOptions.length > 0 && (
        <div className="border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">
              {customOptions[0]?.groupLabel || 'Add Ons'}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {customOptions.map((opt) => {
              const isEngraving = opt.label.toLowerCase().includes('engraving') || opt.value.toLowerCase().includes('engraving');
              const isMulti = opt.selectionMode === 'multi';
              const selected = selectedCustomAddons.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (isEngraving) {
                      if (!selected) {
                        setSelectedCustomAddons((prev) => [...prev, opt.value]);
                      }
                      setIsEngravingOpen(true);
                      return;
                    }
                    setSelectedCustomAddons((prev) => {
                      if (isMulti) {
                        return prev.includes(opt.value)
                          ? prev.filter((id) => id !== opt.value)
                          : [...prev, opt.value];
                      }
                      return prev.includes(opt.value) ? [] : [opt.value];
                    });
                  }}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md border-2 p-2 text-left transition-all',
                    selected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {opt.imageUrl ? (
                      <img src={opt.imageUrl} alt={opt.label} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-secondary/40 flex items-center justify-center text-[10px]">
                        {opt.label.slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {opt.priceAdjustment === 0 && isEngraving && (
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">FREE</span>
                    )}
                    {opt.priceAdjustment !== 0 && (
                      <span className="text-xs text-muted-foreground">
                        +₹{opt.priceAdjustment.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-muted-foreground">+</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Engraving Modal */}
      <Dialog open={isEngravingOpen} onOpenChange={setIsEngravingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Free Engraving</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-28 rounded overflow-hidden bg-gradient-to-b from-zinc-200 to-zinc-100 border">
              <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_top,#f5f5f5,transparent_60%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={cn(
                    'text-lg text-zinc-800 select-none',
                    engravingFont === 'script' ? 'font-engrave-script' : 'font-engrave-block'
                  )}
                >
                  {engravingText.trim() || 'Your Text Here'}
                </span>
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted-foreground">
                Preview
              </div>
            </div>
            <div>
              <Label>Enter Text</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value.slice(0, 15))}
                  placeholder="Your Text Here"
                />
                <span className="text-xs text-muted-foreground">
                  {engravingText.length}/15
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={engravingFont === 'script' ? 'default' : 'outline'}
                onClick={() => setEngravingFont('script')}
                className={cn('px-4', engravingFont === 'script' ? '' : 'bg-transparent')}
              >
                <span className="font-engrave-script text-base">Aa</span>
              </Button>
              <Button
                type="button"
                variant={engravingFont === 'block' ? 'default' : 'outline'}
                onClick={() => setEngravingFont('block')}
                className={cn('px-4', engravingFont === 'block' ? '' : 'bg-transparent')}
              >
                <span className="font-engrave-block text-base">Aa</span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>*Engraved items are not eligible for exchange and returns.</p>
              <p>*An additional day will be added to the estimated delivery time for engraving.</p>
            </div>
            <Button
              type="button"
              className="w-full bg-black text-white"
              onClick={() => {
                const text = engravingText.trim();
                if (!text) {
                  setSelectedCustomAddons((prev) =>
                    prev.filter((id) =>
                      !customOptions.find((opt) => opt.value === id)?.label.toLowerCase().includes('engraving')
                    )
                  );
                  setEngravingText('');
                }
                setIsEngravingOpen(false);
              }}
            >
              Save Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight Display */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Net Weight</span>
        <span className="font-semibold">
          {(baseWeightGrams + 
            (availableMetals.find(m => m.type === selectedMetal)?.weightAdjustment || 0) +
            (sizeOptions.find(s => s.value === selectedSize)?.weightAdjustment || 0)
          ).toFixed(2)} grams
        </span>
      </div>
    </div>
  );
}
