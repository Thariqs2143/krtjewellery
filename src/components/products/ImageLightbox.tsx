import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
    setPanOffset({ x: 0, y: 0 });
  };

  const clampPan = (x: number, y: number) => {
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return { x, y };
    const rect = wrapper.getBoundingClientRect();
    const scale = 2;
    const maxX = Math.max(0, (rect.width * (scale - 1)) / 2);
    const maxY = Math.max(0, (rect.height * (scale - 1)) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    e.preventDefault();
    isPanningRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed || !isPanningRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    setPanOffset((prev) => clampPan(prev.x + dx, prev.y + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    isPanningRef.current = false;
    lastPointerRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-rich-black/95 backdrop-blur-sm">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Zoom toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-16 z-50 text-white hover:bg-white/10"
        onClick={toggleZoom}
      >
        {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </Button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 w-12 h-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/10 w-12 h-12"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-16"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          ref={imageWrapperRef}
          className={cn(
            'relative max-w-full max-h-full overflow-hidden rounded-lg',
            isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          )}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={isZoomed ? { touchAction: 'none' } : undefined}
        >
          <img
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            className={cn(
              'max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-300',
              isZoomed && 'will-change-transform'
            )}
            style={isZoomed ? {
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(2)`,
            } : undefined}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); setIsZoomed(false); }}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary ring-2 ring-primary/50'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              )}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
