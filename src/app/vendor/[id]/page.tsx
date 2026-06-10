'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { vendorCatalog } from '@/data/vendors';
import { productCatalog } from '@/data/products';
import { VendorSidebarModal } from '@/components/VendorSidebarModal';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  Star,
  Heart,
  X
} from 'lucide-react';

/**
 * Attempt to darken a hex color by mixing it toward black.
 * Returns a rich, muted version of the vendor's themeColor
 * that works as a luxury dark background.
 */
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
  const { wishlist, toggleWishlist, followedVendors, toggleFollowVendor } = useApp();

  const vendor = vendorCatalog.find((v) => v.id === vendorId);

  // Modals
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10">
        <p className="text-xl font-bold text-gray-800">Vendor Not Found</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-black text-white rounded-xl">Go Home</Link>
      </div>
    );
  }

  const isFollowing = followedVendors.includes(vendor.id);
  const themeColor = vendor.themeColor || '#8D7F72';
  const darkBg = darkenHex(themeColor, 0.70);    // deep, rich version for page background
  const midBg = darkenHex(themeColor, 0.50);      // slightly lighter for cards/accents

  const vendorProducts = productCatalog.filter((p) =>
    vendor.productIds.includes(p.id) || p.brand?.toLowerCase() === vendor.name.toLowerCase()
  );

  const filterTabs = ['All', ...vendor.collections];
  const filteredProducts = vendorProducts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.kind.toLowerCase().includes(activeFilter.toLowerCase()) || p.tag?.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen font-sans pb-32 lg:rounded-[40px]" style={{ backgroundColor: darkBg, padding: '24px' }}>

      {/* ══════ EDGE-TO-EDGE HERO ══════ */}
      <div className="relative w-full" style={{ height: '55vh', minHeight: '420px' }}>

        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={vendor.heroImage}
            alt={vendor.name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            sizes="100vw"
            priority
          />
          {/* Gradient: transparent top → dark background bottom */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 20%, ${darkBg}cc 60%, ${darkBg} 85%)` }}
          />
        </div>

        {/* Floating Top Nav */}
        <div className="relative z-20 w-full px-8 md:px-12 py-8 flex items-start justify-between">
          {/* Left Menu Pill */}
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-3 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/15 shadow-lg"
            style={{ padding: '6px 20px 6px 6px', backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              {vendor.logoStyle === 'image' && vendor.logoImage ? (
                <Image src={vendor.logoImage} alt={vendor.name} width={36} height={36} className="object-cover" />
              ) : (
                <span className="text-black font-bold text-sm">{vendor.logoInitials}</span>
              )}
            </div>
            <Menu size={18} color="#FFF" />
          </button>

          {/* Right Follow Button */}
          <button
            onClick={() => toggleFollowVendor(vendor.id)}
            className="backdrop-blur-md text-white rounded-full text-sm font-bold hover:bg-white/20 transition-all border border-white/15 shadow-lg"
            style={{ backgroundColor: isFollowing ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', padding: '10px 24px' }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Center Title & Floating Pills */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pointer-events-none" style={{ paddingBottom: '48px' }}>
          <h1
            className="text-white text-center leading-none font-sans uppercase"
            style={{ fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 900, letterSpacing: '-0.02em' }}
          >
            {vendor.name}
          </h1>

          <div className="text-white/90 text-sm font-semibold flex items-center gap-1.5" style={{ marginTop: '24px' }}>
            <span>{vendor.rating}</span>
            <Star size={12} className="fill-white text-white" />
            <span>{vendor.reviewCount} Reviews</span>
          </div>

          {/* Floating Action Pills */}
          <div className="flex items-center justify-center gap-3 pointer-events-auto flex-wrap px-6" style={{ marginTop: '40px' }}>
            <button
              onClick={() => setActiveFilter('All')}
              className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg"
              style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === 'All' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}
            >
              <div className="w-7 h-7 rounded-full overflow-hidden relative flex-shrink-0 bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {vendorProducts[0]?.image ? <Image src={vendorProducts[0].image} alt="Shop All" fill className="object-cover" /> : 'All'}
              </div>
              <span className="text-white text-xs font-bold">Shop all</span>
            </button>
            {vendor.collections.slice(0, 3).map((col, idx) => {
              const colImage = vendorProducts.find(p => p.kind === col || p.tag === col)?.image || vendorProducts[idx + 1]?.image;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveFilter(col)}
                  className="flex items-center gap-2 backdrop-blur-md rounded-full hover:bg-white/25 transition-colors border border-white/15 shadow-lg"
                  style={{ padding: '5px 16px 5px 5px', backgroundColor: activeFilter === col ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)' }}
                >
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
      <div className="relative z-20 -mt-12 px-8 md:px-12">
        <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-6 snap-x">
          {vendor.collections.map((col, idx) => {
            const colImage = vendorProducts.find(p => p.kind === col || p.tag === col)?.image || vendorProducts[idx % vendorProducts.length]?.image;
            return (
              <div key={idx} className="flex-shrink-0 w-[220px] md:w-[260px] snap-center group cursor-pointer" onClick={() => setActiveFilter(col)}>
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-2 relative border border-white/8" style={{ backgroundColor: midBg }}>
                  {colImage ? (
                    <Image
                      src={colImage}
                      alt={col}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white/20 font-bold text-lg tracking-widest uppercase">{col}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                </div>
                <h3 className="text-white/80 text-xs font-bold pl-1 tracking-wide uppercase">{col}</h3>
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

      {/* ══════ PRODUCT GRID SECTION ══════ */}
      <div className="px-8 md:px-12 mb-8" style={{ marginTop: '48px' }}>

        {/* Filter Bar */}
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

          {/* Mini Search Bar */}
          <div className="flex items-center gap-2 rounded-full px-4 py-2 border border-white/10 w-full md:w-56 focus-within:border-white/30 transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.06)', marginTop: '16px', paddingLeft: '20px' }}>
            <Search size={14} className="text-white/40" />
            <input
              type="text"
              placeholder={`Search ${vendor.name.split(' ')[0]}...`}
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
              const isFav = wishlist.includes(product.id);
              return (
                <Link href={`/products/${product.id}`} key={product.id} className="flex flex-col group cursor-pointer w-full">
                  <div className="relative w-full rounded-[14px] lg:rounded-[20px] overflow-hidden mb-3" style={{ backgroundColor: midBg, aspectRatio: '214/264' }}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/15"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <Heart size={14} className={isFav ? "fill-white text-white" : "text-white"} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-white text-[13px] font-bold truncate leading-tight">{product.title}</h3>
                    <div className="flex items-center gap-1">
                      <div className="flex text-[9px] text-amber-400">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-white/25">★</span>
                      </div>
                      <span className="text-white/40 text-[10px]">({Math.floor(Math.random() * 500) + 10})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-bold">₦{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-white/35 text-xs line-through">₦{product.originalPrice.toLocaleString()}</span>
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
        onShowReviews={() => { setShowSidebar(false); setTimeout(() => setShowReviews(true), 300); }}
      />

      {/* ══════ FILTER BOTTOM SHEET ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowFilter(false)}
          />

          {/* Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showFilter ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`}
            style={{ maxHeight: '70vh', backgroundColor: darkBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Drag Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.3)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 className="text-white text-lg font-bold">Filter & Sort</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                style={{ borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
              {/* Category Filters */}
              <div style={{ marginBottom: '28px' }}>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider" style={{ marginBottom: '12px' }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveFilter(tab); setShowFilter(false); }}
                      className="text-white text-xs font-bold transition-colors"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: activeFilter === tab ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)',
                        border: activeFilter === tab ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div style={{ marginBottom: '28px' }}>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider" style={{ marginBottom: '12px' }}>Sort by</p>
                <div className="flex flex-col gap-1">
                  {['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'].map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left text-white text-sm font-medium hover:bg-white/8 transition-colors"
                      style={{ padding: '12px 16px', borderRadius: '12px' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider" style={{ marginBottom: '12px' }}>Availability</p>
                <div className="flex flex-wrap gap-2">
                  {['In-stock', 'On sale', 'New arrivals'].map((opt) => (
                    <button
                      key={opt}
                      className="text-white text-xs font-bold transition-colors"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="shrink-0" style={{ padding: '0 24px 24px' }}>
              <button
                onClick={() => setShowFilter(false)}
                className="w-full text-white text-sm font-bold transition-colors hover:opacity-90"
                style={{ padding: '14px', borderRadius: '16px', backgroundColor: vendor.themeColor || '#8D7F72' }}
              >
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
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showReviews ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowReviews(false)}
          />
          <div
            className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[420px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showReviews ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`}
            style={{ maxHeight: '80vh', backgroundColor: darkBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Drag Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.3)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 className="text-white text-lg font-bold">Reviews</h3>
              <button
                onClick={() => setShowReviews(false)}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                style={{ borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Rating Summary */}
            <div className="shrink-0" style={{ padding: '0 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-white font-bold" style={{ fontSize: '48px', lineHeight: 1 }}>{vendor.rating}</div>
                  <p className="text-white/50 text-xs" style={{ marginTop: '4px' }}>{vendor.reviewCount} ratings</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-white/50 text-[10px] font-bold w-3">{star}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'rgba(255,255,255,0.5)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '20px 24px' }}>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Kerry', initial: 'K', rating: 5, text: 'Nice and heavy, well made material. I bought a size bigger in the zippy and shorts and they fit so comfortably.', date: 'Today', productIdx: 0 },
                  { name: 'Adaeze', initial: 'A', rating: 5, text: 'Absolutely stunning craftsmanship. The embroidery detail is exquisite and the fabric quality is top tier.', date: '2 days ago', productIdx: 1 },
                  { name: 'Tunde', initial: 'T', rating: 4, text: 'Great quality agbada. Delivery was fast. Would have loved more color options though.', date: '1 week ago', productIdx: 2 },
                  { name: 'Nneka', initial: 'N', rating: 5, text: 'Perfect for my wedding! Everyone complimented the outfit. Will definitely order again.', date: '2 weeks ago', productIdx: 0 },
                  { name: 'Chidi', initial: 'C', rating: 4, text: 'Good value for money. The fit was slightly off but customer service was very responsive.', date: '3 weeks ago', productIdx: 3 },
                ].map((review, idx) => {
                  const reviewProduct = vendorProducts[review.productIdx % vendorProducts.length];
                  return (
                  <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
                    {/* Product being reviewed */}
                    {reviewProduct && (
                      <div className="flex items-center gap-3" style={{ marginBottom: '12px', padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                          <Image src={reviewProduct.image} alt={reviewProduct.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold truncate">{reviewProduct.title}</p>
                          <p className="text-white/40 text-[10px]">₦{reviewProduct.price.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center text-white text-[11px] font-bold" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.12)' }}>
                          {review.initial}
                        </div>
                        <span className="text-white text-sm font-bold">{review.name}</span>
                      </div>
                      <div className="flex text-[10px] text-amber-400">
                        {Array.from({ length: review.rating }).map((_, i) => <span key={i}>★</span>)}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => <span key={i} className="text-white/20">★</span>)}
                      </div>
                    </div>
                    <p className="text-white/80 text-xs leading-relaxed" style={{ marginBottom: '10px' }}>{review.text}</p>
                    <div className="flex items-center justify-between text-white/40 text-[10px]">
                      <span>{review.date}</span>
                      <button className="hover:text-white transition-colors">Helpful</button>
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
