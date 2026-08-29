'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import {
  getProductImage,
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductTag,
  hasDiscount,
} from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';

interface ProductListPageProps {
  title: string;
  subtitle?: string;
  products: ApiProduct[];
  loading?: boolean;
  /** Message when there are no products (and not loading). */
  emptyText?: string;
  /** Filter & sort sheet (on by default — pass false to hide). */
  filterable?: boolean;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'top_rated' | 'newest';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'newest', label: "What's New" },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_BUCKETS: Record<string, [number, number]> = {
  'Under ₦50K': [0, 50000],
  '₦50K - ₦100K': [50000, 100000],
  '₦100K - ₦200K': [100000, 200000],
  'Over ₦200K': [200000, Infinity],
};

const KIND_LABELS: Record<string, string> = {
  clothing: 'Clothing',
  fabric: 'Fabric',
  accessory: 'Accessories',
};

/**
 * Shared full-page product grid — used by the collection pages and the
 * Trending / What's New / Top Rated pages. Header centres on desktop,
 * left-aligns on mobile, with a loading skeleton, an empty state, and the
 * shop's standard floating filter & sort sheet (same pattern as the explore
 * pages: bottom sheet on mobile, right panel on desktop).
 */
export function ProductListPage({ title, subtitle, products, loading, emptyText, filterable = true }: ProductListPageProps) {
  const { wishlist, toggleWishlist } = useApp();

  // ── Filter & sort state ──
  const [showFilter, setShowFilter] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [selectedKind, setSelectedKind] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceBucket, setPriceBucket] = useState<string | null>(null);
  const [availInStock, setAvailInStock] = useState(false);
  const [availOnSale, setAvailOnSale] = useState(false);

  const businessName = (p: ApiProduct) =>
    typeof p.business === 'object' ? p.business?.business_name ?? '' : '';

  // Facets derived from the actual result set.
  const kinds = useMemo(
    () => Array.from(new Set(products.map((p) => p.kind).filter(Boolean))),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map(businessName).filter(Boolean))).sort(),
    [products]
  );

  const activeCount =
    (selectedKind ? 1 : 0) + (selectedBrand ? 1 : 0) + (priceBucket ? 1 : 0) +
    (availInStock ? 1 : 0) + (availOnSale ? 1 : 0) + (sortOption !== 'featured' ? 1 : 0);

  const displayProducts = useMemo(() => {
    let list = [...products];
    if (selectedKind) list = list.filter((p) => p.kind === selectedKind);
    if (selectedBrand) list = list.filter((p) => businessName(p) === selectedBrand);
    if (priceBucket && PRICE_BUCKETS[priceBucket]) {
      const [lo, hi] = PRICE_BUCKETS[priceBucket];
      list = list.filter((p) => { const pr = getProductPrice(p); return pr >= lo && pr < hi; });
    }
    if (availInStock) list = list.filter((p) => p.availability?.state !== 'out_of_stock');
    if (availOnSale) list = list.filter((p) => hasDiscount(p));
    if (sortOption === 'price_asc') list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    else if (sortOption === 'price_desc') list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    else if (sortOption === 'top_rated') list.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    else if (sortOption === 'newest') list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    return list;
  }, [products, selectedKind, selectedBrand, priceBucket, availInStock, availOnSale, sortOption]);

  const resetFilters = () => {
    setSortOption('featured'); setSelectedKind(null); setSelectedBrand(null);
    setPriceBucket(null); setAvailInStock(false); setAvailOnSale(false);
  };

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '9999px',
    backgroundColor: active ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-glass)',
    fontSize: '12px',
    fontWeight: 700,
    color: active ? 'var(--brand-fill-text)' : 'var(--text-primary)',
    cursor: 'pointer',
  });

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '24px', paddingBottom: '8px' }}>
      {/* Header */}
      <div className="text-left lg:text-center">
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{subtitle}</p>
        )}
      </div>

      {/* Toolbar — result count + the filter trigger */}
      {filterable && !loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {displayProducts.length} of {products.length} item{products.length === 1 ? '' : 's'}
          </span>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{ gap: '8px', padding: '9px 16px', borderRadius: '10px', border: '1.5px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Filter &amp; Sort</span>
            {activeCount > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--brand-fill-text)', background: 'var(--brand-fill)', padding: '2px 7px', borderRadius: '100px' }}>{activeCount}</span>
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 lg:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse" style={{ gap: '10px' }}>
              <div style={{ aspectRatio: '214/264', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }} />
              <div style={{ height: '11px', width: '55%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
              <div style={{ height: '13px', width: '75%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
            </div>
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 lg:gap-5">
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              imageUrl={getProductImage(product)}
              title={getProductName(product)}
              brand={businessName(product)}
              price={getProductPrice(product)}
              originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
              tag={getProductTag(product)}
              stockState={product.availability?.state}
              isFavorite={wishlist.includes(product._id)}
              onFavoriteToggle={() => toggleWishlist(product._id)}
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px', gap: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No matches</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
            Nothing fits the current filters.
          </p>
          <button onClick={resetFilters} style={{ marginTop: '4px', padding: '10px 24px', borderRadius: '10px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: 'pointer' }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ padding: '64px 24px', gap: '10px' }}
        >
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Nothing here yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
            {emptyText ?? 'Check back soon — new pieces land all the time.'}
          </p>
        </div>
      )}

      {/* ══════ FILTER SHEET (same floating pattern as the explore pages) ══════ */}
      {filterable && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowFilter(false)}
          />
          <div
            className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showFilter ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`}
            style={{
              maxHeight: '70vh',
              backgroundColor: 'var(--bg-base)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
            </div>

            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Filter &amp; Sort</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
                style={{ borderRadius: '9999px', backgroundColor: 'var(--bg-surface-elevated)' }}
              >
                <X size={18} color="var(--text-primary)" />
              </button>
            </div>

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

              {/* Kind — only when the set is mixed */}
              {kinds.length > 1 && (
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Type</p>
                  <div className="flex flex-wrap gap-2">
                    {kinds.map((k) => (
                      <button key={k} onClick={() => setSelectedKind(selectedKind === k ? null : k!)} className="transition-all" style={chip(selectedKind === k)}>
                        {KIND_LABELS[k!] ?? k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand */}
              {brands.length > 1 && (
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brand</p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <button key={brand} onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)} className="transition-all" style={chip(selectedBrand === brand)}>
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRICE_BUCKETS).map((range) => (
                    <button key={range} onClick={() => setPriceBucket(priceBucket === range ? null : range)} className="transition-all" style={chip(priceBucket === range)}>
                      {range}
                    </button>
                  ))}
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
                    <button key={opt.label} onClick={opt.toggle} className="transition-all" style={chip(opt.active)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
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
