import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice, CATEGORY_NAMES, ProductCategory } from '@/lib/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = ['Necklaces', 'Bangles', 'Wedding Sets', 'Earrings', 'Rings'];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [recentSearches] = useState<string[]>(['Gold Chain', 'Diamond Necklace']);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: products, isLoading } = useProducts({ search: query });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/collections/necklaces?search=${encodeURIComponent(searchTerm)}`);
      onClose();
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleCategoryClick = (category: string) => {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/collections/${categorySlug}`);
    onClose();
  };

  if (!isOpen) return null;

  const filteredProducts = products?.slice(0, 5) || [];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 py-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for jewellery..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            className="flex-1 border-0 text-lg focus-visible:ring-0 bg-transparent"
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="py-6 max-h-[calc(100vh-80px)] overflow-y-auto">
          {query.length === 0 ? (
            <div className="space-y-8">
              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleCategoryClick(term)}
                      className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop by Category */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-4">Shop by Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => navigate(`/collections/${key.replace('_', '-')}`)}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary text-left transition-colors"
                    >
                      <span className="text-sm font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    {products?.length} results for "{query}"
                  </p>
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {CATEGORY_NAMES[product.category as ProductCategory]}
                        </p>
                        <p className="text-primary font-semibold">
                          {formatPrice(product.calculated_price.total)}
                        </p>
                      </div>
                    </button>
                  ))}
                  {products && products.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => handleSearch(query)}
                    >
                      View all {products.length} results
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No products found for "{query}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for something else
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
