import { ReactNode, useEffect, useRef, useState } from 'react';
import { hardResetPWA } from '@/lib/pwaRecovery';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingContactMenu } from '@/components/ui/FloatingContactMenu';
import { ComparisonBar } from '@/components/products/ComparisonBar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { authReady } = useAuth();
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0) return;
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const currentY = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = currentY - touchStartY.current;
      if (delta > 0) {
        setPullDistance(Math.min(delta, 120));
      }
    };

    const onTouchEnd = () => {
      if (pullDistance > 80) {
        void hardResetPWA('pull-to-refresh');
      }
      setPullDistance(0);
      touchStartY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-transform"
        style={{ transform: `translateY(${pullDistance - 60}px)` }}
      >
        {pullDistance > 0 && (
          <div className="px-3 py-1 rounded-full bg-rich-black text-ivory text-xs shadow-lg">
            {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        )}
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContactMenu />
      <ComparisonBar />
    </div>
  );
}
