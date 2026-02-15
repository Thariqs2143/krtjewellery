import { MegamenuCategory } from '@/hooks/useMegamenu';
import { buildShopLinkFromRules, getCategoryHref } from '@/lib/megamenuUtils';
import { Link } from 'react-router-dom';

interface MegamenuPanelProps {
  category: MegamenuCategory;
  preview?: boolean;
}

export function MegamenuPanel({ category, preview = false }: MegamenuPanelProps) {
  if (!category.megamenu_sections.length && !category.featured_products.length) {
    return null;
  }

  const categoryHref = category.category_href ?? getCategoryHref(category.category_slug);
  const featuredLimit = category.featured_limit ?? 2;
  const fallbackItemProducts =
    category.featured_products.length === 0
      ? category.megamenu_sections
          .flatMap((section) => section.megamenu_items)
          .flatMap((item) => item.item_products || [])
      : [];
  const featuredCards =
    category.featured_products.length > 0
      ? category.featured_products.map((product) => ({
          id: product.id,
          title: product.product_title,
          image: product.product_image_url,
          href: `/product/${product.id}`,
        }))
      : fallbackItemProducts.map((product) => ({
          id: product.id,
          title: product.product_title,
          image: product.product_image_url,
          href: `/product/${product.product_id}`,
        }));

  const columns = [[], [], [], []] as Array<typeof category.megamenu_sections>;
  const hasExplicitColumns = category.megamenu_sections.some((section) => typeof section.column === 'number');

  if (hasExplicitColumns) {
    category.megamenu_sections.forEach((section) => {
      const idx = Math.min(Math.max((section.column || 1) - 1, 0), columns.length - 1);
      columns[idx].push(section);
    });
  } else {
    category.megamenu_sections.forEach((section, index) => {
      columns[index % columns.length].push(section);
    });
  }

  return (
    <div
      className={
        preview
          ? "relative w-full bg-white border border-gray-100 shadow-sm"
          : "absolute left-0 right-0 top-full w-full bg-white shadow-2xl z-50 border-t border-gray-100"
      }
    >
      <div className="container mx-auto px-4 select-none">
        <div className="grid grid-cols-12 gap-0 py-8 min-h-96">
          {/* Sections columns */}
          <div
            className={
              category.featured_products.length > 0
                ? "col-span-9 grid grid-cols-4"
                : "col-span-12 grid grid-cols-4"
            }
          >
            {columns.map((sections, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className={`px-6 py-4 space-y-8 ${colIndex === 0 ? "" : "border-l border-gray-200"}`}
              >
                {sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h3 className="font-bold text-[12px] tracking-[0.26em] text-gray-950 uppercase">
                      {section.section_name}
                    </h3>
                    <ul className="space-y-3">
                      {section.megamenu_items.map((item) => {
                        const isExploreAll = item.item_name.toLowerCase().includes('explore all');
                        const ruleLink = buildShopLinkFromRules(item.rules);
                        const itemHref = ruleLink || (item.item_slug ? `/collections/${item.item_slug}` : categoryHref);
                        return (
                          <li key={item.id}>
                          <Link
                            to={itemHref}
                            className={`text-sm font-medium text-gray-800 hover:text-gray-950 transition-colors flex items-center gap-3 ${
                              isExploreAll ? "underline underline-offset-4 decoration-gray-400" : ""
                            }`}
                          >
                            {item.icon_emoji ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[11px] leading-none">
                                {item.icon_emoji}
                              </span>
                            ) : (
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gray-400/70" />
                            )}
                            <span>{item.item_name}</span>
                          </Link>
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Featured products */}
          {featuredCards.length > 0 && (
            <div className="col-span-3 border-l border-gray-200">
              <div className="grid gap-6 px-6 py-4">
                {featuredCards.slice(0, featuredLimit).map((product) => (
                  <Link
                    key={product.id}
                    to={product.href}
                    className="group relative overflow-hidden bg-gray-100"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    )}
                    {!product.image && (
                      <div className="h-56 w-full bg-gray-200" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/45 px-4 py-2">
                      <p className="text-center text-sm font-semibold text-white tracking-wide">
                        {product.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
