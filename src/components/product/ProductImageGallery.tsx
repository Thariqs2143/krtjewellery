import { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, Star, Gem } from 'lucide-react';
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

  const LensImage = ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [lens, setLens] = useState({ x: 0, y: 0, visible: false });
    const [zoom, setZoom] = useState(3.2);
    const [lensSize, setLensSize] = useState(160);
    const pinchDistanceRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const updateLensFromPoint = (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      setLens({ x: xPercent, y: yPercent, visible: true });
    };

    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
      updateLensFromPoint(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touch = event.touches[0];
      if (!touch) return;
      updateLensFromPoint(touch.clientX, touch.clientY);

      if (event.touches.length >= 2) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        const distance = Math.hypot(dx, dy);
        if (pinchDistanceRef.current) {
          const delta = distance - pinchDistanceRef.current;
          const nextZoom = Math.min(Math.max(2.6, zoom + delta * 0.005), 5.5);
          setZoom(nextZoom);
        }
        pinchDistanceRef.current = distance;
      }
    };

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length >= 2) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        pinchDistanceRef.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchEnd = () => {
      pinchDistanceRef.current = null;
      setLens((prev) => ({ ...prev, visible: false }));
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full select-none",
          isDragging ? "cursor-grabbing" : "cursor-crosshair"
        )}
        onMouseEnter={(e) => updateLensFromPoint(e.clientX, e.clientY)}
        onMouseMove={handleMove}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          updateLensFromPoint(e.clientX, e.clientY);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => {
          setIsDragging(false);
          setLens((prev) => ({ ...prev, visible: false }));
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {lens.visible && (
          <div
            className="absolute rounded-full border border-white/80 shadow-xl bg-white pointer-events-none"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `calc(${lens.x}% - ${lensSize / 2}px)`,
              top: `calc(${lens.y}% - ${lensSize / 2}px)`,
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `${lens.x}% ${lens.y}%`,
              backgroundSize: `${zoom * 100}%`,
            }}
          />
        )}
      </div>
    );
  };

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
          <LensImage
            src={displayImages[selectedImage] || '/placeholder.svg'}
            alt={`${productName} - Image ${selectedImage + 1}`}
          />
          {selectedImage === 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {badges?.isNewArrival && (
                <Badge className="badge-luxury w-8 h-8 p-0 rounded-full flex items-center justify-center" title="New Arrival">
                  <Sparkles className="w-4 h-4" />
                </Badge>
              )}
              {badges?.isBestseller && (
                <Badge className="bg-accent text-accent-foreground w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bestseller">
                  <Star className="w-4 h-4" />
                </Badge>
              )}
              {badges?.isBridal && (
                <Badge className="bg-maroon text-ivory w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bridal">
                  <Gem className="w-4 h-4" />
                </Badge>
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

      {/* Desktop: grid or single image */}
      {mediaItems.length === 1 && mediaItems[0]?.type === 'image' ? (
        <button
          type="button"
          className="hidden md:block relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20 group"
          onClick={() => onOpenLightbox(mediaItems[0]?.index ?? 0)}
        >
          <LensImage
            src={mediaItems[0]?.url || '/placeholder.svg'}
            alt={`${productName} - Image 1`}
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {badges?.isNewArrival && (
              <Badge className="badge-luxury w-8 h-8 p-0 rounded-full flex items-center justify-center" title="New Arrival">
                <Sparkles className="w-4 h-4" />
              </Badge>
            )}
            {badges?.isBestseller && (
              <Badge className="bg-accent text-accent-foreground w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bestseller">
                <Star className="w-4 h-4" />
              </Badge>
            )}
            {badges?.isBridal && (
              <Badge className="bg-maroon text-ivory w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bridal">
                <Gem className="w-4 h-4" />
              </Badge>
            )}
          </div>
        </button>
      ) : (
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
                <LensImage
                  src={item.url || '/placeholder.svg'}
                  alt={`${productName} - Image ${imageIndex + 1}`}
                />
                {imageIndex === 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {badges?.isNewArrival && (
                      <Badge className="badge-luxury w-8 h-8 p-0 rounded-full flex items-center justify-center" title="New Arrival">
                        <Sparkles className="w-4 h-4" />
                      </Badge>
                    )}
                    {badges?.isBestseller && (
                      <Badge className="bg-accent text-accent-foreground w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bestseller">
                        <Star className="w-4 h-4" />
                      </Badge>
                    )}
                    {badges?.isBridal && (
                      <Badge className="bg-maroon text-ivory w-8 h-8 p-0 rounded-full flex items-center justify-center" title="Bridal">
                        <Gem className="w-4 h-4" />
                      </Badge>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
