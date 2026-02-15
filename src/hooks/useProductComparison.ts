import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductWithPrice } from '@/lib/types';

interface ComparisonStore {
  products: ProductWithPrice[];
  addProduct: (product: ProductWithPrice) => boolean;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isInComparison: (productId: string) => boolean;
}

export const useProductComparison = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product: ProductWithPrice) => {
        const { products } = get();
        if (products.length >= 3) {
          return false;
        }
        if (products.some(p => p.id === product.id)) {
          return false;
        }
        set({ products: [...products, product] });
        return true;
      },
      
      removeProduct: (productId: string) => {
        set(state => ({
          products: state.products.filter(p => p.id !== productId)
        }));
      },
      
      clearAll: () => {
        set({ products: [] });
      },
      
      isInComparison: (productId: string) => {
        return get().products.some(p => p.id === productId);
      },
    }),
    {
      name: 'product-comparison',
    }
  )
);
