'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { productCatalog } from '@/data/products';
import { vendorCatalog } from '@/data/vendors';
import { GenderToggle } from '@/components/GenderToggle';
import { TrendingBanner } from '@/components/TrendingBanner';
import { VendorCard } from '@/components/VendorCard';
import { PromoBanner } from '@/components/PromoBanner';

// ─── Category Section Config ──────────────────────────────────────
const FEED_SECTIONS = [
  { key: 'accessories', label: 'ACCESSORIES', filter: 'accessories' },
  { key: 'custom_made', label: 'CUSTOM MADE', filter: 'custom_made' },
  { key: 'clothing', label: 'READY TO WEAR', filter: 'clothing' },
  { key: 'fabric', label: 'FABRIC', filter: 'fabric' },
] as const;

// ─── Scrollable Vendor Row ────────────────────────────────────────
function VendorRow({
  vendors,
  followedVendors,
  onToggleFollow,
}: {
  vendors: typeof vendorCatalog;
  followedVendors: string[];
  onToggleFollow: (id: string) => void;
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
          const vendorProducts = productCatalog.filter((p) =>
            vendor.productIds.includes(p.id)
          );
          return (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              products={vendorProducts}
              isFollowing={followedVendors.includes(vendor.id)}
              onToggleFollow={() => onToggleFollow(vendor.id)}
            />
          );
        })}
      </div>

      {/* Scroll right button */}
      {vendors.length > 3 && (
        <button
          onClick={scrollRight}
          className="absolute z-10 flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
          style={{
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5E5E5',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <ChevronRight size={18} color="#1A1A1A" />
        </button>
      )}
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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
            className={`w-full bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center transition-all duration-300 relative z-40 ${isSearchFocused ? 'shadow-[0_14px_45px_rgba(0,0,0,0.12)]' : ''}`}
            style={{ padding: '8px 8px 8px 32px' }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="What fit looking for today ?"
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-[#111111] placeholder-[#111111] transition-all text-center focus:text-left"
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
            />
            <button
              type="submit"
              className="w-[48px] h-[48px] rounded-full bg-[#381F10] text-white flex items-center justify-center hover:bg-[#201007] transition-transform active:scale-95 shrink-0 shadow-[0_4px_15px_rgba(56,31,16,0.5)]"
              style={{ marginLeft: '16px' }}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </form>

          {/* Search Dropdown */}
          <div
            className={`absolute top-full left-0 w-full bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col transition-all duration-400 origin-top z-30 ${isSearchFocused ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
            style={{ padding: '24px', gap: '20px', marginTop: '12px' }}
          >
            <div className="flex flex-col text-left" style={{ gap: '12px' }}>
              <span className="text-[13px] font-extrabold text-[#111111] tracking-wide ml-2">Suggestions</span>
              <div className="flex flex-col items-start" style={{ gap: '10px' }}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#333333] text-[13px] font-medium rounded-full transition-colors text-left"
                    style={{ padding: '10px 20px' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#F2F2F2] rounded-[16px]" style={{ padding: '16px 20px', marginTop: '8px' }}>
              <p className="text-[11.5px] text-[#888888] leading-[1.6] font-semibold text-left">
                Learn more on how we use your data to give you a personalized experience. Recommendation are information purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CATEGORY CARDS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 flex-1">

          {/* Men Card */}
          <div
            onClick={() => handleGenderSelect('male')}
            className="relative rounded-[20px] lg:rounded-[30px] overflow-hidden group cursor-pointer w-full h-[300px] lg:h-[600px] shadow-lg hover:shadow-2xl transition-shadow duration-500"
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
          </div>

          {/* Women Card */}
          <div
            onClick={() => handleGenderSelect('female')}
            className="relative rounded-[20px] lg:rounded-[30px] overflow-hidden group cursor-pointer w-full h-[300px] lg:h-[600px] shadow-lg hover:shadow-2xl transition-shadow duration-500"
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
          </div>
        </div>
      </div>
    );
  }

  // ─── STATE B: Main Home Feed ────────────────────────────────────
  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '36px' }}>

      {/* Gender Toggle — desktop only (mobile uses shell header) */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Trending Banner */}
      <TrendingBanner />

      {/* Category Sections */}
      {FEED_SECTIONS.map((section) => {
        const sectionVendors = vendorCatalog.filter(
          (v) => v.category === section.filter
        );

        // If no vendors in this category, show all vendors as fallback
        const displayVendors = sectionVendors.length > 0
          ? sectionVendors
          : vendorCatalog.slice(0, 4);

        return (
          <div key={section.key} className="flex flex-col" style={{ gap: '16px' }}>
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {section.label}
              </h3>
              <div style={{ height: '1px', flex: 1, background: '#EBEBEB', marginLeft: '16px' }} />
            </div>

            {/* Vendor Cards Row */}
            <VendorRow
              vendors={displayVendors}
              followedVendors={followedVendors}
              onToggleFollow={toggleFollowVendor}
            />
          </div>
        );
      })}

      {/* Promo Banner */}
      <PromoBanner />

    </div>
  );
}
