'use client';

import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { GenderToggle } from '@/components/GenderToggle';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { HERO_BANNERS, BROWSE_CATEGORIES } from '@/data/taxonomy';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { BrowseCategoriesGrid } from '@/components/discover/BrowseCategoriesGrid';
import { VendorShowcaseCarousel } from '@/components/discover/VendorShowcaseCarousel';
import { DealCarousel } from '@/components/discover/DealCarousel';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import type { ApiBusinessPublic } from '@/lib/api-types';
import { getProductImage, getProductTag, hasDiscount } from '@/lib/api-types';

export default function DiscoverPage() {
  const { gender, setGender } = useApp();
  const { isDark } = useTheme();
  // Match the real panels: mute the rich category colours in dark mode.
  const panelBg = (color: string) => (isDark ? `color-mix(in srgb, ${color} 72%, var(--bg-surface))` : color);

  // ── Fetch live data ─────────────────────────────────────────────
  const audience = gender === 'male' ? 'men' : 'women';
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50, audience });
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 50 });

  const isLoading = productsLoading || vendorsLoading;

  // Only vendors that actually have products to show (hide empty shops).
  // `total_products` is undefined on older API responses — treat unknown as
  // visible so the carousels don't go empty before the backend is deployed.
  const stockedVendors = useMemo(
    () => allVendors.filter((v) => (v.total_products ?? 1) > 0),
    [allVendors]
  );

  // Top vendors sorted by rating
  const worthTheHypeVendors = useMemo(() =>
    [...stockedVendors]
      .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
      .slice(0, 5),
    [stockedVendors]
  );

  // Top shops by total items sold
  const topShops = useMemo(() =>
    [...stockedVendors]
      .sort((a, b) => (b.total_items_sold ?? 0) - (a.total_items_sold ?? 0))
      .slice(0, 8),
    [stockedVendors]
  );

  // ── Dynamic Browse Categories ──────────────────────────────────
  const shopCategoryLabels = ['CLOTHING', 'ACCESSORIES', 'FABRIC', 'DESIGNS'];
  const curatedCollectionLabels = ["WHAT'S NEW", 'DISCOUNTS', 'TOP RATED', 'TRENDING'];

  const processCategory = (cat: typeof BROWSE_CATEGORIES[0]) => {
    let filtered = [...allProducts];
    if (cat.label === 'CLOTHING') filtered = filtered.filter(p => p.kind === 'clothing');
    else if (cat.label === 'ACCESSORIES') filtered = filtered.filter(p => p.kind === 'accessory');
    else if (cat.label === 'FABRIC') filtered = filtered.filter(p => p.kind === 'fabric');
    else if (cat.label === 'DESIGNS') filtered = filtered.filter(p => getProductTag(p) === 'CUSTOMIZABLE');
    else if (cat.label === "WHAT'S NEW") filtered = [...filtered].reverse();
    else if (cat.label === 'DISCOUNTS') filtered = filtered.filter(p => hasDiscount(p));
    else if (cat.label === 'TOP RATED') filtered = [...filtered].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    else if (cat.label === 'TRENDING') {
      // For now trending is just slicing the raw list, or based on relevance in backend
      filtered = [...filtered]; 
    }

    // Smart hiding: if products are fully loaded and there are ZERO matching items, hide the card
    if (!productsLoading && filtered.length === 0) return null;

    if (filtered.length >= 3) {
      const top3 = filtered.slice(0, 3);
      return {
        ...cat,
        images: top3.map(p => getProductImage(p)),
        productIds: top3.map(p => p._id),
      };
    }
    return cat; // fallback to static if not enough live items (but > 0)
  };

  const shopCategories = useMemo(() => {
    return BROWSE_CATEGORIES
      .filter(c => shopCategoryLabels.includes(c.label))
      .map(processCategory)
      .filter(Boolean) as typeof BROWSE_CATEGORIES;
  }, [allProducts, allVendors, productsLoading, vendorsLoading]);

  const curatedCollections = useMemo(() => {
    return BROWSE_CATEGORIES
      .filter(c => curatedCollectionLabels.includes(c.label))
      .map(processCategory)
      .filter(Boolean) as typeof BROWSE_CATEGORIES;
  }, [allProducts, allVendors, productsLoading, vendorsLoading]);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '32px' }}>

      {/* Gender Toggle — desktop only */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Page Title */}
      <h1
        className="text-left lg:text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
        style={{ fontSize: '22px' }}
      >
        Discover
      </h1>

      {/* Hero Banners (static UI config — not from API) */}
      <DiscoverHeroBanners banners={HERO_BANNERS} />

      {/* Categories & Collections — show skeletons while loading */}
      {isLoading ? (
        <>
          {/* Shop by Category Skeleton */}
          {(() => {
            const shopSkeletonData = [
              { label: 'CLOTHING', color: '#3B3026' },
              { label: 'ACCESSORIES', color: '#4A6741' },
              { label: 'FABRIC', color: '#5B4A6B' },
              { label: 'DESIGNS', color: '#2E4A62' },
            ];
            const curatedSkeletonData = [
              { label: "WHAT'S NEW", color: '#B04A4A' },
              { label: 'DISCOUNTS', color: '#C48B3F' },
              { label: 'TOP RATED', color: '#3A7A6A' },
              { label: 'TRENDING', color: '#6B5B4A' },
            ];

            const renderSkeletonGrid = (title: string, items: { label: string; color: string }[]) => (
              <div className="flex flex-col" style={{ gap: '16px' }}>
                {/* Section Header */}
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {title}
                  </h2>
                  <ChevronRight size={14} color="var(--text-primary)" />
                </div>
                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col overflow-hidden"
                      style={{ borderRadius: '24px', background: panelBg(item.color) }}
                    >
                      {/* Header — label + chevron */}
                      <div className="flex items-center justify-between" style={{ padding: '16px 16px 10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </span>
                        <ChevronRight size={16} color="#FFFFFF" style={{ opacity: 0.7 }} />
                      </div>
                      {/* Image placeholders — 3 pulsing boxes */}
                      <div className="flex flex-1" style={{ gap: '12px', padding: '0 16px 16px' }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`animate-pulse${i === 2 ? ' hidden lg:block' : ''}`}
                            style={{
                              flex: 1,
                              aspectRatio: '3 / 4',
                              borderRadius: '16px',
                              background: 'rgba(255,255,255,0.15)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

            return (
              <>
                {renderSkeletonGrid('Shop by Category', shopSkeletonData)}
                {renderSkeletonGrid('Curated For You', curatedSkeletonData)}
              </>
            );
          })()}
        </>
      ) : (
        <>
          <BrowseCategoriesGrid title="Shop by Category" categories={shopCategories} />
          <BrowseCategoriesGrid title="Curated For You" categories={curatedCollections} />
        </>
      )}

      {/* Loading State for vendor sections */}
      {isLoading && (
        <div className="flex flex-col animate-pulse" style={{ gap: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col" style={{ gap: '16px' }}>
              <div className="h-3 w-32 bg-[var(--bg-surface-elevated)] rounded" />
              <div className="flex" style={{ gap: '16px' }}>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-[24px] bg-[var(--bg-surface-elevated)] flex-shrink-0" style={{ width: '360px', height: '500px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live data sections — only show after loading */}
      {!isLoading && (
        <>
          {/* Vendor Deals — self-hides when no vendor has an active discount */}
          <DealCarousel title="Vendor Deals" vendors={allVendors} allProducts={allProducts} />

          {/* Top Shops — showcase cards */}
          <VendorShowcaseCarousel title="Top Shops" vendors={topShops} allProducts={allProducts} />

          {/* Worth the Hype */}
          <VendorShowcaseCarousel title="Worth the Hype" vendors={worthTheHypeVendors} allProducts={allProducts} />
        </>
      )}

    </div>
  );
}
