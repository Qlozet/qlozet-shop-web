'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { GenderToggle } from '@/components/GenderToggle';
import { TrendingBanner } from '@/components/TrendingBanner';
import { VendorShowcaseCard } from '@/components/VendorShowcaseCard';
import { PromoBanner } from '@/components/PromoBanner';
import { ShopByCategory } from '@/components/ShopByCategory';
import { FollowingBar } from '@/components/FollowingBar';
import { ForYouSection } from '@/components/ForYouSection';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import { useTrendingProducts, useNewArrivals, usePersonalizedFeed } from '@/hooks/useRecommendations';
import { ProductCarousel } from '@/components/discover/ProductCarousel';
import { getProductImage } from '@/lib/api-types';
import type { ApiProduct, ApiBusinessPublic, ApiFeedItem } from '@/lib/api-types';

// ─── Category Section Config ──────────────────────────────────────
const FEED_SECTIONS = [
  { key: 'accessories', label: 'ACCESSORIES', kind: 'accessory' as const, href: '/discover/accessories' },
  { key: 'custom_made', label: 'CUSTOM MADE', kind: 'clothing' as const, clothingType: 'customize', href: '/discover/custom' },
  { key: 'clothing', label: 'READY TO WEAR', kind: 'clothing' as const, clothingType: 'non_customize', href: '/discover/ready-to-wear' },
  { key: 'fabric', label: 'FABRIC', kind: 'fabric' as const, href: '/discover/fabric' },
] as const;

// ─── Scrollable Vendor Row ────────────────────────────────────────
function VendorRow({
  vendors,
  vendorProductMap,
  followedVendors,
  onToggleFollow,
  section,
}: {
  vendors: ApiBusinessPublic[];
  vendorProductMap: Map<string, ApiProduct[]>;
  followedVendors: string[];
  onToggleFollow: (id: string) => void;
  section?: typeof FEED_SECTIONS[number];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar"
        style={{ gap: '16px', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {vendors.map((vendor) => {
          let vendorProducts = vendorProductMap.get(vendor._id) ?? [];
          
          if (section) {
            vendorProducts = vendorProducts.filter((p) => {
              if (p.kind !== section.kind) return false;
              if (section.kind === 'clothing' && 'clothingType' in section) {
                if (p.clothing?.type !== section.clothingType) return false;
              }
              return true;
            });
          }

          // Skip vendors with no products to display
          if (vendorProducts.length === 0) return null;

          return (
            <VendorShowcaseCard
              key={vendor._id}
              vendor={vendor}
              products={vendorProducts}
              isFollowing={followedVendors.includes(vendor._id)}
              onToggleFollow={() => onToggleFollow(vendor._id)}
            />
          );
        })}
      </div>

      {/* Scroll right button */}
      {vendors.length > 3 && (
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          className="absolute z-10 flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
          style={{
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <ChevronRight size={18} color="var(--text-primary)" />
        </button>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse" style={{ gap: '36px' }}>
      {/* Trending banner skeleton */}
      <div className="rounded-[30px]" style={{ height: '280px', background: 'var(--bg-surface-elevated)' }} />
      {/* Category skeleton */}
      <div className="flex" style={{ gap: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[24px] flex-shrink-0 w-[72vw] max-w-[360px] aspect-square" style={{ background: 'var(--bg-surface-elevated)' }} />
        ))}
      </div>
      {/* Vendor row skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col" style={{ gap: '16px' }}>
          <div className="h-3 w-32 rounded" style={{ background: 'var(--bg-surface-elevated)' }} />
          <div className="flex" style={{ gap: '16px' }}>
            {[1, 2, 3].map((j) => (
              <div key={j} className="rounded-[24px] flex-shrink-0 w-[72vw] max-w-[360px] h-[500px]" style={{ background: 'var(--bg-surface-elevated)' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const {
    user,
    gender,
    setGender,
    genderSelected,
    setGenderSelected,
    followedVendors,
    toggleFollowVendor,
    isInitialized,
    recentlyViewed,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ── Fetch live data ─────────────────────────────────────────────
  const audience = gender === 'male' ? 'men' : 'women';
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50, audience });
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 50 });

  // ── Recommendation engine feeds ─────────────────────────────────
  const { items: trendingItems } = useTrendingProducts(10);
  const { items: newArrivalItems } = useNewArrivals(10);
  const { items: personalizedItems } = usePersonalizedFeed({ limit: 12 });

  // Helper: extract ApiProduct[] from feed items
  const feedToProducts = (items: ApiFeedItem[]): ApiProduct[] =>
    items.map(i => i.product).filter((p): p is ApiProduct => !!p);

  const suggestions = [
    "A comfortable wedding attire hot weather",
    "Cargo pants",
    "Silk agbada"
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  const handleGenderSelect = (g: 'male' | 'female') => {
    setGender(g);
    setGenderSelected(true);
  };

  // ── Build vendor → products lookup ──────────────────────────────
  const vendorProductMap = useMemo(() => {
    const map = new Map<string, ApiProduct[]>();
    for (const p of allProducts) {
      const bizId = typeof p.business === 'string' ? p.business : p.business?._id;
      if (!bizId) continue;
      if (!map.has(bizId)) map.set(bizId, []);
      map.get(bizId)!.push(p);
    }
    return map;
  }, [allProducts]);

  // ── Derive vendor "category" from their products (Option B) ────
  const sectionVendors = useMemo(() => {
    const result: Record<string, ApiBusinessPublic[]> = {};
    for (const section of FEED_SECTIONS) {
      const vendorIds = new Set<string>();
      for (const p of allProducts) {
        const bizId = typeof p.business === 'string' ? p.business : p.business?._id;
        if (!bizId) continue;
        if (p.kind !== section.kind) continue;
        // For clothing sections, also check clothing type
        if (section.kind === 'clothing' && 'clothingType' in section) {
          if (p.clothing?.type !== section.clothingType) continue;
        }
        vendorIds.add(bizId);
      }
      result[section.key] = allVendors.filter((v) => vendorIds.has(v._id));
    }
    return result;
  }, [allProducts, allVendors]);

  // ─── Determine which view to show ──────────────────────────────
  const showFeed = genderSelected || !!user;

  // Wait for client hydration to prevent flashing the wrong view
  if (!isInitialized) return null;

  // ─── STATE A: Gender Selector ──────────────────────────────────
  if (!showFeed) {
    return (
      <div className="flex flex-col min-h-full items-center gap-10 font-body w-full">

        {/* 1. TOP LOGO — hidden on mobile (shell header has it) */}
        <div className="hidden lg:flex items-center justify-center">
          <QlozetLogo width={80} color="#2C1810" />
        </div>

        {/* 2. SEARCH BAR & DROPDOWN — hidden on mobile (shell header has search) */}
        <div id="homepage-top-search" className="hidden lg:block w-full max-w-[600px] relative -mt-4 z-30">
          <form
            onSubmit={handleSearchSubmit}
            className={`w-full rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center transition-all duration-300 relative z-40 ${isSearchFocused ? 'shadow-[0_14px_45px_rgba(0,0,0,0.12)]' : ''}`}
            style={{ padding: '8px 8px 8px 32px', background: 'var(--bg-base)', border: '1px solid var(--border-glass)' }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="What are you looking for today?"
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium placeholder-[#9A8F86] transition-all text-center focus:text-left"
              style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
            />
            <button
              type="submit"
              aria-label="Search"
              className="w-[48px] h-[48px] rounded-full bg-[#381F10] text-white flex items-center justify-center hover:bg-[#201007] transition-transform active:scale-95 shrink-0 shadow-[0_4px_15px_rgba(56,31,16,0.5)]"
              style={{ marginLeft: '16px' }}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </form>

          {/* Search Dropdown */}
          <div
            className={`absolute top-full left-0 w-full rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border flex flex-col transition-all duration-400 origin-top z-30 ${isSearchFocused ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
            style={{ padding: '24px', gap: '20px', marginTop: '12px', background: 'var(--bg-base)', borderColor: 'var(--border-glass)' }}
          >
            <div className="flex flex-col text-left" style={{ gap: '12px' }}>
              <span className="text-[13px] font-extrabold tracking-wide ml-2" style={{ color: 'var(--text-primary)' }}>Suggestions</span>
              <div className="flex flex-col items-start" style={{ gap: '10px' }}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[13px] font-medium rounded-full transition-colors text-left"
                    style={{ padding: '10px 20px', background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[16px]" style={{ padding: '16px 20px', marginTop: '8px', background: 'var(--bg-surface-elevated)' }}>
              <p className="text-[11.5px] leading-[1.6] font-semibold text-left" style={{ color: 'var(--text-muted)' }}>
                Learn more on how we use your data to give you a personalized experience. Recommendation are information purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CATEGORY CARDS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 flex-1">

          {/* Men Card */}
          <button
            type="button"
            onClick={() => handleGenderSelect('male')}
            aria-label="Shop the Men's collection"
            className="relative block text-left rounded-[20px] lg:rounded-[30px] overflow-hidden group cursor-pointer w-full h-[300px] lg:h-[600px] shadow-lg hover:shadow-2xl transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <Image
              src="/image/seun.png"
              alt="Men Collection"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
              className="group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <h2 className="text-white text-[2.5rem] lg:text-[3.5rem] font-extrabold tracking-[0.1em] mb-[80px] lg:mb-[180px] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform group-hover:-translate-y-4 transition-transform duration-500">
                MEN
              </h2>
            </div>

            <div className="absolute bottom-16 inset-x-0 flex justify-center z-20 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
              <span className="group/btn flex items-center gap-5 text-white text-2xl font-extrabold tracking-[0.2em] uppercase hover:scale-105 hover:text-white/80 drop-shadow-xl transition-all duration-300">
                <span className="border-b-2 border-transparent group-hover/btn:border-white pb-1 transition-all">Shop Now</span>
                <ArrowRight size={32} className="transition-transform duration-300 group-hover/btn:translate-x-3" />
              </span>
            </div>
          </button>

          {/* Women Card */}
          <button
            type="button"
            onClick={() => handleGenderSelect('female')}
            aria-label="Shop the Women's collection"
            className="relative block text-left rounded-[20px] lg:rounded-[30px] overflow-hidden group cursor-pointer w-full h-[300px] lg:h-[600px] shadow-lg hover:shadow-2xl transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <Image
              src="/image/slim-girl-1.jpg"
              alt="Women Collection"
              fill
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
              className="group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <h2 className="text-white text-[2.5rem] lg:text-[3.5rem] font-extrabold tracking-[0.1em] mb-[80px] lg:mb-[180px] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform group-hover:-translate-y-4 transition-transform duration-500">
                WOMEN
              </h2>
            </div>

            <div className="absolute bottom-16 inset-x-0 flex justify-center z-20 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
              <span className="group/btn flex items-center gap-5 text-white text-2xl font-extrabold tracking-[0.2em] uppercase hover:scale-105 hover:text-white/80 drop-shadow-xl transition-all duration-300">
                <span className="border-b-2 border-transparent group-hover/btn:border-white pb-1 transition-all">Shop Now</span>
                <ArrowRight size={32} className="transition-transform duration-300 group-hover/btn:translate-x-3" />
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ─── STATE B: Main Home Feed ────────────────────────────────────
  const isLoading = productsLoading || vendorsLoading;

  if (isLoading) {
    return <FeedSkeleton />;
  }

  // First product image for "For You" hero
  const forYouHeroImage = allProducts[0] ? getProductImage(allProducts[0]) : undefined;

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '36px' }}>

      {/* Gender Toggle — desktop only (mobile uses shell header) */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Following Bar — only for signed-in users with followed vendors */}
      {user && followedVendors.length > 0 && (
        <FollowingBar followedVendorIds={followedVendors} vendors={allVendors} />
      )}

      {/* Trending Banner */}
      <TrendingBanner />

      {/* Shop by Category — Amazon-style grid */}
      <ShopByCategory products={allProducts} />

      {/* Category Sections */}
      {FEED_SECTIONS.map((section) => {
        const vendors = sectionVendors[section.key] ?? [];

        // Only show vendors that have products in this category — no fallback to generic vendors
        const displayVendors = vendors.slice(0, 8);

        if (displayVendors.length === 0) return null;

        return (
          <div key={section.key} className="flex flex-col" style={{ gap: '16px' }}>
            {/* Section Header */}
            <Link href={section.href} className="flex items-center group/sec" style={{ gap: '8px', textDecoration: 'none' }}>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {section.label}
              </h3>
              <ChevronRight size={14} color="var(--text-primary)" className="transition-transform group-hover/sec:translate-x-1" />
              <div style={{ height: '1px', flex: 1, background: 'var(--border-glass)' }} />
            </Link>

            {/* Vendor Cards Row */}
            <VendorRow
              vendors={displayVendors}
              vendorProductMap={vendorProductMap}
              followedVendors={followedVendors}
              onToggleFollow={toggleFollowVendor}
              section={section}
            />
          </div>
        );
      })}

      {/* ── Recommendation Engine Rows ──────────────────────────── */}

      {/* Personalized "For You" — logged-in only */}
      {user && feedToProducts(personalizedItems).length > 0 && (
        <ProductCarousel
          title="For You"
          products={feedToProducts(personalizedItems)}
          href="/discover"
        />
      )}

      {/* Trending — powered by recommendation engine, fallback to generic */}
      {(() => {
        const trendingProducts = feedToProducts(trendingItems).length > 0
          ? feedToProducts(trendingItems)
          : allProducts.slice(0, 10);
        return trendingProducts.length > 0 ? (
          <ProductCarousel title="Trending" products={trendingProducts} href="/products?sort=relevance" />
        ) : null;
      })()}

      {/* What's New — powered by recommendation engine, fallback to reversed products */}
      {(() => {
        const newProducts = feedToProducts(newArrivalItems).length > 0
          ? feedToProducts(newArrivalItems)
          : [...allProducts].reverse().slice(0, 10);
        return newProducts.length > 0 ? (
          <ProductCarousel title="What's New" products={newProducts} href="/products?sort=date" />
        ) : null;
      })()}

      {/* For You Hero + Recently Seen — signed-in users only */}
      {user && (
        <ForYouSection recentlyViewed={recentlyViewed} heroImage={forYouHeroImage} />
      )}

      {/* Promo Banner */}
      <PromoBanner />

    </div>
  );
}
