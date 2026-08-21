'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { CategoryBar, type CategoryKind } from '@/components/CategoryBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import {
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductImage,
  getProductTag,
  hasDiscount,
} from '@/lib/api-types';
import type { ProductQueryParams } from '@/lib/api-types';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Map CategoryKind UI filters → backend query params ───────────
function mapKindToParams(kind: CategoryKind): Partial<ProductQueryParams> {
  switch (kind) {
    case 'all':
      return {};
    case 'bespoke':
    case 'custom':
      // Backend doesn't have a direct "customizable" filter,
      // so we filter clothing and post-filter by type
      return { kind: 'clothing' };
    case 'read-to-wear':
      return { kind: 'clothing' };
    case 'fabric':
      return { kind: 'fabric' };
    case 'accessory':
      return { kind: 'accessory' };
    default:
      return {};
  }
}

// ─── CatalogContent ───────────────────────────────────────────────
function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist, toggleWishlist } = useApp();

  // ── State ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedKind, setSelectedKind] = useState<CategoryKind>(
    (searchParams.get('kind') as CategoryKind) || 'all'
  );
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'rating');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  // ── Sync from URL query params ────────────────────────────────
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qKind = searchParams.get('kind');
    const qSort = searchParams.get('sort');
    if (qSearch !== null) setSearchQuery(qSearch);
    if (qSort !== null) setSortBy(qSort);
    if (qKind) {
      if (qKind === 'clothing') {
        setSelectedKind('bespoke');
      } else {
        setSelectedKind(qKind as CategoryKind);
      }
    }
    // Reset to page 1 when filters change
    setPage(1);
  }, [searchParams]);

  // ── Build backend query params ────────────────────────────────
  const backendSortBy = sortBy === 'priceAsc' || sortBy === 'priceDesc' ? undefined : sortBy as 'rating' | 'date' | 'relevance' | undefined;
  const backendOrder = sortBy === 'priceAsc' ? 'asc' as const : sortBy === 'priceDesc' ? 'desc' as const : undefined;

  const queryParams: ProductQueryParams = {
    page,
    size: 20,
    search: searchQuery || undefined,
    sortBy: backendSortBy,
    order: backendOrder,
    ...mapKindToParams(selectedKind),
  };

  const { products, loading, error, pagination, refetch } = useProducts(queryParams);

  // ── Client-side post-filters (for things backend doesn't support) ──
  const filteredProducts = products.filter((p) => {
    // Price filter (client-side — backend doesn't have price range)
    if (getProductPrice(p) > maxPrice) return false;

    // Custom/bespoke post-filter (backend returns all clothing)
    if (selectedKind === 'bespoke' || selectedKind === 'custom') {
      return p.clothing?.type === 'customize';
    }
    if (selectedKind === 'read-to-wear') {
      return p.clothing?.type !== 'customize';
    }

    return true;
  });

  // ── Client-side sort for price (backend doesn't support price sort) ──
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Always sink sold-out products to the end, whatever the primary sort.
    const aOut = a.availability?.state === 'out_of_stock' ? 1 : 0;
    const bOut = b.availability?.state === 'out_of_stock' ? 1 : 0;
    if (aOut !== bOut) return aOut - bOut;
    if (sortBy === 'priceAsc') return getProductPrice(a) - getProductPrice(b);
    if (sortBy === 'priceDesc') return getProductPrice(b) - getProductPrice(a);
    return 0; // backend handles rating/date sort
  });

  // "Showing N items" must match what's on screen. When a client-only filter
  // (price cap, or a bespoke/custom/ready-to-wear split the backend can't do) is
  // active it trims the fetched page, so the backend total overstates the grid —
  // fall back to the actual visible count in that case.
  const clientFilterActive =
    maxPrice < 200000 ||
    selectedKind === 'bespoke' ||
    selectedKind === 'custom' ||
    selectedKind === 'read-to-wear';
  const displayCount = clientFilterActive
    ? sortedProducts.length
    : pagination.totalItems;

  // ── Reset handler ─────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedKind('all');
    setSortBy('rating');
    setMaxPrice(200000);
    setPage(1);
    router.push('/products');
  };

  // ── Pagination handlers ───────────────────────────────────────
  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 py-4 lg:py-8 relative min-h-screen lg:overflow-x-clip">

      {/* 1. FLOATING OVERLAY FILTER SIDEBAR */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={handleClearFilters}
      />

      {/* 2. PRODUCT FEED */}
      <section className="flex-1 w-full flex flex-col gap-8">

        {/* Category Bar */}
        <CategoryBar
          selectedKind={selectedKind}
          onCategoryChange={(kind) => { setSelectedKind(kind); setPage(1); }}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
          itemCount={displayCount}
        />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 animate-pulse justify-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-[20px] bg-[#F0EBE4]" style={{ width: '100%', aspectRatio: '3/4' }} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-panel border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4">
            <SlidersHorizontal size={36} className="text-[#999]" />
            <h3 className="text-base font-bold text-[#1A1A1A]">Something went wrong</h3>
            <p className="text-xs text-[#888] max-w-[280px]">{error}</p>
            <button onClick={refetch} className="btn-primary" style={{ padding: '10px 20px', fontSize: '11px' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && sortedProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 animate-slide-up justify-items-center">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  imageUrl={getProductImage(product)}
                  title={getProductName(product)}
                  brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
                  price={getProductPrice(product)}
                  originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
                  tag={getProductTag(product)}
                  stockState={product.availability?.state}
                  isFavorite={wishlist.includes(product._id)}
                  onFavoriteToggle={(id) => toggleWishlist(id as string)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center" style={{ gap: '12px', padding: '16px 0' }}>
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!pagination.hasPrevious}
                  className="flex items-center justify-center transition-all disabled:opacity-30"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#F5F5F5',
                    border: '1px solid #E5E5E5',
                    cursor: pagination.hasPrevious ? 'pointer' : 'default',
                  }}
                >
                  <ChevronLeft size={16} color="#1A1A1A" />
                </button>

                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center justify-center transition-all disabled:opacity-30"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#F5F5F5',
                    border: '1px solid #E5E5E5',
                    cursor: pagination.hasNext ? 'pointer' : 'default',
                  }}
                >
                  <ChevronRight size={16} color="#1A1A1A" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="glass-panel border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4">
            <SlidersHorizontal size={36} className="text-[#999]" />
            <h3 className="text-base font-bold text-[#1A1A1A]">No products match your filters</h3>
            <p className="text-xs text-[#888] max-w-[280px]">
              Try searching with broader keywords, adjusting the price sliders, or resetting categories.
            </p>
            <button onClick={handleClearFilters} className="btn-primary" style={{ padding: '10px 20px', fontSize: '11px' }}>
              Reset Filters
            </button>
          </div>
        )}

      </section>

    </div>
  );
}

// ─── Page Export ───────────────────────────────────────────────────
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
