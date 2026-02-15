import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { MegamenuPanel } from '@/components/layout/MegamenuPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMegamenuSettings } from '@/hooks/useMegamenu';

interface MegamenuItem {
  id: string;
  item_name: string;
  item_slug: string | null;
  icon_emoji: string | null;
  item_order: number;
  is_active: boolean;
  megamenu_section_id: string;
  rules?: MegamenuItemRule[];
  item_products?: MegamenuItemProduct[];
}

interface MegamenuItemRule {
  id: string;
  rule_type: string;
  rule_value: Record<string, any>;
  rule_order: number;
  megamenu_item_id: string;
}

interface MegamenuItemProduct {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string | null;
  product_order: number;
  megamenu_item_id: string;
}

interface MegamenuSection {
  id: string;
  section_name: string;
  section_order: number;
  is_featured: boolean;
  column?: number | null;
  megamenu_category_id: string;
  megamenu_items?: MegamenuItem[];
}

interface MegamenuCategory {
  id: string;
  category_slug: string;
  category_name: string;
  display_order: number;
  is_active: boolean;
  featured_limit?: number | null;
  sections?: MegamenuSection[];
  featured_products?: Array<{
    id: string;
    product_id: string;
    product_title: string;
    product_image_url: string;
  }>;
}

export default function AdminMegamenu() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MegamenuItem | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'item' | 'section' | 'featured';
    id: string;
    categoryId?: string;
  } | null>(null);
  const [newSection, setNewSection] = useState('');
  const [newSectionOrder, setNewSectionOrder] = useState('0');
  const [newSectionColumn, setNewSectionColumn] = useState('1');
  const [featuredProductId, setFeaturedProductId] = useState('');
  const [featuredProductOrder, setFeaturedProductOrder] = useState('0');
  const [productSearch, setProductSearch] = useState('');
  const [newItemBySection, setNewItemBySection] = useState<Record<string, { name: string; slug: string; emoji: string; order: string }>>({});
  const [ruleFormBySection, setRuleFormBySection] = useState<Record<string, { itemId: string; ruleType: string; value: string; min: string; max: string; enabled: boolean }>>({});
  const [productFormBySection, setProductFormBySection] = useState<Record<string, { itemId: string; productId: string; order: string }>>({});
  const [featuredLimitDraft, setFeaturedLimitDraft] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryOrder, setNewCategoryOrder] = useState('0');
  const [newCategoryActive, setNewCategoryActive] = useState(true);
  const { data: megamenuSettings } = useMegamenuSettings();

  const defaultCategories = [
    { category_slug: 'rings', category_name: 'RINGS', display_order: 1, is_active: true, featured_limit: 2 },
    { category_slug: 'earrings', category_name: 'EARRINGS', display_order: 2, is_active: true, featured_limit: 2 },
    { category_slug: 'necklaces', category_name: 'NECKLACES', display_order: 3, is_active: true, featured_limit: 2 },
    { category_slug: 'bangles', category_name: 'BANGLES & BRACELETS', display_order: 4, is_active: true, featured_limit: 2 },
    { category_slug: 'engagement', category_name: 'ENGAGEMENT & WEDDING', display_order: 5, is_active: true, featured_limit: 2 },
    { category_slug: 'collections', category_name: 'COLLECTIONS', display_order: 6, is_active: true, featured_limit: 2 },
    { category_slug: 'gifts', category_name: 'GIFTS', display_order: 7, is_active: true, featured_limit: 2 },
  ];

  const defaultMenuSeed = [
    {
      slug: 'rings',
      sections: [
        { name: 'Featured', order: 1, column: 1, items: [
          { name: 'Engagement Rings', slug: 'wedding-bridal', order: 1 },
          { name: 'Mens Rings', slug: 'mens-jewellery', order: 2 },
          { name: 'Solitaire Rings', slug: 'diamond-jewellery', order: 3 },
          { name: 'Anniversary Rings', slug: 'diamond-jewellery', order: 4 },
          { name: 'Promise Rings', slug: 'diamond-jewellery', order: 5 },
          { name: 'Bands', slug: 'rings', order: 6 },
          { name: 'Traditional Rings', slug: 'rings', order: 7 },
          { name: 'Cocktail Rings', slug: 'rings', order: 8 },
          { name: 'Infinity Rings', slug: 'rings', order: 9 },
        ]},
        { name: 'Natural Gemstone Rings', order: 2, column: 2, items: [
          { name: 'Diamond Rings', slug: 'diamond-jewellery', order: 1 },
          { name: 'Emerald Rings', slug: 'rings', order: 2 },
          { name: 'Ruby Rings', slug: 'rings', order: 3 },
          { name: 'Sapphire Rings', slug: 'rings', order: 4 },
          { name: 'Tanzanite Rings', slug: 'rings', order: 5 },
          { name: 'Aquamarine Rings', slug: 'rings', order: 6 },
          { name: 'Opal Rings', slug: 'rings', order: 7 },
          { name: 'Amethyst Rings', slug: 'rings', order: 8 },
          { name: 'Garnet Rings', slug: 'rings', order: 9 },
          { name: 'London Blue Topaz Rings', slug: 'rings', order: 10 },
          { name: 'Pearl Rings', slug: 'rings', order: 11 },
          { name: 'Explore All', slug: 'rings', order: 99 },
        ]},
        { name: 'Lab-Grown Rings', order: 3, column: 3, items: [
          { name: 'Lab Diamond Rings', slug: 'diamond-jewellery', order: 1 },
          { name: 'Lab Coloured Diamond Rings', slug: 'diamond-jewellery', order: 2 },
          { name: 'Lab Emerald Rings', slug: 'rings', order: 3 },
          { name: 'Lab Blue Sapphire Rings', slug: 'rings', order: 4 },
          { name: 'Lab Ruby Rings', slug: 'rings', order: 5 },
          { name: 'Explore All', slug: 'rings', order: 99 },
        ]},
        { name: 'Rings By Stone Shape', order: 4, column: 3, items: [
          { name: 'Round Rings', slug: 'rings', order: 1 },
          { name: 'Oval Rings', slug: 'rings', order: 2 },
          { name: 'Pear Rings', slug: 'rings', order: 3 },
          { name: 'Heart Rings', slug: 'rings', order: 4 },
          { name: 'Emerald-Cut Rings', slug: 'rings', order: 5 },
          { name: 'Explore All', slug: 'rings', order: 99 },
        ]},
        { name: 'Rings By Price Range', order: 5, column: 4, items: [
          { name: '₹10,000 – ₹25,000', slug: 'rings', order: 1 },
          { name: '₹25,000 – ₹50,000', slug: 'rings', order: 2 },
          { name: '₹50,000 – ₹1,00,000', slug: 'rings', order: 3 },
          { name: '₹1,00,000 – ₹2,00,000', slug: 'rings', order: 4 },
          { name: 'Above ₹2,00,000', slug: 'rings', order: 5 },
        ]},
        { name: 'Rings By Metal Purity', order: 6, column: 4, items: [
          { name: '9 KT Gold', slug: 'rings', order: 1 },
          { name: '14 KT Gold', slug: 'rings', order: 2 },
          { name: '18 KT Gold', slug: 'rings', order: 3 },
          { name: '925 Silver', slug: 'rings', order: 4 },
        ]},
      ],
    },
    {
      slug: 'earrings',
      sections: [
        { name: 'Featured', order: 1, column: 1, items: [
          { name: 'Bridal Earrings', slug: 'diamond-jewellery', order: 1 },
          { name: 'Classic Earrings', slug: 'earrings', order: 2 },
          { name: 'Solitaire Studs Earrings', slug: 'diamond-jewellery', order: 3 },
          { name: 'Drop Earrings', slug: 'earrings', order: 4 },
          { name: 'Hoops Earrings', slug: 'earrings', order: 5 },
          { name: 'Sui Dhaga Earrings', slug: 'earrings', order: 6 },
          { name: 'Mens Studs', slug: 'mens-jewellery', order: 7 },
          { name: 'Mangalsutra Earrings', slug: 'earrings', order: 8 },
        ]},
        { name: 'Natural Gemstone Earrings', order: 2, column: 2, items: [
          { name: 'Diamond Earrings', slug: 'diamond-jewellery', order: 1 },
          { name: 'Emerald Earrings', slug: 'earrings', order: 2 },
          { name: 'Ruby Earrings', slug: 'earrings', order: 3 },
          { name: 'Sapphire Earrings', slug: 'earrings', order: 4 },
          { name: 'Tanzanite Earrings', slug: 'earrings', order: 5 },
          { name: 'Aquamarine Earrings', slug: 'earrings', order: 6 },
          { name: 'Opal Earrings', slug: 'earrings', order: 7 },
          { name: 'Amethyst Earrings', slug: 'earrings', order: 8 },
          { name: 'Garnet Earrings', slug: 'earrings', order: 9 },
          { name: 'London Blue Topaz Earrings', slug: 'earrings', order: 10 },
          { name: 'Pearl Earrings', slug: 'earrings', order: 11 },
          { name: 'Explore All', slug: 'earrings', order: 99 },
        ]},
        { name: 'Lab-Grown Earrings', order: 3, column: 3, items: [
          { name: 'Lab Diamond Earrings', slug: 'diamond-jewellery', order: 1 },
          { name: 'Lab Coloured Diamond Earrings', slug: 'diamond-jewellery', order: 2 },
          { name: 'Lab Emerald Earrings', slug: 'earrings', order: 3 },
          { name: 'Lab Blue Sapphire Earrings', slug: 'earrings', order: 4 },
          { name: 'Lab Ruby Earrings', slug: 'earrings', order: 5 },
          { name: 'Explore All', slug: 'earrings', order: 99 },
        ]},
        { name: 'Earrings By Stone Shape', order: 4, column: 3, items: [
          { name: 'Round Earrings', slug: 'earrings', order: 1 },
          { name: 'Heart Earrings', slug: 'earrings', order: 2 },
          { name: 'Pear Earrings', slug: 'earrings', order: 3 },
          { name: 'Cushion Earrings', slug: 'earrings', order: 4 },
          { name: 'Princess-Cut Earrings', slug: 'earrings', order: 5 },
          { name: 'Explore All', slug: 'earrings', order: 99 },
        ]},
        { name: 'Earrings By Price Range', order: 5, column: 4, items: [
          { name: '₹10,000 – ₹25,000', slug: 'earrings', order: 1 },
          { name: '₹25,000 – ₹50,000', slug: 'earrings', order: 2 },
          { name: '₹50,000 – ₹1,00,000', slug: 'earrings', order: 3 },
          { name: '₹1,00,000 – ₹2,00,000', slug: 'earrings', order: 4 },
          { name: 'Above ₹2,00,000', slug: 'earrings', order: 5 },
        ]},
        { name: 'Earrings By Metal Purity', order: 6, column: 4, items: [
          { name: '9 KT Gold', slug: 'earrings', order: 1 },
          { name: '14 KT Gold', slug: 'earrings', order: 2 },
          { name: '18 KT Gold', slug: 'earrings', order: 3 },
          { name: '925 Silver', slug: 'earrings', order: 4 },
        ]},
      ],
    },
    {
      slug: 'necklaces',
      sections: [
        { name: 'Featured', order: 1, column: 1, items: [
          { name: 'Pendants', slug: 'pendants', order: 1 },
          { name: 'Bridal Sets', slug: 'wedding-bridal', order: 2 },
          { name: 'Mangalsutra', slug: 'wedding-bridal', order: 3 },
          { name: 'Solitaire Necklaces', slug: 'diamond-jewellery', order: 4 },
          { name: 'Tennis Necklaces', slug: 'necklaces', order: 5 },
          { name: 'Initials Necklaces', slug: 'necklaces', order: 6 },
          { name: 'Heart Necklaces', slug: 'necklaces', order: 7 },
          { name: 'Cross Necklaces', slug: 'necklaces', order: 8 },
          { name: 'Mens Pendants', slug: 'mens-jewellery', order: 9 },
        ]},
        { name: 'Natural Gemstone Necklaces', order: 2, column: 2, items: [
          { name: 'Diamond Necklaces', slug: 'diamond-jewellery', order: 1 },
          { name: 'Emerald Necklaces', slug: 'necklaces', order: 2 },
          { name: 'Ruby Necklaces', slug: 'necklaces', order: 3 },
          { name: 'Sapphire Necklaces', slug: 'necklaces', order: 4 },
          { name: 'Tanzanite Necklaces', slug: 'necklaces', order: 5 },
          { name: 'Aquamarine Necklaces', slug: 'necklaces', order: 6 },
          { name: 'Opal Necklaces', slug: 'necklaces', order: 7 },
          { name: 'Amethyst Necklaces', slug: 'necklaces', order: 8 },
          { name: 'Garnet Necklaces', slug: 'necklaces', order: 9 },
          { name: 'London Blue Topaz Necklaces', slug: 'necklaces', order: 10 },
          { name: 'Pearl Necklaces', slug: 'necklaces', order: 11 },
          { name: 'Explore All', slug: 'necklaces', order: 99 },
        ]},
        { name: 'Lab-Grown Necklaces', order: 3, column: 3, items: [
          { name: 'Lab Diamond Necklaces', slug: 'diamond-jewellery', order: 1 },
          { name: 'Lab Coloured Diamond Necklaces', slug: 'diamond-jewellery', order: 2 },
          { name: 'Lab Emerald Necklaces', slug: 'necklaces', order: 3 },
          { name: 'Lab Blue Sapphire Necklaces', slug: 'necklaces', order: 4 },
          { name: 'Lab Ruby Necklaces', slug: 'necklaces', order: 5 },
          { name: 'Explore All', slug: 'necklaces', order: 99 },
        ]},
        { name: 'Necklaces By Length', order: 4, column: 3, items: [
          { name: '16 Inches', slug: 'necklaces', order: 1 },
          { name: '18 Inches', slug: 'necklaces', order: 2 },
          { name: '22 Inches', slug: 'necklaces', order: 3 },
          { name: 'Explore All', slug: 'necklaces', order: 99 },
        ]},
        { name: 'Necklaces By Price Range', order: 5, column: 4, items: [
          { name: '₹10,000 – ₹25,000', slug: 'necklaces', order: 1 },
          { name: '₹25,000 – ₹50,000', slug: 'necklaces', order: 2 },
          { name: '₹50,000 – ₹1,00,000', slug: 'necklaces', order: 3 },
          { name: '₹1,00,000 – ₹2,00,000', slug: 'necklaces', order: 4 },
          { name: 'Above ₹2,00,000', slug: 'necklaces', order: 5 },
        ]},
        { name: 'Necklaces By Metal Purity', order: 6, column: 4, items: [
          { name: '9 KT Gold', slug: 'necklaces', order: 1 },
          { name: '14 KT Gold', slug: 'necklaces', order: 2 },
          { name: '18 KT Gold', slug: 'necklaces', order: 3 },
          { name: '925 Silver', slug: 'necklaces', order: 4 },
        ]},
      ],
    },
    {
      slug: 'bangles',
      sections: [
        { name: 'Featured', order: 1, column: 1, items: [
          { name: 'Bangles', slug: 'bangles', order: 1 },
          { name: 'Cuff Bangles', slug: 'bangles', order: 2 },
          { name: 'Tennis Bracelets', slug: 'bracelets', order: 3 },
          { name: 'Chain Bracelets', slug: 'bracelets', order: 4 },
          { name: 'Adjustable Bracelets', slug: 'bracelets', order: 5 },
          { name: 'Tennis Bangles', slug: 'bangles', order: 6 },
          { name: 'Mangalsutra Bracelets', slug: 'bracelets', order: 7 },
          { name: 'Initials Bracelets', slug: 'bracelets', order: 8 },
          { name: 'Mens Bracelets', slug: 'mens-jewellery', order: 9 },
        ]},
        { name: 'Natural Gemstone Bracelets', order: 2, column: 2, items: [
          { name: 'Diamond Bracelets', slug: 'bracelets', order: 1 },
          { name: 'Emerald Bracelets', slug: 'bracelets', order: 2 },
          { name: 'Sapphire Bracelets', slug: 'bracelets', order: 3 },
          { name: 'Ruby Bracelets', slug: 'bracelets', order: 4 },
          { name: 'Garnet Bracelets', slug: 'bracelets', order: 5 },
          { name: 'Explore All', slug: 'bracelets', order: 99 },
        ]},
        { name: 'Lab-Grown Bracelets', order: 3, column: 3, items: [
          { name: 'Lab Diamond Bracelets', slug: 'bracelets', order: 1 },
          { name: 'Lab Emerald Bracelets', slug: 'bracelets', order: 2 },
          { name: 'Lab Blue Sapphire Bracelets', slug: 'bracelets', order: 3 },
          { name: 'Lab Ruby Bracelets', slug: 'bracelets', order: 4 },
          { name: 'Explore All', slug: 'bracelets', order: 99 },
        ]},
        { name: 'Natural Gemstone Bangles', order: 4, column: 2, items: [
          { name: 'Diamond Bangles', slug: 'bangles', order: 1 },
          { name: 'Emerald Bangles', slug: 'bangles', order: 2 },
          { name: 'Sapphire Bangles', slug: 'bangles', order: 3 },
          { name: 'Ruby Bangles', slug: 'bangles', order: 4 },
          { name: 'Garnet Bangles', slug: 'bangles', order: 5 },
          { name: 'Explore All', slug: 'bangles', order: 99 },
        ]},
        { name: 'Lab-Grown Bangles', order: 5, column: 3, items: [
          { name: 'Lab Diamond Bangles', slug: 'bangles', order: 1 },
          { name: 'Explore All', slug: 'bangles', order: 99 },
        ]},
        { name: 'Bracelets By Price Range', order: 6, column: 4, items: [
          { name: '₹50,000 – ₹1,00,000', slug: 'bracelets', order: 1 },
          { name: '₹1,00,000 – ₹2,00,000', slug: 'bracelets', order: 2 },
          { name: 'Above ₹2,00,000', slug: 'bracelets', order: 3 },
        ]},
        { name: 'Bracelets By Metal Purity', order: 7, column: 4, items: [
          { name: '9 KT Gold', slug: 'bracelets', order: 1 },
          { name: '14 KT Gold', slug: 'bracelets', order: 2 },
          { name: '18 KT Gold', slug: 'bracelets', order: 3 },
          { name: '925 Silver', slug: 'bracelets', order: 4 },
        ]},
      ],
    },
    {
      slug: 'engagement',
      sections: [
        { name: 'Engagement Rings', order: 1, column: 1, items: [
          { name: 'Diamond Engagement Rings', slug: 'wedding-bridal', order: 1 },
          { name: 'Ruby Engagement Rings', slug: 'wedding-bridal', order: 2 },
          { name: 'Emerald Engagement Rings', slug: 'wedding-bridal', order: 3 },
          { name: 'Sapphire Engagement Rings', slug: 'wedding-bridal', order: 4 },
          { name: 'Morganite Engagement Rings', slug: 'wedding-bridal', order: 5 },
          { name: 'Lab-Grown Engagement Rings', slug: 'wedding-bridal', order: 6 },
          { name: 'Explore All', slug: 'wedding-bridal', order: 99 },
        ]},
        { name: 'Mangalsutra', order: 2, column: 2, items: [
          { name: 'Diamond Mangalsutra', slug: 'wedding-bridal', order: 1 },
          { name: 'Ruby Mangalsutra', slug: 'wedding-bridal', order: 2 },
          { name: 'Emerald Mangalsutra', slug: 'wedding-bridal', order: 3 },
          { name: 'Blue Sapphire Mangalsutra', slug: 'wedding-bridal', order: 4 },
          { name: 'Lab-Grown Mangalsutra', slug: 'wedding-bridal', order: 5 },
          { name: 'Explore All', slug: 'wedding-bridal', order: 99 },
        ]},
        { name: 'Bangles', order: 3, column: 3, items: [
          { name: 'Diamond Bangles', slug: 'bangles', order: 1 },
          { name: 'Ruby Bangles', slug: 'bangles', order: 2 },
          { name: 'Emerald Bangles', slug: 'bangles', order: 3 },
          { name: 'Sapphire Bangles', slug: 'bangles', order: 4 },
          { name: 'Lab-Grown Bangles', slug: 'bangles', order: 5 },
          { name: 'Explore All', slug: 'bangles', order: 99 },
        ]},
        { name: 'Mens Jewellery', order: 4, column: 4, items: [
          { name: 'Mens Rings', slug: 'mens-jewellery', order: 1 },
          { name: 'Mens Earrings', slug: 'mens-jewellery', order: 2 },
          { name: 'Mens Necklaces', slug: 'mens-jewellery', order: 3 },
          { name: 'Mens Bracelets', slug: 'mens-jewellery', order: 4 },
          { name: 'Brooches', slug: 'mens-jewellery', order: 5 },
          { name: 'Cufflinks', slug: 'mens-jewellery', order: 6 },
          { name: 'Explore All', slug: 'mens-jewellery', order: 99 },
        ]},
        { name: 'Bridal Sets', order: 5, column: 1, items: [
          { name: 'Bridal Earrings', slug: 'wedding-bridal', order: 1 },
          { name: 'Bridal Necklaces', slug: 'wedding-bridal', order: 2 },
          { name: 'Explore All', slug: 'wedding-bridal', order: 99 },
        ]},
      ],
    },
    {
      slug: 'collections',
      sections: [
        { name: 'Collections', order: 1, column: 1, items: [
          { name: "Men's Jewellery", slug: 'mens-jewellery', order: 1 },
          { name: 'Bridal Jewellery', slug: 'wedding-bridal', order: 2 },
          { name: 'Aurora', slug: 'shop', order: 3 },
          { name: 'Gardens At Twilight', slug: 'shop', order: 4 },
          { name: 'Zodiac Jewellery', slug: 'shop', order: 5 },
        ]},
      ],
    },
    {
      slug: 'gifts',
      sections: [
        { name: 'Gifts By Occasion', order: 1, column: 1, items: [
          { name: 'Anniversary', slug: 'shop', order: 1 },
          { name: 'Engagement', slug: 'shop', order: 2 },
          { name: 'Wedding', slug: 'shop', order: 3 },
          { name: "Valentine's Day", slug: 'shop', order: 4 },
          { name: 'Promise Rings', slug: 'rings', order: 5 },
          { name: 'Explore All', slug: 'shop', order: 99 },
        ]},
        { name: 'Gifts By Price', order: 2, column: 2, items: [
          { name: 'Below ₹10,000', slug: 'shop', order: 1 },
          { name: '₹10,000 – ₹25,000', slug: 'shop', order: 2 },
          { name: '₹25,000 – ₹50,000', slug: 'shop', order: 3 },
          { name: '₹50,000 – ₹1,00,000', slug: 'shop', order: 4 },
          { name: '₹1,00,000 – ₹2,00,000', slug: 'shop', order: 5 },
          { name: 'Above ₹2,00,000', slug: 'shop', order: 6 },
        ]},
        { name: 'Popular Gifts', order: 3, column: 3, items: [
          { name: 'Initials Jewellery', slug: 'shop', order: 1 },
          { name: 'Religious Jewellery', slug: 'shop', order: 2 },
          { name: 'Bridal Necklaces', slug: 'wedding-bridal', order: 3 },
          { name: 'Navratna Jewellery', slug: 'shop', order: 4 },
          { name: 'Heart Jewellery', slug: 'shop', order: 5 },
          { name: 'Cocktail Rings', slug: 'rings', order: 6 },
        ]},
        { name: 'Gifts By Birthstone', order: 4, column: 4, items: [
          { name: 'January-Born', slug: 'shop', order: 1 },
          { name: 'February-Born', slug: 'shop', order: 2 },
          { name: 'March-Born', slug: 'shop', order: 3 },
          { name: 'April-Born', slug: 'shop', order: 4 },
          { name: 'May-Born', slug: 'shop', order: 5 },
          { name: 'June-Born', slug: 'shop', order: 6 },
          { name: 'July-Born', slug: 'shop', order: 7 },
          { name: 'August-Born', slug: 'shop', order: 8 },
          { name: 'September-Born', slug: 'shop', order: 9 },
          { name: 'October-Born', slug: 'shop', order: 10 },
          { name: 'November-Born', slug: 'shop', order: 11 },
          { name: 'December-Born', slug: 'shop', order: 12 },
          { name: 'Explore All', slug: 'shop', order: 99 },
        ]},
        { name: 'Gifts By Category', order: 5, column: 2, items: [
          { name: 'Nose Pin', slug: 'shop', order: 1 },
          { name: 'Brooches', slug: 'shop', order: 2 },
          { name: 'Cufflinks', slug: 'shop', order: 3 },
          { name: 'Smartwatch Charms', slug: 'shop', order: 4 },
        ]},
        { name: 'Gifts By Metal Type', order: 6, column: 3, items: [
          { name: '9 KT Gold', slug: 'shop', order: 1 },
          { name: '14 KT Gold', slug: 'shop', order: 2 },
          { name: '18 KT Gold', slug: 'shop', order: 3 },
          { name: '925 Silver', slug: 'shop', order: 4 },
        ]},
      ],
    },
  ];

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Fetch megamenu data
  const { data: categories, isLoading, error: categoriesError } = useQuery({
    queryKey: ['adminMegamenu'],
    queryFn: async () => {
      const { data: cats, error: catErr } = await supabase
        .from('megamenu_categories')
        .select('*')
        .order('display_order');

      if (catErr) throw catErr;

      const { data: rules, error: ruleErr } = await supabase
        .from('megamenu_item_rules')
        .select('*')
        .order('rule_order');

      if (ruleErr) throw ruleErr;

      const { data: itemProducts, error: itemProductErr } = await supabase
        .from('megamenu_item_products')
        .select('*')
        .order('product_order');

      if (itemProductErr) throw itemProductErr;

      const rulesByItem = new Map<string, MegamenuItemRule[]>();
      (rules || []).forEach((rule: MegamenuItemRule) => {
        if (!rulesByItem.has(rule.megamenu_item_id)) {
          rulesByItem.set(rule.megamenu_item_id, []);
        }
        rulesByItem.get(rule.megamenu_item_id)!.push(rule);
      });

      const productsByItem = new Map<string, MegamenuItemProduct[]>();
      (itemProducts || []).forEach((product: MegamenuItemProduct) => {
        if (!productsByItem.has(product.megamenu_item_id)) {
          productsByItem.set(product.megamenu_item_id, []);
        }
        productsByItem.get(product.megamenu_item_id)!.push(product);
      });

      // Fetch sections for each category
      const categoriesWithData = await Promise.all(
        (cats || []).map(async (cat) => {
          const { data: secs } = await supabase
            .from('megamenu_sections')
            .select('*')
            .eq('megamenu_category_id', cat.id)
            .order('section_order');

          // Fetch items for each section
          const sectionsWithItems = await Promise.all(
            (secs || []).map(async (sec) => {
              const { data: items } = await supabase
                .from('megamenu_items')
                .select('*')
                .eq('megamenu_section_id', sec.id)
                .order('item_order');

              const itemsWithMeta = (items || []).map((item: MegamenuItem) => ({
                ...item,
                rules: rulesByItem.get(item.id) || [],
                item_products: productsByItem.get(item.id) || [],
              }));

              return { ...sec, megamenu_items: itemsWithMeta };
            })
          );

          // Fetch featured products
          const { data: products } = await supabase
            .from('megamenu_featured_products')
            .select('*')
            .eq('megamenu_category_id', cat.id)
            .order('product_order');

          return {
            ...cat,
            sections: sectionsWithItems || [],
            featured_products: products || [],
          };
        })
      );

      return categoriesWithData;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['adminMegamenuProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: menuCategories, error: menuCategoriesError } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: menuSubcategories, error: menuSubcategoriesError } = useQuery({
    queryKey: ['productSubcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_subcategories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
  });

  const filteredProducts =
    productSearch.trim().length === 0
      ? products
      : products?.filter((product) =>
          product.name.toLowerCase().includes(productSearch.toLowerCase())
        );
  const productsLoaded = Array.isArray(products) && products.length > 0;

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { categoryId: string; featuredLimit: number }) => {
      const { error } = await supabase
        .from('megamenu_categories')
        .update({ featured_limit: data.featuredLimit })
        .eq('id', data.categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Category updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!newCategoryName || !newCategorySlug) {
        throw new Error('Category name and slug are required.');
      }
      const { error } = await supabase
        .from('megamenu_categories')
        .insert({
          category_name: newCategoryName,
          category_slug: newCategorySlug,
          display_order: parseInt(newCategoryOrder || '0', 10),
          is_active: newCategoryActive,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Category added' });
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryOrder('0');
      setNewCategoryActive(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Category deleted' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMenuCategoryOrderMutation = useMutation({
    mutationFn: async (payload: { id: string; display_order: number; is_active?: boolean }) => {
      const { error } = await supabase
        .from('product_categories')
        .update({
          display_order: payload.display_order,
          ...(payload.is_active === undefined ? {} : { is_active: payload.is_active }),
        })
        .eq('id', payload.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating menu category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMenuSubcategoryOrderMutation = useMutation({
    mutationFn: async (payload: { id: string; display_order: number; is_active?: boolean }) => {
      const { error } = await supabase
        .from('product_subcategories')
        .update({
          display_order: payload.display_order,
          ...(payload.is_active === undefined ? {} : { is_active: payload.is_active }),
        })
        .eq('id', payload.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating menu subcategory',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const seedCategoriesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('megamenu_categories')
        .upsert(defaultCategories, { onConflict: 'category_slug' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Default categories seeded' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to seed categories',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: async () => {
      const { error: catUpsertError } = await supabase
        .from('megamenu_categories')
        .upsert(defaultCategories, { onConflict: 'category_slug' });

      if (catUpsertError) throw catUpsertError;

      const { data: cats, error: catFetchError } = await supabase
        .from('megamenu_categories')
        .select('id, category_slug');

      if (catFetchError) throw catFetchError;

      const categoryMap = new Map<string, string>();
      (cats || []).forEach((cat) => {
        categoryMap.set(cat.category_slug, cat.id);
      });

      for (const categorySeed of defaultMenuSeed) {
        const categoryId = categoryMap.get(categorySeed.slug);
        if (!categoryId) continue;

        for (const section of categorySeed.sections) {
          const { data: existingSections, error: sectionFetchError } = await supabase
            .from('megamenu_sections')
            .select('id')
            .eq('megamenu_category_id', categoryId)
            .eq('section_name', section.name)
            .limit(1);

          if (sectionFetchError) throw sectionFetchError;

          let sectionId = existingSections?.[0]?.id;
          if (!sectionId) {
            const { data: createdSection, error: sectionInsertError } = await supabase
              .from('megamenu_sections')
              .insert({
                megamenu_category_id: categoryId,
                section_name: section.name,
                section_order: section.order,
                column: section.column,
              })
              .select('id')
              .single();

            if (sectionInsertError) throw sectionInsertError;
            sectionId = createdSection.id;
          }

          for (const item of section.items) {
            const { data: existingItems, error: itemFetchError } = await supabase
              .from('megamenu_items')
              .select('id')
              .eq('megamenu_section_id', sectionId)
              .eq('item_name', item.name)
              .limit(1);

            if (itemFetchError) throw itemFetchError;

            if (!existingItems || existingItems.length === 0) {
              const { error: itemInsertError } = await supabase
                .from('megamenu_items')
                .insert({
                  megamenu_section_id: sectionId,
                  item_name: item.name,
                  item_slug: item.slug || null,
                  item_order: item.order,
                  is_active: true,
                });

              if (itemInsertError) throw itemInsertError;
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Default megamenu seeded' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error seeding defaults',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMegamenuSettingsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: existing, error: fetchError } = await supabase
        .from('megamenu_settings')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing?.id) {
        const { error } = await supabase
          .from('megamenu_settings')
          .update({ is_enabled: enabled })
          .eq('id', existing.id);
        if (error) throw error;
        return existing;
      }

      const { data, error } = await supabase
        .from('megamenu_settings')
        .insert({ is_enabled: enabled })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['megamenuSettings'] });
      queryClient.invalidateQueries({ queryKey: ['megamenu'] });
      toast({ title: 'Megamenu visibility updated' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating megamenu visibility',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const seedProductCategoryDefaultsMutation = useMutation({
    mutationFn: async () => {
      const productCategoryPayload = defaultCategories.map((cat) => ({
        name: cat.category_name,
        slug: cat.category_slug,
        display_order: cat.display_order,
        is_active: cat.is_active,
      }));

      const { error: categoryUpsertError } = await supabase
        .from('product_categories')
        .upsert(productCategoryPayload, { onConflict: 'slug' });

      if (categoryUpsertError) throw categoryUpsertError;

      const { data: productCategories, error: categoryFetchError } = await supabase
        .from('product_categories')
        .select('id, slug');

      if (categoryFetchError) throw categoryFetchError;

      const productCategoryMap = new Map<string, string>();
      (productCategories || []).forEach((cat) => {
        productCategoryMap.set(cat.slug, cat.id);
      });

      const subcategoryPayload: Array<{
        product_category_id: string;
        name: string;
        slug: string;
        display_order: number;
        is_active: boolean;
      }> = [];

      defaultMenuSeed.forEach((categorySeed) => {
        const categoryId = productCategoryMap.get(categorySeed.slug);
        if (!categoryId) return;

        categorySeed.sections.forEach((section) => {
          const isFilterSection = /price range|metal purity/i.test(section.name);
          if (isFilterSection) return;

          section.items.forEach((item) => {
            if (/explore all/i.test(item.name)) return;
            const slug = slugify(item.name);
            if (!slug) return;
            subcategoryPayload.push({
              product_category_id: categoryId,
              name: item.name,
              slug,
              display_order: item.order ?? 0,
              is_active: true,
            });
          });
        });
      });

      if (subcategoryPayload.length > 0) {
        const { error: subcategoryUpsertError } = await supabase
          .from('product_subcategories')
          .upsert(subcategoryPayload, { onConflict: 'product_category_id,slug' });

        if (subcategoryUpsertError) throw subcategoryUpsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      queryClient.invalidateQueries({ queryKey: ['productSubcategories'] });
      toast({ title: 'Product categories seeded' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error seeding product categories',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutations
  const updateItemMutation = useMutation({
    mutationFn: async (item: MegamenuItem) => {
      const { error } = await supabase
        .from('megamenu_items')
        .update({
          item_name: item.item_name,
          item_slug: item.item_slug,
          icon_emoji: item.icon_emoji,
          item_order: item.item_order,
          is_active: item.is_active,
        })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Item updated successfully' });
      setEditingItem(null);
    },
    onError: () => {
      toast({
        title: 'Error updating item',
        variant: 'destructive',
      });
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: async (data: { categoryId: string; sectionName: string; sectionOrder: number; sectionColumn: number }) => {
      const { error } = await supabase
        .from('megamenu_sections')
        .insert({
          megamenu_category_id: data.categoryId,
          section_name: data.sectionName,
          section_order: data.sectionOrder,
          column: data.sectionColumn,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Section added successfully' });
      setNewSection('');
      setNewSectionOrder('0');
      setNewSectionColumn('1');
    },
    onError: () => {
      toast({
        title: 'Error adding section',
        variant: 'destructive',
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Item deleted successfully' });
      setDeleteAlertOpen(false);
    },
    onError: () => {
      toast({ title: 'Error deleting item', variant: 'destructive' });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Section deleted successfully' });
      setDeleteAlertOpen(false);
    },
    onError: () => {
      toast({ title: 'Error deleting section', variant: 'destructive' });
    },
  });

  const addRuleMutation = useMutation({
    mutationFn: async (data: { itemId: string; ruleType: string; ruleValue: Record<string, any> }) => {
      const { error } = await supabase
        .from('megamenu_item_rules')
        .insert({
          megamenu_item_id: data.itemId,
          rule_type: data.ruleType,
          rule_value: data.ruleValue,
          rule_order: 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Rule added' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding rule',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_item_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Rule removed' });
    },
    onError: () => {
      toast({ title: 'Error deleting rule', variant: 'destructive' });
    },
  });

  const addItemProductMutation = useMutation({
    mutationFn: async (data: { itemId: string; productId: string; order: number }) => {
      if (!products || products.length === 0) {
        throw new Error('Products not loaded yet. Please wait and try again.');
      }
      const product = products?.find((p) => p.id === data.productId);
      if (!product) {
        throw new Error('Please select a valid product.');
      }

      const { error } = await supabase
        .from('megamenu_item_products')
        .insert({
          megamenu_item_id: data.itemId,
          product_id: data.productId,
          product_order: data.order,
          product_title: product.name,
          product_image_url: product.images?.[0] || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Product added to item' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteItemProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_item_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Product removed from item' });
    },
    onError: () => {
      toast({ title: 'Error deleting item product', variant: 'destructive' });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: { sectionId: string; name: string; slug?: string | null; emoji?: string | null; order: number }) => {
      const { error } = await supabase
        .from('megamenu_items')
        .insert({
          megamenu_section_id: data.sectionId,
          item_name: data.name,
          item_slug: data.slug || null,
          icon_emoji: data.emoji || null,
          item_order: data.order,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Item added successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addFeaturedProductMutation = useMutation({
    mutationFn: async (data: { categoryId: string; productId: string; order: number }) => {
      if (!products || products.length === 0) {
        throw new Error('Products not loaded yet. Please wait and try again.');
      }
      const product = products?.find((p) => p.id === data.productId);
      if (!product) {
        throw new Error('Please select a valid product.');
      }

      const { error } = await supabase
        .from('megamenu_featured_products')
        .insert({
          megamenu_category_id: data.categoryId,
          product_id: data.productId,
          product_order: data.order,
          product_title: product.name,
          product_image_url: product.images?.[0] || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Featured product added' });
      setFeaturedProductId('');
      setFeaturedProductOrder('0');
      setProductSearch('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding featured product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('megamenu_featured_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] });
      toast({ title: 'Featured product removed' });
      setDeleteAlertOpen(false);
    },
    onError: () => {
      toast({ title: 'Error deleting featured product', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <p className="text-muted-foreground">Loading megamenu...</p>
        </div>
      </AdminLayout>
    );
  }

  if (categoriesError) {
    const errorMessage =
      typeof categoriesError === 'object' && categoriesError !== null && 'message' in categoriesError
        ? String((categoriesError as { message?: string }).message)
        : 'Unknown error';
    return (
      <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Megamenu Manager</h1>
          <p className="text-muted-foreground">Manage category pages, sections, and menu items</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
            <p className="font-medium">Unable to load megamenu categories.</p>
            <p className="text-sm text-muted-foreground">
              This is usually a database migration or RLS issue. Error: {errorMessage}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['adminMegamenu'] })}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </AdminLayout>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Megamenu Manager</h1>
          <p className="text-muted-foreground">Manage category pages, sections, and menu items</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <p className="font-medium">No megamenu categories found.</p>
            <p className="text-sm text-muted-foreground">
              Seed the default categories to start building your megamenu.
            </p>
            <Button
              onClick={() => seedCategoriesMutation.mutate()}
              disabled={seedCategoriesMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Seed Default Categories
            </Button>
          </CardContent>
        </Card>
      </div>
      </AdminLayout>
    );
  }

  const sortedMenuCategories = [...(menuCategories || [])].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  );

  const moveMenuCategory = (id: string, direction: 'up' | 'down') => {
    const index = sortedMenuCategories.findIndex((cat) => cat.id === id);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sortedMenuCategories.length) return;
    const current = sortedMenuCategories[index];
    const swapWith = sortedMenuCategories[swapIndex];
    updateMenuCategoryOrderMutation.mutate({ id: current.id, display_order: swapWith.display_order || 0 });
    updateMenuCategoryOrderMutation.mutate({ id: swapWith.id, display_order: current.display_order || 0 });
  };

  const moveMenuSubcategory = (categoryId: string, subId: string, direction: 'up' | 'down') => {
    const subs = (menuSubcategories || [])
      .filter((sub) => sub.product_category_id === categoryId)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const index = subs.findIndex((sub) => sub.id === subId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= subs.length) return;
    const current = subs[index];
    const swapWith = subs[swapIndex];
    updateMenuSubcategoryOrderMutation.mutate({ id: current.id, display_order: swapWith.display_order || 0 });
    updateMenuSubcategoryOrderMutation.mutate({ id: swapWith.id, display_order: current.display_order || 0 });
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold">Megamenu Manager</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Show Megamenu</span>
            <Switch
              checked={megamenuSettings?.is_enabled !== false}
              onCheckedChange={(checked) => updateMegamenuSettingsMutation.mutate(checked)}
            />
          </div>
        </div>
        <p className="text-muted-foreground">Manage category pages, sections, and menu items</p>
      </div>

      <Tabs defaultValue="preview" className="w-full space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-lg">Megamenu Preview (Frontend Layout)</CardTitle>
                <Button
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['megamenu'] });
                    toast({ title: 'Megamenu saved', description: 'Refresh the website to see changes.' });
                  }}
                >
                  Save Megamenu
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => (
                  <Badge key={cat.id} variant="outline">
                    {cat.category_name}
                  </Badge>
                ))}
              </div>
              {categories?.map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground">
                    {category.category_name}
                  </div>
                  <div className="relative border rounded-lg overflow-hidden bg-white">
                    <MegamenuPanel
                      category={{
                        ...category,
                        megamenu_sections: category.sections || [],
                        featured_products: category.featured_products || [],
                      }}
                      preview
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          {(menuCategoriesError || menuSubcategoriesError) && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Unable to load menu categories</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  {menuCategoriesError?.message || menuSubcategoriesError?.message || 'Unknown error.'}
                </p>
                <p>Make sure the product category tables exist and then refresh.</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seed Full Megamenu Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This will fill all four columns for every category with the default layout.
              </p>
              <Button
                onClick={() => seedDefaultsMutation.mutate()}
                disabled={seedDefaultsMutation.isPending}
              >
                Seed Full Megamenu
              </Button>
            </CardContent>
          </Card>
      <Tabs defaultValue={categories?.[0]?.category_slug || 'rings'} className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Megamenu Layout (Pick + Reorder)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedMenuCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No menu categories found. Create them in `Menu Categories` first.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedMenuCategories.map((cat, index) => {
                  const subs = (menuSubcategories || [])
                    .filter((sub) => sub.product_category_id === cat.id)
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                  return (
                    <div key={cat.id} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => moveMenuCategory(cat.id, 'up')} disabled={index === 0}>
                            Up
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => moveMenuCategory(cat.id, 'down')} disabled={index === sortedMenuCategories.length - 1}>
                            Down
                          </Button>
                          <Switch
                            checked={cat.is_active}
                            onCheckedChange={(checked) =>
                              updateMenuCategoryOrderMutation.mutate({ id: cat.id, display_order: cat.display_order || 0, is_active: checked })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2 pl-3">
                        {subs.map((sub, subIndex) => (
                          <div key={sub.id} className="flex items-center justify-between">
                            <div className="text-sm">{sub.name}</div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => moveMenuSubcategory(cat.id, sub.id, 'up')} disabled={subIndex === 0}>
                                Up
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => moveMenuSubcategory(cat.id, sub.id, 'down')} disabled={subIndex === subs.length - 1}>
                                Down
                              </Button>
                              <Switch
                                checked={sub.is_active}
                                onCheckedChange={(checked) =>
                                  updateMenuSubcategoryOrderMutation.mutate({ id: sub.id, display_order: sub.display_order || 0, is_active: checked })
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  placeholder="e.g., RINGS"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Slug</label>
                <Input
                  placeholder="e.g., rings"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  value={newCategoryOrder}
                  onChange={(e) => setNewCategoryOrder(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Active</label>
                <Select
                  value={newCategoryActive ? 'true' : 'false'}
                  onValueChange={(value) => setNewCategoryActive(value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => addCategoryMutation.mutate()}
              disabled={!newCategoryName || !newCategorySlug || addCategoryMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seed Default Menus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This will create the default megamenu layout for all categories based on the reference design.
            </p>
            <Button
              variant="outline"
              onClick={() => seedDefaultsMutation.mutate()}
              disabled={seedDefaultsMutation.isPending}
            >
              Seed Default Menus
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seed Product Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This will create product categories and subcategories based on the default megamenu layout so you can
              assign products quickly.
            </p>
            <Button
              variant="outline"
              onClick={() => seedProductCategoryDefaultsMutation.mutate()}
              disabled={seedProductCategoryDefaultsMutation.isPending}
            >
              Seed Product Categories
            </Button>
          </CardContent>
        </Card>
        {categories && categories.length > 0 ? (
          <TabsList
            className="grid w-full gap-1"
            style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 7)}, minmax(0, 1fr))` }}
          >
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.category_slug}>
                {cat.category_name}
              </TabsTrigger>
            ))}
          </TabsList>
        ) : (
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              No megamenu categories yet. Click “Seed Default Menus” or add categories above.
            </CardContent>
          </Card>
        )}

        {categories?.map((category) => (
          <TabsContent key={category.id} value={category.category_slug} className="space-y-6 mt-6">
            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.category_name}</span>
                  <div className="flex items-center gap-2">
                    {category.is_active && <Badge variant="outline">Active</Badge>}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Slug</label>
                  <div className="p-2 bg-muted rounded text-sm">{category.category_slug}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <div className="p-2 bg-muted rounded text-sm">{category.display_order}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Featured Cards Limit</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={featuredLimitDraft[category.id] ?? String(category.featured_limit ?? 2)}
                      onChange={(e) =>
                        setFeaturedLimitDraft((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      className="w-28"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateCategoryMutation.mutate({
                          categoryId: category.id,
                          featuredLimit: parseInt(
                            featuredLimitDraft[category.id] ?? String(category.featured_limit ?? 2),
                            10
                          ),
                        })
                      }
                      disabled={updateCategoryMutation.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border rounded-lg overflow-hidden bg-white">
                  <MegamenuPanel category={{
                    ...category,
                    megamenu_sections: category.sections || [],
                    featured_products: category.featured_products || [],
                  }} preview />
                  <div className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Add New Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Name</label>
                    <Input
                      placeholder="e.g., Featured, Natural Gemstones"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <Input
                      type="number"
                      value={newSectionOrder}
                      onChange={(e) => setNewSectionOrder(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Column (1-4)</label>
                    <Input
                      type="number"
                      min={1}
                      max={4}
                      value={newSectionColumn}
                      onChange={(e) => setNewSectionColumn(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    addSectionMutation.mutate({
                      categoryId: category.id,
                      sectionName: newSection,
                      sectionOrder: parseInt(newSectionOrder, 10),
                      sectionColumn: parseInt(newSectionColumn || '1', 10),
                    })
                  }
                  disabled={!newSection || addSectionMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-4">
              {category.sections?.map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{section.section_name}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{section.megamenu_items?.length || 0} items</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeleteTarget({
                              type: 'section',
                              id: section.id,
                            });
                            setDeleteAlertOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded border p-3 bg-background">
                      <p className="text-sm font-medium mb-3">Add Item</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Item name"
                          value={newItemBySection[section.id]?.name || ''}
                          onChange={(e) =>
                            setNewItemBySection((prev) => ({
                              ...prev,
                              [section.id]: {
                                name: e.target.value,
                                slug: prev[section.id]?.slug || '',
                                emoji: prev[section.id]?.emoji || '',
                                order: prev[section.id]?.order || '0',
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Slug (optional)"
                          value={newItemBySection[section.id]?.slug || ''}
                          onChange={(e) =>
                            setNewItemBySection((prev) => ({
                              ...prev,
                              [section.id]: {
                                name: prev[section.id]?.name || '',
                                slug: e.target.value,
                                emoji: prev[section.id]?.emoji || '',
                                order: prev[section.id]?.order || '0',
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Emoji (optional)"
                          maxLength={2}
                          value={newItemBySection[section.id]?.emoji || ''}
                          onChange={(e) =>
                            setNewItemBySection((prev) => ({
                              ...prev,
                              [section.id]: {
                                name: prev[section.id]?.name || '',
                                slug: prev[section.id]?.slug || '',
                                emoji: e.target.value,
                                order: prev[section.id]?.order || '0',
                              },
                            }))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Order"
                          value={newItemBySection[section.id]?.order || '0'}
                          onChange={(e) =>
                            setNewItemBySection((prev) => ({
                              ...prev,
                              [section.id]: {
                                name: prev[section.id]?.name || '',
                                slug: prev[section.id]?.slug || '',
                                emoji: prev[section.id]?.emoji || '',
                                order: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            const data = newItemBySection[section.id];
                            if (!data?.name) return;
                            addItemMutation.mutate({
                              sectionId: section.id,
                              name: data.name,
                              slug: data.slug || null,
                              emoji: data.emoji || null,
                              order: parseInt(data.order || '0', 10),
                            });
                          }}
                          disabled={!newItemBySection[section.id]?.name || addItemMutation.isPending}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {section.megamenu_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted rounded"
                      >
                        {editingItem?.id === item.id ? (
                          <div className="flex-1 space-y-2 mr-2">
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                placeholder="Item name"
                                value={editingItem.item_name}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    item_name: e.target.value,
                                  })
                                }
                              />
                              <Input
                                placeholder="Slug (optional)"
                                value={editingItem.item_slug || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    item_slug: e.target.value || null,
                                  })
                                }
                              />
                              <Input
                                placeholder="Emoji (optional)"
                                maxLength={2}
                                value={editingItem.icon_emoji || ''}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    icon_emoji: e.target.value || null,
                                  })
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            {item.icon_emoji && <span className="text-lg">{item.icon_emoji}</span>}
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              {item.item_slug && (
                                <p className="text-xs text-muted-foreground">{item.item_slug}</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {editingItem?.id === item.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateItemMutation.mutate(editingItem);
                                }}
                                disabled={updateItemMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDeleteTarget({
                                    type: 'item',
                                    id: item.id,
                                  });
                                  setDeleteAlertOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="rounded border p-3 bg-background">
                      <p className="text-sm font-medium mb-3">Item Rules & Products</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Select Item</label>
                          <Select
                            value={ruleFormBySection[section.id]?.itemId || ''}
                            onValueChange={(value) =>
                              setRuleFormBySection((prev) => ({
                                ...prev,
                                [section.id]: {
                                  itemId: value,
                                  ruleType: prev[section.id]?.ruleType || 'category',
                                  value: prev[section.id]?.value || '',
                                  min: prev[section.id]?.min || '',
                                  max: prev[section.id]?.max || '',
                                  enabled: prev[section.id]?.enabled ?? true,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose item" />
                            </SelectTrigger>
                            <SelectContent>
                              {section.megamenu_items?.map((itemOption) => (
                                <SelectItem key={itemOption.id} value={itemOption.id}>
                                  {itemOption.item_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Rule Type</label>
                          <Select
                            value={ruleFormBySection[section.id]?.ruleType || 'category'}
                            onValueChange={(value) =>
                              setRuleFormBySection((prev) => ({
                                ...prev,
                                [section.id]: {
                                  itemId: prev[section.id]?.itemId || '',
                                  ruleType: value,
                                  value: prev[section.id]?.value || '',
                                  min: prev[section.id]?.min || '',
                                  max: prev[section.id]?.max || '',
                                  enabled: prev[section.id]?.enabled ?? true,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Rule type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="category">Category</SelectItem>
                              <SelectItem value="metal_type">Metal Type</SelectItem>
                              <SelectItem value="price_range">Price Range</SelectItem>
                              <SelectItem value="weight_range">Weight Range</SelectItem>
                              <SelectItem value="tag">Tag</SelectItem>
                              <SelectItem value="is_bestseller">Best Seller</SelectItem>
                              <SelectItem value="is_new_arrival">New Arrival</SelectItem>
                              <SelectItem value="is_bridal">Bridal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Value</label>
                          {['price_range', 'weight_range'].includes(ruleFormBySection[section.id]?.ruleType || '') ? (
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={ruleFormBySection[section.id]?.min || ''}
                                onChange={(e) =>
                                  setRuleFormBySection((prev) => ({
                                    ...prev,
                                    [section.id]: {
                                      itemId: prev[section.id]?.itemId || '',
                                      ruleType: prev[section.id]?.ruleType || 'price_range',
                                      value: prev[section.id]?.value || '',
                                      min: e.target.value,
                                      max: prev[section.id]?.max || '',
                                      enabled: prev[section.id]?.enabled ?? true,
                                    },
                                  }))
                                }
                              />
                              <Input
                                type="number"
                                placeholder="Max"
                                value={ruleFormBySection[section.id]?.max || ''}
                                onChange={(e) =>
                                  setRuleFormBySection((prev) => ({
                                    ...prev,
                                    [section.id]: {
                                      itemId: prev[section.id]?.itemId || '',
                                      ruleType: prev[section.id]?.ruleType || 'price_range',
                                      value: prev[section.id]?.value || '',
                                      min: prev[section.id]?.min || '',
                                      max: e.target.value,
                                      enabled: prev[section.id]?.enabled ?? true,
                                    },
                                  }))
                                }
                              />
                            </div>
                          ) : ['is_bestseller', 'is_new_arrival', 'is_bridal'].includes(ruleFormBySection[section.id]?.ruleType || '') ? (
                            <Input
                              value="Enabled"
                              readOnly
                            />
                          ) : (
                            <Input
                              placeholder="Value"
                              value={ruleFormBySection[section.id]?.value || ''}
                              onChange={(e) =>
                                setRuleFormBySection((prev) => ({
                                  ...prev,
                                  [section.id]: {
                                    itemId: prev[section.id]?.itemId || '',
                                    ruleType: prev[section.id]?.ruleType || 'category',
                                    value: e.target.value,
                                    min: prev[section.id]?.min || '',
                                    max: prev[section.id]?.max || '',
                                    enabled: prev[section.id]?.enabled ?? true,
                                  },
                                }))
                              }
                            />
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const form = ruleFormBySection[section.id];
                            if (!form?.itemId) return;
                            let ruleValue: Record<string, any> = {};
                            switch (form.ruleType) {
                              case 'category':
                                ruleValue = { category: form.value };
                                break;
                              case 'metal_type':
                                ruleValue = { metal_type: form.value };
                                break;
                              case 'price_range':
                                ruleValue = { min: Number(form.min || 0), max: Number(form.max || 0) };
                                break;
                              case 'weight_range':
                                ruleValue = { min: Number(form.min || 0), max: Number(form.max || 0) };
                                break;
                              case 'tag':
                                ruleValue = { tag: form.value };
                                break;
                              case 'is_bestseller':
                                ruleValue = { enabled: true };
                                break;
                              case 'is_new_arrival':
                                ruleValue = { enabled: true };
                                break;
                              case 'is_bridal':
                                ruleValue = { enabled: true };
                                break;
                              default:
                                ruleValue = {};
                                break;
                            }

                            addRuleMutation.mutate({
                              itemId: form.itemId,
                              ruleType: form.ruleType || 'category',
                              ruleValue,
                            });
                          }}
                          disabled={!ruleFormBySection[section.id]?.itemId || addRuleMutation.isPending}
                        >
                          Add Rule
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {section.megamenu_items?.flatMap((itemOption) =>
                          (itemOption.rules || []).map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between text-xs bg-muted/60 p-2 rounded">
                              <span>
                                {itemOption.item_name} · {rule.rule_type}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteRuleMutation.mutate(rule.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        <label className="text-xs font-medium">Search Products</label>
                        <Input
                          placeholder="Search by name..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                        {!productsLoaded && (
                          <p className="text-xs text-muted-foreground">Loading products...</p>
                        )}
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Select Item</label>
                          <Select
                            value={productFormBySection[section.id]?.itemId || ''}
                            onValueChange={(value) =>
                              setProductFormBySection((prev) => ({
                                ...prev,
                                [section.id]: {
                                  itemId: value,
                                  productId: prev[section.id]?.productId || '',
                                  order: prev[section.id]?.order || '0',
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose item" />
                            </SelectTrigger>
                            <SelectContent>
                              {section.megamenu_items?.map((itemOption) => (
                                <SelectItem key={itemOption.id} value={itemOption.id}>
                                  {itemOption.item_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Select Product</label>
                          <Select
                            value={productFormBySection[section.id]?.productId || ''}
                            onValueChange={(value) =>
                              setProductFormBySection((prev) => ({
                                ...prev,
                                [section.id]: {
                                  itemId: prev[section.id]?.itemId || '',
                                  productId: value,
                                  order: prev[section.id]?.order || '0',
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose product" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredProducts?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Order</label>
                          <Input
                            type="number"
                            value={productFormBySection[section.id]?.order || '0'}
                            onChange={(e) =>
                              setProductFormBySection((prev) => ({
                                ...prev,
                                [section.id]: {
                                  itemId: prev[section.id]?.itemId || '',
                                  productId: prev[section.id]?.productId || '',
                                  order: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            const form = productFormBySection[section.id];
                            if (!form?.itemId || !form?.productId) return;
                            addItemProductMutation.mutate({
                              itemId: form.itemId,
                              productId: form.productId,
                              order: parseInt(form.order || '0', 10),
                            });
                          }}
                          disabled={
                            !productFormBySection[section.id]?.itemId ||
                            !productFormBySection[section.id]?.productId ||
                            addItemProductMutation.isPending ||
                            !productsLoaded
                          }
                        >
                          Add Product to Item
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {section.megamenu_items?.flatMap((itemOption) =>
                          (itemOption.item_products || []).map((product) => (
                            <div key={product.id} className="flex items-center justify-between text-xs bg-muted/60 p-2 rounded">
                              <span>
                                {itemOption.item_name} · {product.product_title}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteItemProductMutation.mutate(product.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Featured Products ({category.featured_products?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Products</label>
                      <Input
                        placeholder="Search by name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Product</label>
                      <Select value={featuredProductId} onValueChange={setFeaturedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredProducts?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Order</label>
                      <Input
                        type="number"
                        value={featuredProductOrder}
                        onChange={(e) => setFeaturedProductOrder(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!featuredProductId) return;
                      if (category.featured_products?.some((p) => p.product_id === featuredProductId)) {
                        toast({
                          title: 'Already added',
                          description: 'This product is already featured in this category.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      addFeaturedProductMutation.mutate({
                        categoryId: category.id,
                        productId: featuredProductId,
                        order: parseInt(featuredProductOrder || '0'),
                      });
                    }}
                    disabled={!featuredProductId || addFeaturedProductMutation.isPending || !productsLoaded}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Featured Product
                  </Button>
                </div>

                {category.featured_products && category.featured_products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {category.featured_products.map((product) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden">
                        {product.product_image_url && (
                          <img
                            src={product.product_image_url}
                            alt={product.product_title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-2 flex items-start justify-between gap-2">
                          <p className="text-xs font-medium line-clamp-2">
                            {product.product_title}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setDeleteTarget({ type: 'featured', id: product.id });
                              setDeleteAlertOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No featured products yet</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
        </TabsContent>
      </Tabs>

      {/* Delete Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The{' '}
            {deleteTarget?.type === 'item'
              ? 'menu item'
              : deleteTarget?.type === 'featured'
              ? 'featured product'
              : 'section'}{' '}
            will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                if (deleteTarget.type === 'item') {
                  deleteItemMutation.mutate(deleteTarget.id);
                } else if (deleteTarget.type === 'featured') {
                  deleteFeaturedMutation.mutate(deleteTarget.id);
                } else {
                  deleteSectionMutation.mutate(deleteTarget.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AdminLayout>
  );
}
