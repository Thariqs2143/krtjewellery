import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingContactMenu } from '@/components/ui/FloatingContactMenu';
import { ComparisonBar } from '@/components/products/ComparisonBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContactMenu />
      <ComparisonBar />
    </div>
  );
}
