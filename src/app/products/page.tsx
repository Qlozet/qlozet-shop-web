'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { CategoryBar, type CategoryKind } from '@/components/CategoryBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { productCatalog } from '@/data/products';
import { SlidersHorizontal } from 'lucide-react';

// ─── CatalogContent ───────────────────────────────────────────────
// Main orchestrator: manages filter/sort state, applies them to the
// catalog, and composes the CategoryBar + FilterSidebar + ProductGrid.

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist, toggleWishlist } = useApp();

  // ── State ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedKind, setSelectedKind] = useState<CategoryKind>(
    (searchParams.get('kind') as CategoryKind) || 'all'
  );
  const [sortBy, setSortBy] = useState<string>('rating');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── Sync from URL query params ────────────────────────────────
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qKind = searchParams.get('kind');
    if (qSearch !== null) setSearchQuery(qSearch);
    if (qKind) {
      if (qKind === 'clothing') {
        setSelectedKind('bespoke');
      } else {
        setSelectedKind(qKind as CategoryKind);
      }
    }
  }, [searchParams]);

  // ── Filtering & Sorting ───────────────────────────────────────
  const filteredProducts = productCatalog
    .filter((prod) => {
      const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prod.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesKind = (() => {
        if (selectedKind === 'all') return true;
        if (selectedKind === 'bespoke') {
          return prod.kind === 'clothing' && (prod.title.toLowerCase().includes('bespoke') || prod.tag === 'CUSTOMIZABLE');
        }
        if (selectedKind === 'custom') {
          return prod.tag === 'CUSTOMIZABLE';
        }
        if (selectedKind === 'read-to-wear') {
          return prod.kind === 'clothing' && !prod.title.toLowerCase().includes('bespoke');
        }
        if (selectedKind === 'fabric') return prod.kind === 'fabric';
        if (selectedKind === 'accessory') return prod.kind === 'accessory';
        return true;
      })();
      const matchesPrice = prod.price <= maxPrice;
      return matchesSearch && matchesKind && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

  // ── Reset handler ─────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedKind('all');
    setSortBy('rating');
    setMaxPrice(200000);
    router.push('/products');
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
          onCategoryChange={setSelectedKind}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
          itemCount={filteredProducts.length}
        />

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 animate-slide-up justify-items-center">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                imageUrl={product.image}
                title={product.title}
                brand={product.brand}
                price={product.price}
                originalPrice={product.originalPrice}
                tag={product.tag}
                isFavorite={wishlist.includes(product.id)}
                onFavoriteToggle={(id) => toggleWishlist(id as string)}
              />
            ))}
          </div>
        ) : (
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
