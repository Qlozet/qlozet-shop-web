'use client';

import React, { useMemo } from 'react';
import { GenderToggle } from '@/components/GenderToggle';
import { useApp } from '@/context/AppContext';
import { HERO_BANNERS, BROWSE_CATEGORIES } from '@/data/taxonomy';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { BrowseCategoriesGrid } from '@/components/discover/BrowseCategoriesGrid';
import { VendorShowcaseCarousel } from '@/components/discover/VendorShowcaseCarousel';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import type { ApiBusinessPublic } from '@/lib/api-types';

export default function DiscoverPage() {
  const { gender, setGender } = useApp();

  // ── Fetch live data ─────────────────────────────────────────────
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50 });
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 50 });

  const isLoading = productsLoading || vendorsLoading;

  // Top vendors sorted by rating
  const worthTheHypeVendors = useMemo(() =>
    [...allVendors]
      .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
      .slice(0, 5),
    [allVendors]
  );

  // Top shops by total items sold
  const topShops = useMemo(() =>
    [...allVendors]
      .sort((a, b) => (b.total_items_sold ?? 0) - (a.total_items_sold ?? 0))
      .slice(0, 8),
    [allVendors]
  );

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '32px' }}>

      {/* Gender Toggle — desktop only */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Page Title */}
      <h1
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
        style={{ fontSize: '22px' }}
      >
        Discover
      </h1>

      {/* Hero Banners (static UI config — not from API) */}
      <DiscoverHeroBanners banners={HERO_BANNERS} />

      {/* Browse Categories Grid (static UI config) */}
      <BrowseCategoriesGrid categories={BROWSE_CATEGORIES} />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col animate-pulse" style={{ gap: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col" style={{ gap: '16px' }}>
              <div className="h-3 w-32 bg-[#E5E5E5] rounded" />
              <div className="flex" style={{ gap: '16px' }}>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-[24px] bg-[#F0EBE4] flex-shrink-0" style={{ width: '360px', height: '500px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live data sections — only show after loading */}
      {!isLoading && (
        <>
          {/* Top Shops — showcase cards */}
          <VendorShowcaseCarousel title="Top Shops" vendors={topShops} allProducts={allProducts} />

          {/* Worth the Hype */}
          <VendorShowcaseCarousel title="Worth the Hype" vendors={worthTheHypeVendors} allProducts={allProducts} />
        </>
      )}

    </div>
  );
}
