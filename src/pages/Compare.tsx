import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { formatPrice, METAL_TYPE_NAMES } from '@/lib/types';
import { useGstSettings } from '@/hooks/useSiteSettings';
import { Scale, X, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
export default function ComparePage() {
  const { products, removeProduct, clearAll } = useProductComparison();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { data: gstSettings } = useGstSettings();
  const gstRate = gstSettings?.rate ?? 3;

  if (products.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Scale className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-semibold mb-2">No Products to Compare</h1>
          <p className="text-muted-foreground mb-6">
            Add products to comparison from collection pages
          </p>
          <Link to="/collections/necklaces">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const specs: { label: string; key: string; format: (v: any) => string; highlight?: boolean }[] = [
    { label: 'Metal Type', key: 'metal_type', format: (v: string) => METAL_TYPE_NAMES[v as keyof typeof METAL_TYPE_NAMES] || v },
    { label: 'Weight', key: 'weight_grams', format: (v: number) => `${v}g` },
    { label: 'Category', key: 'category', format: (v: string) => v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { label: 'Gold Value', key: 'calculated_price.gold_value', format: (v: number) => formatPrice(v) },
    { label: 'Making Charges', key: 'calculated_price.making_charges', format: (v: number) => formatPrice(v) },
    { label: `GST (${gstRate}%)`, key: 'calculated_price.gst', format: (v: number) => formatPrice(v) },
    { label: 'Total Price', key: 'calculated_price.total', format: (v: number) => formatPrice(v), highlight: true },
  ];

  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold">Compare Products</h1>
            <p className="text-muted-foreground">
              Compare {products.length} products side by side
            </p>
          </div>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-secondary/50 min-w-[150px]"></th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 bg-secondary/50 min-w-[250px]">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/product/${product.slug}`}>
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  </th>
                ))}
                {/* Empty columns */}
                {[...Array(3 - products.length)].map((_, i) => (
                  <th key={`empty-${i}`} className="p-4 bg-secondary/30 min-w-[250px]">
                    <div className="h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Add product</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, index) => (
                <tr key={spec.key} className={index % 2 === 0 ? 'bg-secondary/20' : ''}>
                  <td className={`p-4 font-medium ${spec.highlight ? 'text-primary' : ''}`}>
                    {spec.label}
                  </td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`p-4 text-center ${spec.highlight ? 'font-bold text-lg text-primary' : ''}`}
                    >
                      {spec.format(getNestedValue(product, spec.key))}
                    </td>
                  ))}
                  {[...Array(3 - products.length)].map((_, i) => (
                    <td key={`empty-${i}`} className="p-4 text-center text-muted-foreground">
                      -
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Actions Row */}
              <tr>
                <td className="p-4 font-medium">Actions</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full gap-2"
                        onClick={() => addToCart({ productId: product.id })}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Button>
                    </div>
                  </td>
                ))}
                {[...Array(3 - products.length)].map((_, i) => (
                  <td key={`empty-${i}`} className="p-4"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
