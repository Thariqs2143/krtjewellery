import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronDown, User, MapPin, Phone, Package, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMegamenu, useMegamenuSettings } from '@/hooks/useMegamenu';
import { buildFallbackMegamenu, getCategoryHref, buildShopLinkFromRules } from '@/lib/megamenuUtils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { name: 'Login / Sign Up', href: '/auth', icon: User },
  { name: 'My Account', href: '/account', icon: User },
  { name: 'Track Your Order', href: '/track-order', icon: Package },
  { name: 'Gold Rates', href: '/gold-rate', icon: Sparkles },
  { name: 'My Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Store Locator', href: '/stores', icon: MapPin },
  { name: 'Contact Us', href: '/contact', icon: Phone },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: megamenu } = useMegamenu();
  const { data: megamenuSettings } = useMegamenuSettings();
  const isMegamenuEnabled = megamenuSettings?.is_enabled !== false;
  const megamenuData =
    megamenu && megamenu.length > 0 ? megamenu : buildFallbackMegamenu();

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-rich-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-background shadow-luxury animate-slide-in-left overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 flex items-center justify-between p-4 border-b">
          <Link to="/" onClick={onClose} className="font-serif text-lg font-medium tracking-[0.15em] text-foreground whitespace-nowrap">
            KRT JEWELLERS
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Section */}
        {isAuthenticated ? (
          <div className="p-4 bg-secondary/30 border-b">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="font-medium truncate">{user?.email}</p>
          </div>
        ) : null}

        {/* Categories from Megamenu */}
        <div className="py-4">
          <nav className="space-y-0">
            <button
              onClick={() => handleNavigation('/shop')}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <span className="font-medium text-sm">Shop All</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            {megamenuData.map((category) => (
              <button
                key={category.id}
                onClick={() => handleNavigation(getCategoryHref(category.category_slug))}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 transition-colors group"
              >
                <span className="font-medium text-sm">{category.category_name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </nav>
        </div>

        <div className="h-px bg-border mx-4" />

        {/* Quick Links */}
        <div className="py-4">
          <h3 className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">Account & Support</h3>
          <nav className="space-y-0">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              // Auth-aware quick links
              if (item.name === 'Login / Sign Up' && isAuthenticated) return null;
              if (item.name === 'My Account' && !isAuthenticated) return null;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => {
                signOut();
                onClose();
              }}
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
