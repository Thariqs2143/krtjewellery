import { useEffect } from 'react';
import type { Product } from '@/lib/types';

const RECENTLY_VIEWED_KEY = 'krt_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  images: string[];
  category: string;
  metal_type: string;
  weight_grams: number;
}

export function useRecentlyViewed() {
  const addToRecentlyViewed = (product: Product) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      items = items.filter(item => item.id !== product.id);

      // Add new item to the beginning
      const newItem: RecentlyViewedItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        category: product.category,
        metal_type: product.metal_type,
        weight_grams: product.weight_grams,
      };

      items.unshift(newItem);

      // Keep only last 10 items
      items = items.slice(0, MAX_ITEMS);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error updating recently viewed:', error);
    }
  };

  const getRecentlyViewed = (): RecentlyViewedItem[] => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  };

  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  return {
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}
