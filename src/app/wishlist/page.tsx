'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { productCatalog } from '@/data/products';
import { Heart, ChevronDown } from 'lucide-react';

type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'name';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Get full product data for wishlisted items
  const wishlistedProducts = productCatalog.filter((p) =>
    wishlist.includes(p.id)
  );

  // Sort products
  const sortedProducts = [...wishlistedProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    // 'recent' — reverse order (last added first)
    return wishlist.indexOf(b.id) - wishlist.indexOf(a.id);
  });

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recently Added',
    priceAsc: 'Price: Low - High',
    priceDesc: 'Price: High - Low',
    name: 'Name: A - Z',
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 py-4 lg:py-8 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <h1
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
        style={{ fontSize: '22px' }}
      >
        Wishlist
      </h1>

      {/* ─── Sort Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 transition-colors hover:bg-gray-50"
            style={{
              padding: '10px 18px',
              borderRadius: '100px',
              border: '1px solid #E5E5E5',
              fontSize: '13px',
              fontWeight: 500,
              color: '#1A1A1A',
              background: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <span>{sortLabels[sortBy]}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showSortMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showSortMenu && (
            <div
              className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-30 animate-fade-in"
              style={{ minWidth: '200px', padding: '8px' }}
            >
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                  className="w-full text-left transition-colors hover:bg-gray-50"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: sortBy === key ? 700 : 400,
                    color: sortBy === key ? '#1A1A1A' : '#666',
                    background: sortBy === key ? '#F7F7F7' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Count */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#999',
            letterSpacing: '0.02em',
          }}
        >
          {sortedProducts.length} {sortedProducts.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* ─── Product Grid ───────────────────────────────────────── */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 animate-slide-up justify-items-center">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              imageUrl={product.image}
              title={product.title}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              tag={product.tag}
              isFavorite={true}
              onFavoriteToggle={(id) => toggleWishlist(id as string)}
            />
          ))}
        </div>
      ) : (
        /* ─── Empty State ────────────────────────────────────── */
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ padding: '80px 24px', gap: '16px' }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FFF0F3',
            }}
          >
            <Heart size={28} color="#FF2E63" strokeWidth={1.5} />
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1A1A1A',
              fontFamily: 'var(--font-display)',
            }}
          >
            Your wishlist is empty
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#999',
              maxWidth: '300px',
              lineHeight: 1.6,
            }}
          >
            Browse our collection and tap the heart icon to save items you love.
          </p>
          <a
            href="/products"
            className="btn-primary"
            style={{
              marginTop: '8px',
              padding: '12px 32px',
              fontSize: '13px',
              borderRadius: '100px',
            }}
          >
            Explore Products
          </a>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {showSortMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}
