'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useVendor, useVendorProducts } from '@/hooks/useVendors';
import { useVendorCollections } from '@/hooks/useCollections';
import { VendorSidebarModal } from '@/components/VendorSidebarModal';
import { VendorPromotionsModal } from '@/components/VendorPromotionsModal';
import {
  getProductImage, getProductName, getProductPrice, getProductOriginalPrice,
  getProductTag, hasDiscount,
} from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import {
  Search, SlidersHorizontal, ChevronDown, Menu, Star, Heart, X, Tag
} from 'lucide-react';

function darkenHex(hex: string, amount: number = 0.65): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export default function VendorPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const { wishlist, toggleWishlist, followedVendors, toggleFollowVendor, addRecentlyViewed } = useApp();

  // ── Fetch live data ─────────────────────────────────────────
  const { vendor, loading: vendorLoading } = useVendor(vendorId);
  const { products: vendorProducts, loading: productsLoading } = useVendorProducts(vendorId);
  const { collections } = useVendorCollections(vendorId);

  // Track recently viewed
  useEffect(() => {
    if (vendor) {
      const logo = vendor.business_logo_url || '/image/icon1.jpg';
      addRecentlyViewed({ id: vendor._id, image: logo, href: `/vendor/${vendor._id}` });
    }
  }, [vendorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Modals
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // ── Loading state ───────────────────────────────────────────
  if (vendorLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10">
        <p className="text-xl font-bold text-gray-800">Vendor Not Found</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-black text-white rounded-xl">Go Home</Link>
      </div>
    );
  }

  // ── Derive fields ───────────────────────────────────────────
  const vendorName = vendor.business_name;
  const isFollowing = followedVendors.includes(vendor._id);
  const themeColor = vendor.theme_color || '#8D7F72';
  const tcClean = themeColor.replace('#', '');
  const tcR = parseInt(tcClean.substring(0, 2), 16);
  const tcG = parseInt(tcClean.substring(2, 4), 16);
  const tcB = parseInt(tcClean.substring(4, 6), 16);
  const brightness = (tcR * 299 + tcG * 587 + tcB * 114) / 1000;
  const isLightTheme = brightness > 180;

  const darkBg = isLightTheme ? darkenHex(themeColor, 0.05) : darkenHex(themeColor, 0.70);
  const midBg = isLightTheme ? darkenHex(themeColor, 0.12) : darkenHex(themeColor, 0.50);

  const sheetBg = isLightTheme ? '#FFFFFF' : darkBg;
  const sheetText = isLightTheme ? '#1a1a1a' : '#ffffff';
  const sheetSubtle = isLightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const sheetBorder = isLightTheme ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const sheetMuted = isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
  const handleColor = isLightTheme ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)';

  const vendorRating = vendor.average_rating ?? 0;
  const vendorReviewCount = vendor.total_ratings ?? 0;
  const vendorLogo = vendor.business_logo_url;
  const logoInitials = vendorName.slice(0, 2).toUpperCase();
  const heroImage = vendor.cover_image_url || (vendorProducts[0] ? getProductImage(vendorProducts[0]) : '/image/bespoke-agbada-orange.webp');

  // Collection names for filter tabs
  const collectionNames = collections.map((c) => c.title || c.name || '').filter(Boolean);
  const filterTabs = ['All', ...collectionNames];

  // Filter products
  const filteredProducts = vendorProducts.filter((p) => {
    const name = getProductName(p);
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.kind?.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen font-sans lg:rounded-[40px] vendor-page-root" style={{ backgroundColor: darkBg, padding: '24px', color: isLightTheme ? '#1a1a1a' : '#ffffff' }}>
      <style>{`
        @media (min-width: 1024px) { .vendor-page-root { padding: 40px !important; } }
        .vendor-page-bottom::after { content: ''; display: block; height: 100px; }
        ${isLightTheme ? `
          .vendor-page-root .text-white { color: #1a1a1a !important; }
          .vendor-page-root .text-white\\/90 { color: rgba(26,26,26,0.9) !important; }
          .vendor-page-root .text-white\\/80 { color: rgba(26,26,26,0.8) !important; }
          .vendor-page-root .text-white\\/70 { color: rgba(26,26,26,0.7) !important; }
          .vendor-page-root .text-white\\/60 { color: rgba(26,26,26,0.6) !important; }
          .vendor-page-root .text-white\\/50 { color: rgba(26,26,26,0.5) !important; }
          .vendor-page-root .text-white\\/40 { color: rgba(26,26,26,0.4) !important; }
          .vendor-page-root .text-white\\/35 { color: rgba(26,26,26,0.35) !important; }
          .vendor-page-root .text-white\\/25 { color: rgba(26,26,26,0.25) !important; }
          .vendor-page-root .border-white\\/15 { border-color: rgba(26,26,26,0.12) !important; }
          .vendor-page-root .border-white\\/10 { border-color: rgba(26,26,26,0.1) !important; }
          .vendor-page-root .border-white\\/8 { border-color: rgba(26,26,26,0.08) !important; }
          .vendor-page-root .placeholder-white\\/40::placeholder { color: rgba(26,26,26,0.4) !important; }
        ` : ''}
      `}</style>

      {/* ══════ EDGE-TO-EDGE HERO ══════ */}
      <div className="relative w-full" style={{ height: '55vh', minHeight: '420px' }}>
        <div className="absolute inset-0">
          <Image src={heroImage} alt={vendorName} fill quality={100} style={{ objectFit: 'cover', objectPosition: 'center 20%' }} sizes="100vw" priority />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${darkBg}cc 60%, ${darkBg} 85%)` }} />
        </div>

        {/* Floating Top Nav */}
        <div className="relative z-20 w-full px-8 md:px-12 py-8 flex items-start justify-between">
          <button onClick={() => setShowSidebar(true)} className="flex items-center gap-3 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/15 shadow-lg" style={{ padding: '6px 20px 6px 6px', backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              {vendorLogo ? (
                <Image src={vendorLogo} alt={vendorName} width={36} height={36} quality={90} className="object-cover" />
              ) : (
                <span className="text-black font-bold text-sm">{logoInitials}</span>
              )}
            </div>
            <Menu size={18} color="#FFF" />
          </button>

          <button onClick={() => toggleFollowVendor(vendor._id)} className="backdrop-blur-md rounded-full font-bold transition-all active:scale-95 border shadow-lg" style={{ backgroundColor: isFollowing ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.5)', color: isFollowing ? '#1A1A1A' : '#FFFFFF', borderColor: isFollowing ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)', padding: '10px 24px', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
          </button>
        </div>

        {/* Center Title or Logo */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none" style={{ paddingBottom: '48px' }}>
          {(vendor.business_logo_svg_url || vendor.business_logo_url) ? (
            <div className="relative w-full max-w-[400px]" style={{ height: 'clamp(60px, 15vw, 120px)', padding: '0 20px' }}>
              <Image 
                src={vendor.business_logo_svg_url || vendor.business_logo_url || ''} 
                alt={vendorName} 
                fill 
                quality={100}
                unoptimized={true}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          ) : (
            <h1 className="text-white text-center leading-none font-sans uppercase" style={{ fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              {vendorName}
            </h1>
          )}
          <div className="text-white/90 text-sm font-semibold flex items-center gap-1.5" style={{ marginTop: '24px' }}>
            <span>{vendorRating.toFixed(1)}</span>
            <Star size={12} className="fill-white text-white" />
            <span>{vendorReviewCount} Reviews</span>
          </div>

          {/* Floating Action Pills */}
          <div className="flex items-center justify-center gap-3 pointer-events-auto flex-wrap px-6" style={{ marginTop: '40px' }}>
            <button onClick={() => setActiveFilter('All')} className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg" style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === 'All' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
              <div className="w-7 h-7 rounded-full overflow-hidden relative flex-shrink-0 bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {vendorProducts[0] ? <Image src={getProductImage(vendorProducts[0])} alt="Shop All" fill className="object-cover" /> : 'All'}
              </div>
              <span className="text-white text-xs font-bold">Shop all</span>
            </button>
            {collectionNames.slice(0, 3).map((col, idx) => {
              const colImage = vendorProducts.find(p => p.kind === col.toLowerCase())
                ? getProductImage(vendorProducts.find(p => p.kind === col.toLowerCase())!)
                : vendorProducts[idx + 1] ? getProductImage(vendorProducts[idx + 1]) : undefined;
              return (
                <button key={idx} onClick={() => setActiveFilter(col)} className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg" style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === col ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
                  <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden relative bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">
                    {colImage ? <Image src={colImage} alt={col} fill className="object-cover" /> : col[0]}
                  </div>
                  <span className="text-white text-xs font-bold whitespace-nowrap">{col}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════ COLLECTION GALLERY ══════ */}
      {collections.length > 0 && (
        <div className="relative z-20 -mt-12 px-8 md:px-12">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x">
            {collections.map((col) => {
              const colImage = col.cover_image || (col.products?.[0] ? getProductImage(col.products[0]) : undefined);
              return (
                <div key={col._id} className="flex-shrink-0 w-[220px] md:w-[260px] snap-center group cursor-pointer" onClick={() => setActiveFilter(col.title || col.name || '')}>
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-2 relative border border-white/8" style={{ backgroundColor: midBg }}>
                    {colImage ? (
                      <Image src={colImage} alt={col.title || col.name || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/20 font-bold text-lg tracking-widest uppercase">{col.title || col.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <h3 className="text-white/80 text-xs font-bold pl-1 tracking-wide uppercase">{col.title || col.name}</h3>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center" style={{ marginTop: '24px' }}>
            <button className="text-white/50 text-[12px] font-bold hover:text-white/80 transition-colors tracking-wider uppercase">
              View all collections
            </button>
          </div>
        </div>
      )}

      {/* ══════ PRODUCT GRID SECTION ══════ */}
      <div className="px-8 md:px-12 mb-8" style={{ marginTop: '48px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ marginBottom: '16px' }}>
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
            <h2 className="text-white text-lg font-bold mr-4 flex-shrink-0">Products</h2>
            <button onClick={() => setShowFilter(true)} className="flex items-center justify-center text-white/70 hover:text-white flex-shrink-0 border border-white/10 transition-colors" style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <SlidersHorizontal size={16} />
            </button>
            {['Sort by', 'On sale', 'Price', 'In-stock'].map((filter, i) => (
              <button key={i} className="flex items-center gap-1.5 text-white/70 rounded-full text-[11px] font-bold hover:text-white flex-shrink-0 border border-white/10 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 18px' }}>
                {filter}
                {(filter === 'Sort by' || filter === 'Price') && <ChevronDown size={12} />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 w-full md:w-56 focus-within:border-white/30 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '16px', paddingLeft: '20px' }}>
            <Search size={14} className="text-white/40" />
            <input
              type="text"
              placeholder={`Search ${vendorName.split(' ')[0]}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white text-xs outline-none w-full placeholder-white/40"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 justify-items-center" style={{ marginTop: '32px' }}>
            {filteredProducts.map((product) => {
              const isFav = wishlist.includes(product._id);
              const prodName = getProductName(product);
              const prodImage = getProductImage(product);
              const prodPrice = getProductPrice(product);
              const prodOrigPrice = hasDiscount(product) ? getProductOriginalPrice(product) : undefined;
              const prodTag = getProductTag(product);

              return (
                <Link href={`/products/${product._id}`} key={product._id} className="flex flex-col group cursor-pointer w-full">
                  <div className="relative w-full rounded-[14px] lg:rounded-[20px] overflow-hidden mb-3" style={{ backgroundColor: midBg, aspectRatio: '214/264' }}>
                    <Image src={prodImage} alt={prodName} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    {prodTag === 'CUSTOMIZABLE' && (
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: '#2D2D2D', fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '6px', lineHeight: 1, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        CUSTOMIZABLE
                      </div>
                    )}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }} className="absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/15" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      <Heart size={14} className={isFav ? "fill-white text-white" : "text-white"} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-white text-[13px] font-bold truncate leading-tight">{prodName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-bold">₦{prodPrice.toLocaleString()}</span>
                      {prodOrigPrice && (
                        <span className="text-white/35 text-xs line-through">₦{prodOrigPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/50 font-medium text-sm">No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* ══════ MODALS ══════ */}
      <VendorSidebarModal
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        vendor={vendor}
        collections={collections}
        onShowReviews={() => { setShowSidebar(false); setTimeout(() => setShowReviews(true), 300); }}
        isLightTheme={isLightTheme}
      />

      <VendorPromotionsModal
        isOpen={showPromo}
        onClose={() => setShowPromo(false)}
        promotions={[]}
      />

      {/* ══════ FILTER BOTTOM SHEET ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowFilter(false)} />
          <div className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showFilter ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`} style={{ maxHeight: '70vh', backgroundColor: sheetBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${sheetBorder}` }}>
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: handleColor }} />
            </div>
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ color: sheetText, fontSize: '18px', fontWeight: 700 }}>Filter & Sort</h3>
              <button onClick={() => setShowFilter(false)} className="w-9 h-9 flex items-center justify-center transition-colors" style={{ borderRadius: '9999px', backgroundColor: sheetSubtle, color: sheetText }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => (
                    <button key={tab} onClick={() => { setActiveFilter(tab); setShowFilter(false); }} style={{ color: sheetText, fontSize: '12px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', backgroundColor: activeFilter === tab ? (isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)') : sheetSubtle, border: activeFilter === tab ? `1px solid ${isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}` : `1px solid ${sheetBorder}`, transition: 'all 0.2s' }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Sort by</p>
                <div className="flex flex-col gap-1">
                  {['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'].map((opt) => (
                    <button key={opt} className="w-full text-left transition-colors" style={{ color: sheetText, fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '12px' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Availability</p>
                <div className="flex flex-wrap gap-2">
                  {['In-stock', 'On sale', 'New arrivals'].map((opt) => (
                    <button key={opt} style={{ color: sheetText, fontSize: '12px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', backgroundColor: sheetSubtle, border: `1px solid ${sheetBorder}`, transition: 'all 0.2s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0" style={{ padding: '0 24px 24px' }}>
              <button onClick={() => setShowFilter(false)} className="w-full text-sm font-bold transition-colors hover:opacity-90" style={{ padding: '14px', borderRadius: '16px', backgroundColor: isLightTheme ? '#1a1a1a' : (vendor.theme_color || '#8D7F72'), color: '#ffffff' }}>
                Apply Filters
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ══════ REVIEWS BOTTOM SHEET ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showReviews ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowReviews(false)} />
          <div className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[420px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showReviews ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`} style={{ maxHeight: '80vh', backgroundColor: sheetBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${sheetBorder}` }}>
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: handleColor }} />
            </div>
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ color: sheetText, fontSize: '18px', fontWeight: 700 }}>Reviews</h3>
              <button onClick={() => setShowReviews(false)} className="w-9 h-9 flex items-center justify-center transition-colors" style={{ borderRadius: '9999px', backgroundColor: sheetSubtle, color: sheetText }}>
                <X size={18} />
              </button>
            </div>
            <div className="shrink-0" style={{ padding: '0 24px 20px', borderBottom: `1px solid ${sheetBorder}` }}>
              <div className="flex items-center gap-6">
                <div>
                  <div style={{ color: sheetText, fontSize: '48px', lineHeight: 1, fontWeight: 700 }}>{vendorRating.toFixed(1)}</div>
                  <p style={{ color: sheetMuted, fontSize: '12px', marginTop: '4px' }}>{vendorReviewCount} ratings</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span style={{ color: sheetMuted, fontSize: '10px', fontWeight: 700, width: '12px' }}>{star}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: sheetSubtle }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: sheetMuted }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '20px 24px' }}>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Kerry', initial: 'K', rating: 5, text: 'Nice and heavy, well made material. I bought a size bigger in the zippy and shorts and they fit so comfortably.', date: 'Today', productIdx: 0 },
                  { name: 'Adaeze', initial: 'A', rating: 5, text: 'Absolutely stunning craftsmanship. The embroidery detail is exquisite and the fabric quality is top tier.', date: '2 days ago', productIdx: 1 },
                  { name: 'Tunde', initial: 'T', rating: 4, text: 'Great quality agbada. Delivery was fast. Would have loved more color options though.', date: '1 week ago', productIdx: 2 },
                ].map((review, idx) => {
                  const reviewProduct = vendorProducts[review.productIdx % vendorProducts.length];
                  return (
                    <div key={idx} style={{ backgroundColor: sheetSubtle, borderRadius: '16px', padding: '16px' }}>
                      {reviewProduct && (
                        <div className="flex items-center gap-3" style={{ marginBottom: '12px', padding: '8px', borderRadius: '12px', backgroundColor: sheetSubtle }}>
                          <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                            <Image src={getProductImage(reviewProduct)} alt={getProductName(reviewProduct)} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ color: sheetText, fontSize: '12px', fontWeight: 700 }} className="truncate">{getProductName(reviewProduct)}</p>
                            <p style={{ color: sheetMuted, fontSize: '10px' }}>₦{getProductPrice(reviewProduct).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center text-[11px] font-bold" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: sheetSubtle, color: sheetText }}>
                            {review.initial}
                          </div>
                          <span style={{ color: sheetText, fontSize: '14px', fontWeight: 700 }}>{review.name}</span>
                        </div>
                        <div className="flex text-[10px] text-amber-400">
                          {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => <span key={i} style={{ color: sheetBorder }}>★</span>)}
                        </div>
                      </div>
                      <p style={{ color: isLightTheme ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px' }}>{review.text}</p>
                      <div className="flex items-center justify-between text-[10px]" style={{ color: sheetMuted }}>
                        <span>{review.date}</span>
                        <button className="transition-colors" style={{ color: sheetMuted }}>Helpful</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}
