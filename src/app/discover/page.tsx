'use client';

import React from 'react';
import { GenderToggle } from '@/components/GenderToggle';
import { useApp } from '@/context/AppContext';
import { productCatalog } from '@/data/products';
import { HERO_BANNERS, BROWSE_CATEGORIES, getTrending, getWhatsNew, getTopRated } from '@/data/taxonomy';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { BrowseCategoriesGrid } from '@/components/discover/BrowseCategoriesGrid';
import { ProductCarousel } from '@/components/discover/ProductCarousel';
import { vendorCatalog } from '@/data/vendors';
import { VendorCarousel } from '@/components/discover/VendorCarousel';

export default function DiscoverPage() {
  const { gender, setGender } = useApp();

  const allProducts = productCatalog;

  // Top 5 vendors sorted by rating, then followers
  const worthTheHypeVendors = [...vendorCatalog]
    .sort((a, b) => b.rating - a.rating || b.followers - a.followers)
    .slice(0, 5);

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

      {/* Hero Banners */}
      <DiscoverHeroBanners banners={HERO_BANNERS} />

      {/* Browse Categories Grid */}
      <BrowseCategoriesGrid categories={BROWSE_CATEGORIES} />

      {/* Worth the Hype */}
      <VendorCarousel title="Worth the Hype" vendors={worthTheHypeVendors} allProducts={allProducts} />

      {/* Trending */}
      <ProductCarousel title="Trending" products={getTrending(allProducts)} />

      {/* What's New */}
      <ProductCarousel title="What's New" products={getWhatsNew(allProducts)} />

      {/* Top Rated */}
      <ProductCarousel title="Top Rated" products={getTopRated(allProducts)} />

    </div>
  );
}
