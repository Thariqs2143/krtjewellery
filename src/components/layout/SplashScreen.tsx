import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start exit animation after delay
    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 2000);

    // Complete after animation finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-rich-black transition-transform duration-700 ease-in-out ${
        isAnimating ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      {/* Logo Container */}
      <div className="relative animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-px bg-primary" />
        
        {/* Main Logo Text */}
        <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-wider">
          <span className="text-gold-gradient">KRT</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-center font-serif text-xl md:text-2xl tracking-[0.3em] text-ivory/80 mt-2">
          JEWELS
        </p>
        
        {/* Tagline */}
        <p className="text-center text-xs md:text-sm tracking-[0.2em] text-primary/70 mt-6 uppercase">
          Elegance Redefined
        </p>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-px bg-primary" />
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
