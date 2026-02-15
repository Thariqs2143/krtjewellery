import { useState, useEffect } from 'react';
import { ZoomIn, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string | null;
  variationImageUrl?: string | null;
  badges?: {
    isNewArrival?: boolean;
    isBestseller?: boolean;
    isBridal?: boolean;
  };
  onOpenLightbox: (index: number) => void;
}

// Helper to detect if a URL is a video
const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  const lowercaseUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowercaseUrl.includes(ext)) || 
         lowercaseUrl.includes('youtube') || 
         lowercaseUrl.includes('vimeo');
};

export function ProductImageGallery({
  images,
  productName,
  videoUrl,
  variationImageUrl,
  badges,
  onOpenLightbox,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // When a variation image is provided, show it first in the grid
  const displayImages = variationImageUrl
    ? [variationImageUrl, ...images.filter(img => img !== variationImageUrl)]
    : images;

  useEffect(() => {
    setSelectedImage(0);
  }, [variationImageUrl]);

  const mediaItems: Array<{ type: 'image' | 'video'; url: string; index?: number }> = [
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
    ...displayImages.map((url, index) => ({ type: 'image' as const, url, index })),
  ];

  return (
    <div className="space-y-4">
      {/* Mobile: single image with dots */}
      <div className="block md:hidden">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20 group"
          onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX == null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX;
            const delta = touchStartX - endX;
            const threshold = 40;
            if (Math.abs(delta) > threshold) {
              if (delta > 0) {
                setSelectedImage((prev) =>
                  prev === displayImages.length - 1 ? 0 : prev + 1
                );
              } else {
                setSelectedImage((prev) =>
                  prev === 0 ? displayImages.length - 1 : prev - 1
                );
              }
            }
            setTouchStartX(null);
          }}
        >
          <img
            src={displayImages[selectedImage] || '/placeholder.svg'}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onClick={() => onOpenLightbox(selectedImage)}
          />
          <div className="absolute inset-0 bg-rich-black/0 group-hover:bg-rich-black/10 transition-colors flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
              <ZoomIn className="w-5 h-5 text-foreground" />
            </div>
          </div>
          {selectedImage === 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {badges?.isNewArrival && (
                <Badge className="badge-luxury">✨ New Arrival</Badge>
              )}
              {badges?.isBestseller && (
                <Badge className="bg-accent text-accent-foreground">🔥 Bestseller</Badge>
              )}
              {badges?.isBridal && (
                <Badge className="bg-maroon text-ivory">💍 Bridal</Badge>
              )}
            </div>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {displayImages.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  selectedImage === index ? 'bg-primary' : 'bg-border'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: two-column grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mediaItems.map((item, idx) => {
          if (item.type === 'video') {
            return (
              <div
                key={`video-${idx}`}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg">
                    <Play className="w-5 h-5 text-foreground" />
                  </div>
                </div>
                <video
                  src={item.url}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              </div>
            );
          }

          const imageIndex = item.index ?? 0;
          return (
            <button
              key={`image-${imageIndex}`}
              type="button"
              className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20 group"
              onClick={() => {
                setSelectedImage(imageIndex);
                onOpenLightbox(imageIndex);
              }}
            >
              <img
                src={item.url || '/placeholder.svg'}
                alt={`${productName} - Image ${imageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-rich-black/0 group-hover:bg-rich-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                  <ZoomIn className="w-5 h-5 text-foreground" />
                </div>
              </div>
              {imageIndex === 0 && (
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {badges?.isNewArrival && (
                    <Badge className="badge-luxury">✨ New Arrival</Badge>
                  )}
                  {badges?.isBestseller && (
                    <Badge className="bg-accent text-accent-foreground">🔥 Bestseller</Badge>
                  )}
                  {badges?.isBridal && (
                    <Badge className="bg-maroon text-ivory">💍 Bridal</Badge>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
