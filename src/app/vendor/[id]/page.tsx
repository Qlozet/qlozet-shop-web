'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useVendor, useVendorProducts, useVendorDiscountedProducts } from '@/hooks/useVendors';
import { useVendorCollections, useCollectionProducts } from '@/hooks/useCollections';
import { VendorSidebarModal } from '@/components/VendorSidebarModal';
import { VendorPromotionsModal } from '@/components/VendorPromotionsModal';
import {
  getProductImage, getProductName, getProductPrice, getProductOriginalPrice,
  getProductTag, hasDiscount,
} from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import { ProductThumb } from '@/components/ProductThumb';
import { api } from '@/lib/api';

// Relative date from a Mongo ObjectId's embedded timestamp.
function reviewDate(id?: string): string {
  if (!id || id.length < 8) return '';
  const secs = parseInt(id.substring(0, 8), 16);
  if (!secs) return '';
  const diff = Date.now() - secs * 1000;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(secs * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
import {
  Search, SlidersHorizontal, ChevronDown, Menu, Star, Heart, X, Tag
} from 'lucide-react';

// Solid card colours per discount type — matched to the vendor app's discount
// badge hues (percentage=blue, fixed=green, store_wide=purple, flash=orange,
// category_specific=teal) so a discount reads the same colour everywhere.
const DISCOUNT_TYPE_COLORS: Record<string, string> = {
  percentage: '#1D4ED8',        // blue
  fixed: '#15803D',             // green
  store_wide: '#7E22CE',        // purple
  flash_percentage: '#C2410C',  // orange
  flash_fixed: '#C2410C',       // orange
  category_specific: '#0F766E', // teal
};
const DEFAULT_DISCOUNT_COLOR = '#4B5563'; // slate — unknown/legacy types

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
  // Products this vendor currently has an active discount on — each carries its
  // populated `applied_discount` (title, type, value).
  const { products: discountedProducts } = useVendorDiscountedProducts(vendorId);

  // Build the promotions shown in the deal sheet: one card per distinct active
  // discount, with a human "X% off" / "₦X off" subtitle and the item count.
  const promotions = useMemo(() => {
    const map = new Map<string, { title: string; label: string; type: string; count: number }>();
    for (const p of discountedProducts) {
      const d = (p as unknown as { applied_discount?: any }).applied_discount;
      if (!d || typeof d !== 'object' || !d._id) continue;
      const existing = map.get(String(d._id));
      if (existing) {
        existing.count += 1;
        continue;
      }
      const type = String(d.type ?? '');
      // % when the type is percentage-based, or a store-wide/category discount
      // configured as a percentage.
      const isPercent =
        type.includes('percentage') || d.value_type === 'percentage';
      const value = Number(d.value) || 0;
      const label = isPercent ? `${value}% off` : `₦${value.toLocaleString()} off`;
      map.set(String(d._id), { title: d.title || 'Special offer', label, type, count: 1 });
    }
    return Array.from(map.entries()).map(([id, v]) => ({
      id, // the discount id — used to filter the grid to this offer's items
      title: v.title,
      subtitle: `${v.label} · ${v.count} item${v.count === 1 ? '' : 's'}`,
      // Colour by discount type, so each type is visually distinct + consistent.
      color: DISCOUNT_TYPE_COLORS[v.type] ?? DEFAULT_DISCOUNT_COLOR,
    }));
  }, [discountedProducts]);
  const hasDeals = promotions.length > 0;

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
  // Collection gallery: horizontal scroll by default; "View all" expands it
  // into a wrapped grid showing every collection.
  const [showAllCollections, setShowAllCollections] = useState(false);

  // Vendor reviews (aggregated across the vendor's products) — fetched on open.
  const [vendorReviews, setVendorReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  useEffect(() => {
    if (!showReviews || reviewsLoaded || !vendorId) return;
    (async () => {
      try {
        const res = await api.get('/products/ratings/vendor', {
          params: { business_id: vendorId, size: 50 },
        });
        const data = res.data?.data ?? res.data;
        setReviewSummary(data?.summary ?? null);
        setVendorReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      } catch {
        setVendorReviews([]);
      } finally {
        setReviewsLoaded(true);
      }
    })();
  }, [showReviews, reviewsLoaded, vendorId]);

  // Filters. `activeFilter` is 'All', a collection id, or a deal sentinel
  // '__deal__:<discountId>' (or '__deal__:all') when filtering by an offer.
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  // Filter & sort (applies to the product grid, on top of category/deal + search)
  const [sortOption, setSortOption] = useState<'featured' | 'newest' | 'top_rated' | 'price_asc' | 'price_desc'>('featured');
  const [priceBucket, setPriceBucket] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const isDealFilter = activeFilter.startsWith('__deal__');

  // Fetch collection specific products (skip while in All / deal mode)
  const collectionIdFilter =
    activeFilter === 'All' || isDealFilter ? undefined : activeFilter;
  const { products: collectionProducts, loading: colProductsLoading } = useCollectionProducts(collectionIdFilter);

  // Clicking a promotion filters the grid to that offer's discounted items and
  // closes the sheet.
  const handleSelectPromotion = (discountId?: string) => {
    setActiveFilter(`__deal__:${discountId ?? 'all'}`);
    setShowPromo(false);
  };
  const clearDealFilter = () => setActiveFilter('All');

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

  // Collection lookup for filter tabs
  const collectionMap = new Map(collections.map((c) => [c._id, c.title || c.name || '']));
  const collectionNames = collections.map((c) => c.title || c.name || '').filter(Boolean);
  const filterTabs = [
    { id: 'All', name: 'All' },
    ...collections.map((c) => ({ id: c._id, name: c.title || c.name || '' })).filter((c) => c.name)
  ];

  // Products shown in the grid: a specific offer's items (deal mode), a
  // collection, or all of the vendor's products.
  const dealFilterId = isDealFilter ? activeFilter.slice('__deal__:'.length) : null;
  const activeDeal = dealFilterId && dealFilterId !== 'all'
    ? promotions.find((p) => p.id === dealFilterId)
    : null;
  const activeProductsList = isDealFilter
    ? (dealFilterId === 'all'
        ? discountedProducts
        : discountedProducts.filter((p) => {
            const d = (p as unknown as { applied_discount?: any }).applied_discount;
            const id = d && typeof d === 'object' ? String(d._id) : String(d);
            return id === dealFilterId;
          }))
    : activeFilter === 'All'
      ? vendorProducts
      : collectionProducts;

  const PRICE_BUCKETS: Record<string, [number, number]> = {
    'Under ₦50K': [0, 50000],
    '₦50K - ₦100K': [50000, 100000],
    '₦100K - ₦200K': [100000, 200000],
    'Over ₦200K': [200000, Infinity],
  };
  const filteredProducts = (() => {
    let list = activeProductsList.filter((p) =>
      getProductName(p).toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (inStockOnly) list = list.filter((p) => p.availability?.state !== 'out_of_stock');
    if (priceBucket && PRICE_BUCKETS[priceBucket]) {
      const [lo, hi] = PRICE_BUCKETS[priceBucket];
      list = list.filter((p) => { const pr = getProductPrice(p); return pr >= lo && pr < hi; });
    }
    const ts = (p: any) => new Date(p?.createdAt ?? 0).getTime();
    if (sortOption === 'newest') list = [...list].sort((a, b) => ts(b) - ts(a));
    else if (sortOption === 'top_rated') list = [...list].sort((a, b) => ((b as any).average_rating ?? 0) - ((a as any).average_rating ?? 0));
    else if (sortOption === 'price_asc') list = [...list].sort((a, b) => getProductPrice(a) - getProductPrice(b));
    else if (sortOption === 'price_desc') list = [...list].sort((a, b) => getProductPrice(b) - getProductPrice(a));
    return list;
  })();

  return (
    <div className="min-h-screen font-sans lg:rounded-[40px] vendor-page-root" style={{ backgroundColor: darkBg, color: isLightTheme ? '#1a1a1a' : '#ffffff' }}>
      <style>{`
        /* Padding lives here (not inline) so the mobile bottom clearance for the
           fixed bottom nav sits INSIDE the themed darkBg area — otherwise the
           shell's padding shows the brown backdrop below the content. */
        .vendor-page-root { padding: 24px 24px 104px; }
        @media (min-width: 1024px) { .vendor-page-root { padding: 40px !important; } }
        /* On desktop the sheet is anchored top-12 -> bottom-12, so drop the mobile
           maxHeight cap and let it fill that span (its flex-1 body then scrolls). */
        @media (min-width: 1024px) { .vendor-sheet { max-height: none !important; } }
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
      <div className="w-full">
        <div className="relative w-full overflow-hidden rounded-[24px] lg:rounded-[30px]" style={{ height: '55vh', minHeight: '420px' }}>
          <div className="absolute inset-0">
          <Image src={heroImage} alt={vendorName} fill quality={90} style={{ objectFit: 'cover', objectPosition: 'center 20%' }} sizes="100vw" priority />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${darkBg}cc 60%, ${darkBg} 85%)` }} />
        </div>

        {/* Floating Top Nav */}
        <div className="relative z-20 w-full flex items-start justify-between" style={{ padding: '16px' }}>
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
            {/* Fill is theme-aware: fill-white isn't caught by the light-theme
                override, so on a light vendor theme it would stay white and vanish. */}
            <Star size={12} color={isLightTheme ? '#1A1A1A' : '#FFFFFF'} fill={isLightTheme ? '#1A1A1A' : '#FFFFFF'} />
            <span>{vendorReviewCount} Reviews</span>
          </div>

          {/* Floating Action Pills */}
          <div className="flex items-center justify-center gap-3 pointer-events-auto flex-wrap px-6" style={{ marginTop: '40px' }}>
            {/* Deals pill — only when this vendor has active discounts */}
            {hasDeals && (
              <button
                onClick={() => setShowPromo(true)}
                className="flex items-center gap-2 backdrop-blur-md rounded-full transition-colors border shadow-lg hover:opacity-90"
                style={{ padding: '9px 16px', backgroundColor: 'rgba(220,38,38,0.92)', borderColor: 'rgba(255,255,255,0.25)' }}
              >
                <Tag size={13} color="#FFF" />
                {/* Inline white (not .text-white) so the light-theme override
                    can't flip it dark — it sits on the red deals pill. */}
                <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>
                  {promotions.length} {promotions.length === 1 ? 'Deal' : 'Deals'}
                </span>
              </button>
            )}
            <button onClick={() => setActiveFilter('All')} className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg" style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === 'All' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
              <div className="w-7 h-7 rounded-full overflow-hidden relative flex-shrink-0 bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {vendorProducts[0] ? <Image src={getProductImage(vendorProducts[0])} alt="Shop All" fill className="object-cover" /> : 'All'}
              </div>
              <span className="text-white text-xs font-bold">Shop all</span>
            </button>
            {collections.slice(0, 3).map((col) => {
              const colName = col.title || col.name || '';
              const colImage = col.cover_image || (col.products?.[0] ? getProductImage(col.products[0]) : undefined)
                || (vendorProducts.find(p => (p.collections ?? []).includes(col._id)) ? getProductImage(vendorProducts.find(p => (p.collections ?? []).includes(col._id))!) : undefined);
              return (
                <button key={col._id} onClick={() => setActiveFilter(col._id)} className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg" style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === col._id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}>
                  <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden relative bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">
                    {colImage ? <Image src={colImage} alt={colName} fill className="object-cover" /> : colName[0]}
                  </div>
                  <span className="text-white text-xs font-bold whitespace-nowrap">{colName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* ══════ COLLECTION GALLERY ══════ */}
      {collections.length > 0 && (
        <div className="relative z-20 mt-12 px-5 md:px-12">
          <div className={showAllCollections ? 'flex flex-wrap gap-4 pb-6' : 'flex items-center gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x'}>
            {collections.map((col) => {
              const colImage = col.cover_image || (col.products?.[0] ? getProductImage(col.products[0]) : undefined);
              return (
                <div key={col._id} className="flex-shrink-0 w-[220px] md:w-[260px] snap-center group cursor-pointer" onClick={() => setActiveFilter(col._id)}>
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative border border-white/8" style={{ backgroundColor: midBg, marginBottom: '14px' }}>
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
          {collections.length > 3 && (
            <div className="flex justify-center" style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowAllCollections((v) => !v)}
                className="text-white/50 text-[12px] font-bold hover:text-white/80 transition-colors tracking-wider uppercase"
              >
                {showAllCollections ? 'Show less' : 'View all collections'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════ PRODUCT GRID ══════ */}
      <div className="relative z-10 w-full px-5 md:px-12 pb-24" style={{ marginTop: collections.length > 0 ? '40px' : '48px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ marginBottom: '16px' }}>
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
            <h2 className="text-white text-lg font-bold mr-4 flex-shrink-0">Products</h2>
            <button onClick={() => setShowFilter(true)} className="flex items-center justify-center text-white/70 hover:text-white flex-shrink-0 border border-white/10 transition-colors" style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <SlidersHorizontal size={16} />
            </button>
            {[
              { label: 'Sort by', onClick: () => setShowFilter(true), active: sortOption !== 'featured', chevron: true },
              { label: 'On sale', onClick: () => setActiveFilter(dealFilterId === 'all' ? 'All' : '__deal__:all'), active: dealFilterId === 'all', chevron: false },
              { label: 'Price', onClick: () => setShowFilter(true), active: !!priceBucket, chevron: true },
              { label: 'In-stock', onClick: () => setInStockOnly((v) => !v), active: inStockOnly, chevron: false },
            ].map((ctrl) => (
              <button
                key={ctrl.label}
                onClick={ctrl.onClick}
                className="flex items-center gap-1.5 text-white/70 rounded-full text-[11px] font-bold hover:text-white flex-shrink-0 border border-white/10 transition-colors"
                style={{ backgroundColor: ctrl.active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.06)', color: ctrl.active ? '#FFF' : undefined, padding: '10px 18px' }}
              >
                {ctrl.label}
                {ctrl.chevron && <ChevronDown size={12} />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 w-full md:w-56 focus-within:border-white/30 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px 20px' }}>
            <Search size={14} className="text-white/40" />
            <input
              type="text"
              placeholder={`Search ${vendorName.split(' ')[0]}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white text-xs outline-none w-full placeholder-white/40"
              // Inline beats the global input / input:focus stylesheet rule,
              // which would otherwise re-add a background + border on focus.
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}
            />
          </div>
        </div>

        {/* Deal filter banner — shows which offer the grid is filtered to */}
        {isDealFilter && (
          <div className="flex items-center justify-between gap-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 18px', marginBottom: '16px' }}>
            <div className="flex items-center gap-2 min-w-0">
              <Tag size={14} className="text-white flex-shrink-0" />
              <span className="text-white text-xs font-bold truncate">
                {activeDeal ? `${activeDeal.title} · ${activeDeal.subtitle}` : 'On sale items'}
              </span>
            </div>
            <button onClick={clearDealFilter} className="flex items-center gap-1 text-white/80 hover:text-white text-[11px] font-bold flex-shrink-0">
              Clear <X size={12} />
            </button>
          </div>
        )}

        {/* Product Grid */}
        {colProductsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 justify-items-center" style={{ marginTop: '32px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col w-full animate-pulse">
                <div className="w-full rounded-[14px] lg:rounded-[20px]" style={{ backgroundColor: midBg, aspectRatio: '214/264', marginBottom: '14px' }} />
                <div className="h-4 rounded-md w-3/4 mb-2" style={{ backgroundColor: midBg }} />
                <div className="h-4 rounded-md w-1/2" style={{ backgroundColor: midBg }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
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
                  <ProductThumb
                    imageUrl={prodImage}
                    alt={prodName}
                    aspectRatio="214/264"
                    bg={midBg}
                    containerClassName="rounded-[14px] lg:rounded-[20px]"
                    imageClassName="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    stockState={product.availability?.state}
                    customizable={prodTag === 'CUSTOMIZABLE'}
                  >
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }} className="absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.15)', zIndex: 3 }}>
                      {/* Inline white (not .text-white/.border-white) so the light-theme
                          override can't flip the heart/outline dark — it sits on the product image. */}
                      <Heart size={14} color="#FFFFFF" fill={isFav ? '#FFFFFF' : 'none'} />
                    </button>
                  </ProductThumb>

                  {/* Inline marginTop (not a Tailwind mb-[…] class): Tailwind's
                      scanner skips this [id] dynamic-route folder, so a class
                      unique to this file wouldn't generate. Inline always works. */}
                  <div className="flex flex-col gap-1 px-1" style={{ marginTop: '10px' }}>
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
        onSelectPromotion={handleSelectPromotion}
        promotions={promotions}
        theme={{ bg: sheetBg, text: sheetText, subtle: sheetSubtle, border: sheetBorder, muted: sheetMuted }}
      />

      {/* ══════ FILTER BOTTOM SHEET ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowFilter(false)} />
          <div className={`vendor-sheet fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showFilter ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`} style={{ maxHeight: '70vh', overflow: 'hidden', backgroundColor: sheetBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${sheetBorder}` }}>
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: handleColor }} />
            </div>
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ color: sheetText, fontSize: '18px', fontWeight: 700 }}>Filter & Sort</h3>
              <button onClick={() => setShowFilter(false)} className="w-9 h-9 flex items-center justify-center transition-colors" style={{ borderRadius: '9999px', backgroundColor: sheetSubtle, color: sheetText }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px', minHeight: 0, overscrollBehavior: 'contain' }}>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => (
                    <button key={tab.id} onClick={() => { setActiveFilter(tab.id); setShowFilter(false); }} style={{ color: sheetText, fontSize: '12px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', backgroundColor: activeFilter === tab.id ? (isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)') : sheetSubtle, border: activeFilter === tab.id ? `1px solid ${isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}` : `1px solid ${sheetBorder}`, transition: 'all 0.2s' }}>
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Sort by</p>
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'featured', label: 'Featured' },
                    { id: 'newest', label: 'Newest' },
                    { id: 'top_rated', label: 'Top Rated' },
                    { id: 'price_asc', label: 'Price: Low to High' },
                    { id: 'price_desc', label: 'Price: High to Low' },
                  ].map((opt) => {
                    const active = sortOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSortOption(opt.id as typeof sortOption)}
                        className="w-full text-left transition-colors"
                        style={{ color: sheetText, fontSize: '14px', fontWeight: active ? 800 : 500, padding: '12px 16px', borderRadius: '12px', backgroundColor: active ? (isLightTheme ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.18)') : 'transparent' }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRICE_BUCKETS).map((range) => {
                    const active = priceBucket === range;
                    return (
                      <button
                        key={range}
                        onClick={() => setPriceBucket(active ? null : range)}
                        style={{ color: sheetText, fontSize: '12px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', backgroundColor: active ? (isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)') : sheetSubtle, border: active ? `1px solid ${isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}` : `1px solid ${sheetBorder}`, transition: 'all 0.2s' }}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p style={{ color: sheetMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Availability</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'In-stock', active: inStockOnly, toggle: () => setInStockOnly((v) => !v) },
                    { label: 'On sale', active: dealFilterId === 'all', toggle: () => setActiveFilter(dealFilterId === 'all' ? 'All' : '__deal__:all') },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={opt.toggle}
                      style={{ color: sheetText, fontSize: '12px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', backgroundColor: opt.active ? (isLightTheme ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)') : sheetSubtle, border: opt.active ? `1px solid ${isLightTheme ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}` : `1px solid ${sheetBorder}`, transition: 'all 0.2s' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '0 24px 24px' }}>
              <button
                onClick={() => { setSortOption('featured'); setPriceBucket(null); setInStockOnly(false); setActiveFilter('All'); }}
                className="text-sm font-bold transition-colors"
                style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: sheetSubtle, color: sheetText, border: `1px solid ${sheetBorder}` }}
              >
                Reset
              </button>
              <button onClick={() => setShowFilter(false)} className="text-sm font-bold transition-colors hover:opacity-90" style={{ flex: 1, padding: '14px', borderRadius: '16px', backgroundColor: isLightTheme ? '#1a1a1a' : (vendor.theme_color || '#8D7F72'), color: '#ffffff', border: 'none' }}>
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
          <div className={`vendor-sheet fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[420px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showReviews ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`} style={{ maxHeight: '80vh', overflow: 'hidden', backgroundColor: sheetBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: `1px solid ${sheetBorder}` }}>
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
                    const starCount =
                      reviewSummary?.[
                        star === 5 ? 'five_star' : star === 4 ? 'four_star' : star === 3 ? 'three_star' : star === 2 ? 'two_star' : 'one_star'
                      ] ?? 0;
                    const totalR = reviewSummary?.total_reviews ?? 0;
                    const pct = totalR > 0 ? Math.round((starCount / totalR) * 100) : 0;
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
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '20px 24px', minHeight: 0, overscrollBehavior: 'contain' }}>
              {!reviewsLoaded ? (
                <p style={{ color: sheetMuted, fontSize: '13px' }}>Loading reviews…</p>
              ) : vendorReviews.length === 0 ? (
                <p style={{ color: sheetMuted, fontSize: '13px' }}>This vendor has no reviews yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {vendorReviews.map((review, idx) => {
                    const name = review.reviewer?.name || review.reviewer?.email?.split('@')[0] || 'Verified buyer';
                    const rating = review.rating || 0;
                    const reviewProduct = vendorProducts.find(
                      (p) => String(p._id) === String(review.product_id),
                    );
                    return (
                      <div key={idx} style={{ backgroundColor: sheetSubtle, borderRadius: '16px', padding: '16px' }}>
                        {(reviewProduct || review.product_name) && (
                          <div className="flex items-center gap-3" style={{ marginBottom: '12px', padding: '8px', borderRadius: '12px', backgroundColor: sheetSubtle }}>
                            {reviewProduct && (
                              <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                                <Image src={getProductImage(reviewProduct)} alt={getProductName(reviewProduct)} fill className="object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p style={{ color: sheetText, fontSize: '12px', fontWeight: 700 }} className="truncate">{reviewProduct ? getProductName(reviewProduct) : review.product_name}</p>
                              {reviewProduct && <p style={{ color: sheetMuted, fontSize: '10px' }}>₦{getProductPrice(reviewProduct).toLocaleString()}</p>}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center text-[11px] font-bold" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: sheetSubtle, color: sheetText }}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: sheetText, fontSize: '14px', fontWeight: 700 }}>{name}</span>
                          </div>
                          <div className="flex text-[10px] text-amber-400">
                            {Array.from({ length: rating }).map((_, i) => <span key={i}>★</span>)}
                            {Array.from({ length: 5 - rating }).map((_, i) => <span key={i} style={{ color: sheetBorder }}>★</span>)}
                          </div>
                        </div>
                        {review.comment && (
                          <p style={{ color: isLightTheme ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px' }}>{review.comment}</p>
                        )}
                        <div className="flex items-center justify-between text-[10px]" style={{ color: sheetMuted }}>
                          <span>{reviewDate(typeof review.created_at === 'string' ? review.created_at : undefined)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
}
