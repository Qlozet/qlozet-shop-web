'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { GenderToggle } from '@/components/GenderToggle';
import {
  resolveSlug,
  buildBreadcrumbs,
  HERO_BANNERS,
} from '@/data/taxonomy';
import { useProducts } from '@/hooks/useProducts';
import { useTrendingProducts, useNewArrivals } from '@/hooks/useRecommendations';
import type { ApiProduct, ApiFeedItem } from '@/lib/api-types';
import { getProductTag, getProductImage, getProductName, getProductPrice, getProductOriginalPrice, hasDiscount } from '@/lib/api-types';
import { DiscoverBreadcrumb } from '@/components/discover/DiscoverBreadcrumb';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { ProductCard } from '@/components/ProductCard';

import { ProductCarousel } from '@/components/discover/ProductCarousel';

export default function DiscoverSlugPage() {
  const params = useParams();
  const { gender, setGender, wishlist, toggleWishlist } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // ── Filter & sort state (applies to the product-type grid) ──
  const [sortOption, setSortOption] = useState<'trending' | 'top_rated' | 'newest' | 'price_asc' | 'price_desc'>('trending');
  const [priceBucket, setPriceBucket] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [availInStock, setAvailInStock] = useState(false);
  const [availOnSale, setAvailOnSale] = useState(false);

  // Parse slug
  const rawSlug = params?.slug;
  const slugParts: string[] = Array.isArray(rawSlug)
    ? rawSlug
    : rawSlug
      ? [rawSlug]
      : [];

  // Resolve taxonomy
  const { current } = resolveSlug(slugParts);
  const breadcrumbs = buildBreadcrumbs(slugParts);

  // Fetch products from API using the current node's filter
  const searchHint = current?.productFilter?.subcategory || current?.productFilter?.collection || '';
  const kindFilter = current?.productFilter?.kind?.[0] as 'clothing' | 'fabric' | 'accessory' | undefined;
  const audienceValue = gender === 'male' ? 'men' : 'women';
  const { products: apiProducts, loading: productsLoading } = useProducts({
    search: searchHint,
    kind: kindFilter,
    audience: audienceValue,
    size: 50,
  });

  // ── Step 1: Apply tag-based filtering (include/exclude) ────────
  let filteredProducts = [...apiProducts];

  const includeTags = current?.productFilter?.tags;
  if (includeTags && includeTags.length > 0) {
    filteredProducts = filteredProducts.filter((p) => {
      const tag = getProductTag(p);
      return includeTags.includes(tag);
    });
  }

  const excludeTags = current?.productFilter?.excludeTags;
  if (excludeTags && excludeTags.length > 0) {
    filteredProducts = filteredProducts.filter((p) => {
      const tag = getProductTag(p);
      return !excludeTags.includes(tag);
    });
  }

  // ── Step 2: Extract dynamic product types from filtered products ─
  // Helper to get product_type from any product kind
  const getProductType = (p: ApiProduct): string => {
    return (
      p.clothing?.taxonomy?.product_type ||
      p.accessory?.taxonomy?.product_type ||
      p.fabric?.taxonomy?.product_type ||
      ''
    );
  };

  // Helper to get categories from any product kind
  const getCategories = (p: ApiProduct): string[] => {
    return (
      p.clothing?.taxonomy?.categories ||
      p.accessory?.taxonomy?.categories ||
      p.fabric?.taxonomy?.categories ||
      []
    );
  };

  // Unique product types derived from actual products
  const dynamicProductTypes = Array.from(
    new Set(filteredProducts.map(getProductType).filter(Boolean))
  ).sort();

  // First product image per type — shown as a small thumbnail on each type tab.
  const typeImage: Record<string, string> = {};
  for (const p of filteredProducts) {
    const t = getProductType(p);
    if (t && !typeImage[t]) {
      const img = getProductImage(p);
      if (img) typeImage[t] = img;
    }
  }

  // ── Step 3: Apply product type filter ──────────────────────────
  let products = [...filteredProducts];

  if (selectedProductType) {
    products = products.filter((p) =>
      getProductType(p).toLowerCase() === selectedProductType.toLowerCase()
    );
  }

  // ── Step 4: Extract dynamic categories from type-filtered products ─
  const dynamicCategories = selectedProductType
    ? Array.from(
        new Set(products.flatMap(getCategories).filter(Boolean))
      ).sort()
    : [];

  // ── Step 5: Apply category filter ──────────────────────────────
  if (selectedCategory) {
    products = products.filter((p) =>
      getCategories(p).some(c => c.toLowerCase() === selectedCategory.toLowerCase())
    );
  }

  // ── Recommendation feeds (rank the Trending / What's New sorts) ──
  const { items: trendingItems } = useTrendingProducts(20);
  const { items: newArrivalItems } = useNewArrivals(20);
  const feedIds = (items: ApiFeedItem[]): string[] =>
    items.map((i) => i.product?._id).filter((id): id is string => !!id);
  const trendingRank = feedIds(trendingItems);
  const newRank = feedIds(newArrivalItems);

  // ── Filter + sort for the product-type grid (over the fetched set) ──
  const businessName = (p: ApiProduct) =>
    typeof p.business === 'object' ? p.business?.business_name ?? '' : '';
  const brands = Array.from(new Set(products.map(businessName).filter(Boolean))).sort();
  const PRICE_BUCKETS: Record<string, [number, number]> = {
    'Under ₦50K': [0, 50000],
    '₦50K - ₦100K': [50000, 100000],
    '₦100K - ₦200K': [100000, 200000],
    'Over ₦200K': [200000, Infinity],
  };
  const SORT_OPTIONS: { id: typeof sortOption; label: string }[] = [
    { id: 'trending', label: 'Trending' },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'newest', label: "What's New" },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
  ];

  const displayProducts = (() => {
    let list = [...products];
    if (selectedBrand) list = list.filter((p) => businessName(p) === selectedBrand);
    if (priceBucket && PRICE_BUCKETS[priceBucket]) {
      const [lo, hi] = PRICE_BUCKETS[priceBucket];
      list = list.filter((p) => { const pr = getProductPrice(p); return pr >= lo && pr < hi; });
    }
    if (availInStock) list = list.filter((p) => p.availability?.state !== 'out_of_stock');
    if (availOnSale) list = list.filter((p) => hasDiscount(p));
    const rankIn = (arr: string[], id: string) => { const i = arr.indexOf(id); return i === -1 ? Number.MAX_SAFE_INTEGER : i; };
    if (sortOption === 'trending') list.sort((a, b) => rankIn(trendingRank, a._id) - rankIn(trendingRank, b._id));
    else if (sortOption === 'newest') list.sort((a, b) => rankIn(newRank, a._id) - rankIn(newRank, b._id));
    else if (sortOption === 'top_rated') list.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    else if (sortOption === 'price_asc') list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    else if (sortOption === 'price_desc') list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    return list;
  })();

  const resetFilters = () => {
    setSortOption('trending'); setPriceBucket(null); setSelectedBrand(null);
    setAvailInStock(false); setAvailOnSale(false);
  };

  // Page title
  const pageTitle = current?.label || slugParts[slugParts.length - 1]?.toUpperCase() || 'DISCOVER';

  // 404-like fallback
  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>Category not found</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '28px' }}>

      {/* Gender Toggle — desktop only */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Page Title */}
      <div className="text-left lg:text-center">
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px', marginBottom: '8px' }}
        >
          {pageTitle}
        </h1>
        <DiscoverBreadcrumb items={breadcrumbs} />
      </div>

      {/* ── Dynamic Product Type Tabs ─────────────────────────────── */}
      {dynamicProductTypes.length > 0 && (
        <div className="flex items-center justify-start lg:justify-center overflow-x-auto hide-scrollbar" style={{ gap: '8px' }}>
          {dynamicProductTypes.map((pt) => (
            <button
              key={pt}
              onClick={() => {
                if (selectedProductType === pt) {
                  setSelectedProductType(null);
                  setSelectedCategory(null);
                } else {
                  setSelectedProductType(pt);
                  setSelectedCategory(null);
                }
              }}
              className="flex-shrink-0 flex items-center transition-all"
              style={{
                height: '40px',
                gap: '8px',
                padding: typeImage[pt] ? '0 16px 0 6px' : '0 20px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                color: selectedProductType === pt ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: selectedProductType === pt ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {typeImage[pt] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={typeImage[pt]}
                  alt=""
                  style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              {pt}
            </button>
          ))}
        </div>
      )}

      {/* Hero Banners — only when no product type tab selected */}
      {!selectedProductType && <DiscoverHeroBanners banners={HERO_BANNERS} />}

      {/* ── Dynamic Category Chips (shown when a product type is selected) ── */}
      {dynamicCategories.length > 0 && (
        <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '8px' }}>
          <button
            onClick={() => setShowFilter(true)}
            className="flex-shrink-0 flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1.5px solid var(--border-glass)',
              background: 'var(--bg-base)',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className="flex-shrink-0 transition-all"
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                color: selectedCategory === cat ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: selectedCategory === cat ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Product Carousels / Skeleton ─────────────────────────────── */}
      {productsLoading ? (
        <div className="flex flex-col animate-pulse" style={{ gap: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col" style={{ gap: '16px' }}>
              <div className="h-4 w-40 bg-[var(--bg-surface-elevated)] rounded" />
              <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '16px' }}>
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex-shrink-0 flex flex-col" style={{ width: '240px', gap: '12px' }}>
                    <div className="rounded-[16px] bg-[var(--bg-surface-elevated)]" style={{ width: '240px', height: '320px' }} />
                    <div className="h-4 w-3/4 bg-[var(--bg-surface-elevated)] rounded" />
                    <div className="h-3 w-1/2 bg-[var(--bg-surface-elevated)] rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : selectedProductType ? (
        /* ── Product-type view: a grid of that type's products ── */
        displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 justify-items-center">
            {displayProducts.map((product) => (
              <div key={product._id} className="w-full">
                <ProductCard
                  id={product._id}
                  imageUrl={getProductImage(product)}
                  title={getProductName(product)}
                  brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
                  price={getProductPrice(product)}
                  originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
                  tag={getProductTag(product)}
                  stockState={product.availability?.state}
                  isFavorite={wishlist.includes(product._id)}
                  onFavoriteToggle={() => toggleWishlist(product._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16" style={{ gap: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No products here yet</p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Try another type or category.</p>
          </div>
        )
      ) : (
        /* ── Kind view: one carousel per product type; header opens that type ── */
        <>
          {dynamicProductTypes.map((pt) => {
            const typeProducts = filteredProducts.filter((p) => getProductType(p) === pt);
            return (
              <ProductCarousel
                key={pt}
                title={pt}
                products={typeProducts}
                onHeaderClick={() => { setSelectedProductType(pt); setSelectedCategory(null); }}
              />
            );
          })}
        </>
      )}

      {/* ══════ FILTER BOTTOM SHEET (reused vendor pattern) ══════ */}
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
            style={{
              maxHeight: '70vh',
              backgroundColor: 'var(--bg-base)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-glass)',
            }}
          >
            {/* Drag Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Filter & Sort</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
                style={{ borderRadius: '9999px', backgroundColor: 'var(--bg-surface-elevated)' }}
              >
                <X size={18} color="var(--text-primary)" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
              {/* Sort */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Sort by</p>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSortOption(opt.id)}
                        className="w-full text-left transition-colors hover:bg-[var(--bg-surface-elevated)]"
                        style={{ color: active ? 'var(--brand-fill-text)' : 'var(--text-primary)', fontSize: '14px', fontWeight: active ? 800 : 500, padding: '12px 16px', borderRadius: '12px', background: active ? 'var(--brand-fill)' : 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand — dynamic from the fetched products */}
              {brands.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brand</p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => {
                      const active = selectedBrand === brand;
                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(active ? null : brand)}
                          className="transition-all"
                          style={{
                            padding: '10px 20px',
                            borderRadius: '9999px',
                            backgroundColor: active ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-glass)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: active ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRICE_BUCKETS).map((range) => {
                    const active = priceBucket === range;
                    return (
                      <button
                        key={range}
                        onClick={() => setPriceBucket(active ? null : range)}
                        className="transition-all"
                        style={{
                          padding: '10px 20px',
                          borderRadius: '9999px',
                          backgroundColor: active ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-glass)',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: active ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Availability</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'In-stock', active: availInStock, toggle: () => setAvailInStock((v) => !v) },
                    { label: 'On sale', active: availOnSale, toggle: () => setAvailOnSale((v) => !v) },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={opt.toggle}
                      className="transition-all"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: opt.active ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-glass)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: opt.active ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer — Reset + Apply */}
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '0 24px 24px' }}>
              <button
                onClick={resetFilters}
                className="flex-1 text-sm font-bold transition-colors hover:bg-[var(--bg-surface-elevated)]"
                style={{ padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex-1 text-sm font-bold transition-colors hover:opacity-90"
                style={{ padding: '14px', borderRadius: '16px', backgroundColor: 'var(--brand-fill)', color: 'var(--brand-fill-text)', border: 'none', cursor: 'pointer' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
