import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MegamenuItem {
  id: string;
  item_name: string;
  item_slug: string | null;
  icon_emoji: string | null;
  item_order: number;
  is_active: boolean;
  rules?: MegamenuItemRule[];
  item_products?: MegamenuItemProduct[];
}

export interface MegamenuItemRule {
  id: string;
  rule_type: string;
  rule_value: Record<string, any>;
  rule_order: number;
}

export interface MegamenuItemProduct {
  id: string;
  product_id: string;
  product_title: string;
  product_image_url: string;
  product_order: number;
}

export interface MegamenuSection {
  id: string;
  section_name: string;
  section_order: number;
  is_featured: boolean;
  column?: number;
  megamenu_items: MegamenuItem[];
}

export interface MegamenuCategory {
  id: string;
  category_slug: string;
  category_name: string;
  display_order: number;
  is_active: boolean;
  category_href?: string;
  featured_limit?: number;
  megamenu_sections: MegamenuSection[];
  featured_products: Array<{
    id: string;
    product_title: string;
    product_image_url: string;
    product_order: number;
  }>;
}

export const useMegamenu = () => {
  return useQuery({
    queryKey: ['megamenu'],
    queryFn: async () => {
      const { data: settings, error: settingsError } = await supabase
        .from('megamenu_settings')
        .select('is_enabled')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (settingsError) throw settingsError;
      if (settings && settings.is_enabled === false) {
        return [];
      }

      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('megamenu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // Fetch all sections
      const { data: sections, error: secError } = await supabase
        .from('megamenu_sections')
        .select('*')
        .order('section_order', { ascending: true });

      if (secError) throw secError;

      // Fetch all items
      const { data: items, error: itemError } = await supabase
        .from('megamenu_items')
        .select('*')
        .eq('is_active', true)
        .order('item_order', { ascending: true });

      if (itemError) throw itemError;

      // Fetch all item rules
      const { data: rules, error: ruleError } = await supabase
        .from('megamenu_item_rules')
        .select('*')
        .order('rule_order', { ascending: true });

      if (ruleError) throw ruleError;

      // Fetch all item products
      const { data: itemProducts, error: itemProductError } = await supabase
        .from('megamenu_item_products')
        .select('*')
        .order('product_order', { ascending: true });

      if (itemProductError) throw itemProductError;

      // Fetch featured products
      const { data: products, error: prodError } = await supabase
        .from('megamenu_featured_products')
        .select('*')
        .order('product_order', { ascending: true });

      if (prodError) throw prodError;

      // Fetch product categories for megamenu (new simplified flow)
      const { data: menuCategories, error: menuCatError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (menuCatError) throw menuCatError;

      const { data: menuSubcategories, error: menuSubError } = await supabase
        .from('product_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (menuSubError) throw menuSubError;

      // Build nested structure
      const categoryMap = new Map<string, MegamenuCategory>();
      const sectionMap = new Map<string, MegamenuSection>();

      categories?.forEach((cat) => {
        categoryMap.set(cat.id, {
          ...cat,
          megamenu_sections: [],
          featured_products: [],
        });
      });

      sections?.forEach((section) => {
        const category = categoryMap.get(section.megamenu_category_id);
        if (category) {
          const sectionEntry: MegamenuSection = {
            ...section,
            megamenu_items: [],
          };
          category.megamenu_sections.push(sectionEntry);
          sectionMap.set(section.id, sectionEntry);
        }
      });

      items?.forEach((item) => {
        const section = sectionMap.get(item.megamenu_section_id);
        if (section) {
          const itemRules = (rules || []).filter((rule) => rule.megamenu_item_id === item.id);
          const productsForItem = (itemProducts || []).filter(
            (product) => product.megamenu_item_id === item.id
          );
          section.megamenu_items.push({
            ...item,
            rules: itemRules,
            item_products: productsForItem,
          });
        }
      });

      products?.forEach((product) => {
        const category = categoryMap.get(product.megamenu_category_id);
        if (category) {
          category.featured_products.push({
            id: product.id,
            product_title: product.product_title || '',
            product_image_url: product.product_image_url || '',
            product_order: product.product_order,
          });
        }
      });

      const defaultMegamenu = Array.from(categoryMap.values());
      const normalizeName = (value: string) =>
        value
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();

      if (menuSubcategories && menuSubcategories.length > 0) {
        const categorySlugToId = new Map<string, string>();
        const categoryIdToSlug = new Map<string, string>();
        (menuCategories || []).forEach((cat) => {
          categorySlugToId.set(cat.slug, cat.id);
          categoryIdToSlug.set(cat.id, cat.slug);
        });

        const subcategoryMap = new Map<string, Array<typeof menuSubcategories[number]>>();
        menuSubcategories.forEach((sub) => {
          const key = normalizeName(sub.name);
          const slugKey = sub.slug ? normalizeName(sub.slug) : null;
          if (!subcategoryMap.has(key)) subcategoryMap.set(key, []);
          subcategoryMap.get(key)!.push(sub);
          if (slugKey) {
            if (!subcategoryMap.has(slugKey)) subcategoryMap.set(slugKey, []);
            subcategoryMap.get(slugKey)!.push(sub);
          }
        });

        const normalizeItemName = (value: string) => {
          const base = normalizeName(value);
          return base
            .replace(/\b(rings|earrings|necklaces|bangles|bracelets)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };

        defaultMegamenu.forEach((category) => {
          const productCategoryId = categorySlugToId.get(category.category_slug);
          category.megamenu_sections.forEach((section) => {
            section.megamenu_items.forEach((item) => {
              if (item.rules && item.rules.length > 0) return;
              if (item.item_name.toLowerCase().includes('explore all')) return;
              const candidates =
                subcategoryMap.get(normalizeName(item.item_name)) ||
                subcategoryMap.get(normalizeItemName(item.item_name)) ||
                [];
              const match = productCategoryId
                ? candidates.find((sub) => sub.product_category_id === productCategoryId)
                : candidates[0];
              if (!match) return;
              const categorySlug = categoryIdToSlug.get(match.product_category_id);
              item.rules = [
                {
                  id: `auto-rule-${item.id}`,
                  rule_type: 'menu_subcategory',
                  rule_value: {
                    menu_category_id: match.product_category_id,
                    menu_subcategory_id: match.id,
                    ...(categorySlug ? { menu_category_slug: categorySlug } : {}),
                    ...(match.slug ? { menu_subcategory_slug: match.slug } : {}),
                  },
                  rule_order: 0,
                },
              ];
            });
          });
        });
      }
      const hasDefaultContent = defaultMegamenu.some(
        (cat) => cat.megamenu_sections.length > 0 || cat.featured_products.length > 0
      );

      if (!hasDefaultContent && menuCategories && menuCategories.length > 0) {
        const menuCategoryMap = new Map<string, MegamenuCategory>();

        menuCategories.forEach((cat) => {
          menuCategoryMap.set(cat.id, {
            id: cat.id,
            category_slug: cat.slug,
            category_name: cat.name,
            display_order: cat.display_order || 0,
            is_active: cat.is_active ?? true,
            category_href: `/shop?menuCategoryId=${cat.id}`,
            megamenu_sections: [
              {
                id: `menu-section-${cat.id}`,
                section_name: cat.name,
                section_order: 1,
                is_featured: false,
                column: 1,
                megamenu_items: [],
              },
            ],
            featured_products: [],
          });
        });

        menuSubcategories?.forEach((sub) => {
          const category = menuCategoryMap.get(sub.product_category_id);
          if (!category) return;

          category.megamenu_sections[0].megamenu_items.push({
            id: sub.id,
            item_name: sub.name,
            item_slug: null,
            icon_emoji: null,
            item_order: sub.display_order || 0,
            is_active: sub.is_active ?? true,
            rules: [
              {
                id: `rule-menu-sub-${sub.id}`,
                rule_type: 'menu_subcategory',
                rule_value: { menu_category_id: sub.product_category_id, menu_subcategory_id: sub.id },
                rule_order: 0,
              },
            ],
            item_products: [],
          });
        });

        return Array.from(menuCategoryMap.values()).sort((a, b) => a.display_order - b.display_order);
      }

      return hasDefaultContent ? defaultMegamenu : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMegamenuSettings = () => {
  return useQuery({
    queryKey: ['megamenuSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('megamenu_settings')
        .select('id, is_enabled')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ?? { id: null, is_enabled: true };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useMegamenuCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['megamenu', categorySlug],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from('megamenu_categories')
        .select('id')
        .eq('category_slug', categorySlug)
        .single();

      if (catError) throw catError;

      const categoryId = categories.id;

      // Fetch sections for this category
      const { data: sections, error: secError } = await supabase
        .from('megamenu_sections')
        .select(
          `*,
        megamenu_items(*)`
        )
        .eq('megamenu_category_id', categoryId)
        .order('section_order', { ascending: true });

      if (secError) throw secError;

      // Fetch featured products
      const { data: products, error: prodError } = await supabase
        .from('megamenu_featured_products')
        .select('*')
        .eq('megamenu_category_id', categoryId)
        .order('product_order', { ascending: true });

      if (prodError) throw prodError;

      return {
        categoryId,
        sections: sections || [],
        featured_products: products || [],
      };
    },
  });
};
