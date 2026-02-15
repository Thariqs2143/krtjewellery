import type { MegamenuCategory, MegamenuItem, MegamenuSection, MegamenuItemRule } from '@/hooks/useMegamenu';

const categoryHrefMap: Record<string, string> = {
  rings: '/collections/rings',
  earrings: '/collections/earrings',
  necklaces: '/collections/necklaces',
  bangles: '/collections/bangles',
  engagement: '/collections/wedding-bridal',
  wedding: '/collections/wedding-bridal',
  gifts: '/collections/diamond-jewellery',
  collections: '/shop',
};

export const getCategoryHref = (slug: string) =>
  categoryHrefMap[slug] ?? `/collections/${slug}`;

const buildShopLink = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query.length > 0 ? `/shop?${query}` : '/shop';
};

export const buildShopLinkFromRules = (rules?: MegamenuItemRule[]) => {
  if (!rules || rules.length === 0) return null;

  const categories = new Set<string>();
  const metals = new Set<string>();
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let minWeight: number | undefined;
  let maxWeight: number | undefined;
  let tag: string | undefined;
  let isBestseller = false;
  let isNewArrival = false;
  let isBridal = false;
  let menuCategoryId: string | undefined;
  let menuSubcategoryId: string | undefined;
  let menuCategorySlug: string | undefined;
  let menuSubcategorySlug: string | undefined;

  rules.forEach((rule) => {
    switch (rule.rule_type) {
      case 'category': {
        const value = rule.rule_value?.category;
        if (value) categories.add(value);
        break;
      }
      case 'metal_type': {
        const value = rule.rule_value?.metal_type;
        if (value) metals.add(value);
        break;
      }
      case 'price_range': {
        const min = Number(rule.rule_value?.min ?? NaN);
        const max = Number(rule.rule_value?.max ?? NaN);
        if (!Number.isNaN(min)) minPrice = minPrice === undefined ? min : Math.min(minPrice, min);
        if (!Number.isNaN(max)) maxPrice = maxPrice === undefined ? max : Math.max(maxPrice, max);
        break;
      }
      case 'weight_range': {
        const min = Number(rule.rule_value?.min ?? NaN);
        const max = Number(rule.rule_value?.max ?? NaN);
        if (!Number.isNaN(min)) minWeight = minWeight === undefined ? min : Math.min(minWeight, min);
        if (!Number.isNaN(max)) maxWeight = maxWeight === undefined ? max : Math.max(maxWeight, max);
        break;
      }
      case 'tag': {
        const value = rule.rule_value?.tag;
        if (value && !tag) tag = value;
        break;
      }
      case 'is_bestseller': {
        if (rule.rule_value?.enabled) isBestseller = true;
        break;
      }
      case 'is_new_arrival': {
        if (rule.rule_value?.enabled) isNewArrival = true;
        break;
      }
      case 'is_bridal': {
        if (rule.rule_value?.enabled) isBridal = true;
        break;
      }
      case 'menu_category': {
        const value = rule.rule_value?.menu_category_id;
        if (value) menuCategoryId = value;
        if (rule.rule_value?.menu_category_slug) {
          menuCategorySlug = String(rule.rule_value.menu_category_slug);
        }
        break;
      }
      case 'menu_subcategory': {
        const value = rule.rule_value?.menu_subcategory_id;
        if (value) menuSubcategoryId = value;
        if (rule.rule_value?.menu_category_slug) {
          menuCategorySlug = String(rule.rule_value.menu_category_slug);
        }
        if (rule.rule_value?.menu_subcategory_slug) {
          menuSubcategorySlug = String(rule.rule_value.menu_subcategory_slug);
        }
        break;
      }
      default:
        break;
    }
  });

  if (menuCategorySlug && menuSubcategorySlug) {
    return `/${menuCategorySlug}/${menuSubcategorySlug}`;
  }

  return buildShopLink({
    categories: categories.size ? Array.from(categories).join(',') : undefined,
    metal: metals.size ? Array.from(metals).join(',') : undefined,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    tag,
    isBestseller,
    isNewArrival,
    isBridal,
    menuCategoryId,
    menuSubcategoryId,
  });
};

const buildFallbackSection = (categorySlug: string, categoryName: string): MegamenuSection => {
  const itemSlug = categoryHrefMap[categorySlug]?.startsWith('/collections/')
    ? categoryHrefMap[categorySlug].replace('/collections/', '')
    : null;

  const item: MegamenuItem = {
    id: `fallback-item-${categorySlug}`,
    item_name: `Shop ${categoryName}`,
    item_slug: itemSlug,
    icon_emoji: null,
    item_order: 1,
    is_active: true,
  };

  return {
    id: `fallback-section-${categorySlug}`,
    section_name: 'Shop',
    section_order: 1,
    is_featured: false,
    megamenu_items: [item],
  };
};

export const buildFallbackMegamenu = (): MegamenuCategory[] => {
  const ringsSections: MegamenuSection[] = [
    {
      id: 'fallback-rings-featured',
      section_name: 'Featured',
      section_order: 1,
      is_featured: true,
      column: 1,
      megamenu_items: [
        { id: 'rings-featured-1', item_name: 'Engagement Rings', item_slug: 'wedding-bridal', icon_emoji: '💍', item_order: 1, is_active: true },
        { id: 'rings-featured-2', item_name: 'Mens Rings', item_slug: 'mens-jewellery', icon_emoji: '🧔', item_order: 2, is_active: true },
        { id: 'rings-featured-3', item_name: 'Solitaire Rings', item_slug: 'diamond-jewellery', icon_emoji: '💎', item_order: 3, is_active: true },
        { id: 'rings-featured-4', item_name: 'Anniversary Rings', item_slug: 'diamond-jewellery', icon_emoji: '🎉', item_order: 4, is_active: true },
        { id: 'rings-featured-5', item_name: 'Promise Rings', item_slug: 'diamond-jewellery', icon_emoji: '❤️', item_order: 5, is_active: true },
        { id: 'rings-featured-6', item_name: 'Bands', item_slug: 'rings', icon_emoji: '💍', item_order: 6, is_active: true },
        { id: 'rings-featured-7', item_name: 'Traditional Rings', item_slug: 'rings', icon_emoji: '✨', item_order: 7, is_active: true },
        { id: 'rings-featured-8', item_name: 'Cocktail Rings', item_slug: 'rings', icon_emoji: '🍸', item_order: 8, is_active: true },
        { id: 'rings-featured-9', item_name: 'Infinity Rings', item_slug: 'rings', icon_emoji: '♾️', item_order: 9, is_active: true },
      ],
    },
    {
      id: 'fallback-rings-natural',
      section_name: 'Natural Gemstone Rings',
      section_order: 2,
      is_featured: false,
      column: 2,
      megamenu_items: [
        { id: 'rings-natural-1', item_name: 'Diamond Rings', item_slug: 'diamond-jewellery', icon_emoji: '💎', item_order: 1, is_active: true },
        { id: 'rings-natural-2', item_name: 'Emerald Rings', item_slug: 'rings', icon_emoji: '🟢', item_order: 2, is_active: true },
        { id: 'rings-natural-3', item_name: 'Ruby Rings', item_slug: 'rings', icon_emoji: '🔴', item_order: 3, is_active: true },
        { id: 'rings-natural-4', item_name: 'Sapphire Rings', item_slug: 'rings', icon_emoji: '🔵', item_order: 4, is_active: true },
        { id: 'rings-natural-5', item_name: 'Tanzanite Rings', item_slug: 'rings', icon_emoji: '🟣', item_order: 5, is_active: true },
        { id: 'rings-natural-6', item_name: 'Aquamarine Rings', item_slug: 'rings', icon_emoji: '🔷', item_order: 6, is_active: true },
        { id: 'rings-natural-7', item_name: 'Opal Rings', item_slug: 'rings', icon_emoji: '⚪', item_order: 7, is_active: true },
        { id: 'rings-natural-8', item_name: 'Amethyst Rings', item_slug: 'rings', icon_emoji: '🟣', item_order: 8, is_active: true },
        { id: 'rings-natural-9', item_name: 'Garnet Rings', item_slug: 'rings', icon_emoji: '🔴', item_order: 9, is_active: true },
        { id: 'rings-natural-10', item_name: 'London Blue Topaz Rings', item_slug: 'rings', icon_emoji: '🔵', item_order: 10, is_active: true },
        { id: 'rings-natural-11', item_name: 'Pearl Rings', item_slug: 'rings', icon_emoji: '⚪', item_order: 11, is_active: true },
        { id: 'rings-natural-12', item_name: 'Explore All', item_slug: 'rings', icon_emoji: null, item_order: 99, is_active: true },
      ],
    },
    {
      id: 'fallback-rings-lab',
      section_name: 'Lab-Grown Rings',
      section_order: 3,
      is_featured: false,
      column: 3,
      megamenu_items: [
        { id: 'rings-lab-1', item_name: 'Lab Diamond Rings', item_slug: 'diamond-jewellery', icon_emoji: '💎', item_order: 1, is_active: true },
        { id: 'rings-lab-2', item_name: 'Lab Coloured Diamond Rings', item_slug: 'diamond-jewellery', icon_emoji: '🌈', item_order: 2, is_active: true },
        { id: 'rings-lab-3', item_name: 'Lab Emerald Rings', item_slug: 'rings', icon_emoji: '🟢', item_order: 3, is_active: true },
        { id: 'rings-lab-4', item_name: 'Lab Blue Sapphire Rings', item_slug: 'rings', icon_emoji: '🔵', item_order: 4, is_active: true },
        { id: 'rings-lab-5', item_name: 'Lab Ruby Rings', item_slug: 'rings', icon_emoji: '🔴', item_order: 5, is_active: true },
        { id: 'rings-lab-6', item_name: 'Explore All', item_slug: 'rings', icon_emoji: null, item_order: 99, is_active: true },
      ],
    },
    {
      id: 'fallback-rings-stone-shape',
      section_name: 'Rings By Stone Shape',
      section_order: 4,
      is_featured: false,
      column: 3,
      megamenu_items: [
        { id: 'rings-shape-1', item_name: 'Round Rings', item_slug: 'rings', icon_emoji: '⚪', item_order: 1, is_active: true },
        { id: 'rings-shape-2', item_name: 'Oval Rings', item_slug: 'rings', icon_emoji: '🥚', item_order: 2, is_active: true },
        { id: 'rings-shape-3', item_name: 'Pear Rings', item_slug: 'rings', icon_emoji: '🍐', item_order: 3, is_active: true },
        { id: 'rings-shape-4', item_name: 'Heart Rings', item_slug: 'rings', icon_emoji: '❤️', item_order: 4, is_active: true },
        { id: 'rings-shape-5', item_name: 'Emerald-Cut Rings', item_slug: 'rings', icon_emoji: '🔷', item_order: 5, is_active: true },
        { id: 'rings-shape-6', item_name: 'Explore All', item_slug: 'rings', icon_emoji: null, item_order: 99, is_active: true },
      ],
    },
    {
      id: 'fallback-rings-price',
      section_name: 'Rings By Price Range',
      section_order: 5,
      is_featured: false,
      column: 4,
      megamenu_items: [
        { id: 'rings-price-1', item_name: '₹10,000 – ₹25,000', item_slug: 'rings', icon_emoji: null, item_order: 1, is_active: true },
        { id: 'rings-price-2', item_name: '₹25,000 – ₹50,000', item_slug: 'rings', icon_emoji: null, item_order: 2, is_active: true },
        { id: 'rings-price-3', item_name: '₹50,000 – ₹1,00,000', item_slug: 'rings', icon_emoji: null, item_order: 3, is_active: true },
        { id: 'rings-price-4', item_name: '₹1,00,000 – ₹2,00,000', item_slug: 'rings', icon_emoji: null, item_order: 4, is_active: true },
        { id: 'rings-price-5', item_name: 'Above ₹2,00,000', item_slug: 'rings', icon_emoji: null, item_order: 5, is_active: true },
      ],
    },
    {
      id: 'fallback-rings-metal',
      section_name: 'Rings By Metal Purity',
      section_order: 6,
      is_featured: false,
      column: 4,
      megamenu_items: [
        { id: 'rings-metal-1', item_name: '9 KT Gold', item_slug: 'rings', icon_emoji: '✨', item_order: 1, is_active: true },
        { id: 'rings-metal-2', item_name: '14 KT Gold', item_slug: 'rings', icon_emoji: '✨', item_order: 2, is_active: true },
        { id: 'rings-metal-3', item_name: '18 KT Gold', item_slug: 'rings', icon_emoji: '✨', item_order: 3, is_active: true },
        { id: 'rings-metal-4', item_name: '925 Silver', item_slug: 'rings', icon_emoji: '⚪', item_order: 4, is_active: true },
      ],
    },
  ];
  const fallbackCategories: Array<Pick<MegamenuCategory, 'category_slug' | 'category_name' | 'display_order'>> = [
    { category_slug: 'rings', category_name: 'RINGS', display_order: 1 },
    { category_slug: 'earrings', category_name: 'EARRINGS', display_order: 2 },
    { category_slug: 'necklaces', category_name: 'NECKLACES', display_order: 3 },
    { category_slug: 'bangles', category_name: 'BANGLES & BRACELETS', display_order: 4 },
    { category_slug: 'engagement', category_name: 'ENGAGEMENT & WEDDING', display_order: 5 },
    { category_slug: 'gifts', category_name: 'GIFTS', display_order: 6 },
    { category_slug: 'collections', category_name: 'COLLECTIONS', display_order: 7 },
  ];

  return fallbackCategories.map((category) => ({
    id: `fallback-${category.category_slug}`,
    category_slug: category.category_slug,
    category_name: category.category_name,
    display_order: category.display_order,
    is_active: true,
    category_href: getCategoryHref(category.category_slug),
    megamenu_sections:
      category.category_slug === 'rings'
        ? ringsSections
        : [buildFallbackSection(category.category_slug, category.category_name)],
    featured_products: [],
  }));
};
