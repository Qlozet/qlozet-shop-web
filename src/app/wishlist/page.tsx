'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { api } from '@/lib/api';
import { getProductName, getProductImage, getProductPrice, getProductOriginalPrice, getProductTag, hasDiscount } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import { Heart, ChevronDown, Loader2 } from 'lucide-react';

type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'name';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, user } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist products from backend
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('qlozet_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/users/wishlist')
      .then((res) => {
        const data = res.data;
        // Backend may return { data: [...] } or [...] directly
        const raw = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        // Filter to only populated product objects (not plain IDs)
        const populated = raw.filter((item: any) => typeof item === 'object' && item._id);
        // Deduplicate by _id
        const seen = new Set<string>();
        const unique = populated.filter((item: any) => {
          if (seen.has(item._id)) return false;
          seen.add(item._id);
          return true;
        });
        setProducts(unique);
      })
      .catch(() => {
        // Fallback: clear products on error
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [user, wishlist.length]); // re-fetch when wishlist changes

  if (!user) {
    return (
      <div className="flex flex-col gap-6 lg:gap-8 py-4 lg:py-8 animate-fade-in">
        <h1
          className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px' }}
        >
          Wishlist
        </h1>
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 24px', gap: '20px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(44,24,16,0.06)' }}
          >
            <Heart size={32} color="var(--brand-brown)" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sign In Required
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
              You must sign in first before being able to view or manage your wishlist.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '14px 32px',
              borderRadius: '100px',
              background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(44,24,16,0.2)',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Filter products to only show items still in the wishlist (handles optimistic removal)
  const wishlistedProducts = products.filter((p) => wishlist.includes(p._id));

  // Sort products
  const sortedProducts = [...wishlistedProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.base_price - b.base_price;
    if (sortBy === 'priceDesc') return b.base_price - a.base_price;
    if (sortBy === 'name') return getProductName(a).localeCompare(getProductName(b));
    // 'recent' — reverse order (last added first)
    return wishlist.indexOf(b._id) - wishlist.indexOf(a._id);
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
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
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
            className="flex items-center gap-2 transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              padding: '10px 18px',
              borderRadius: '100px',
              border: '1px solid var(--border-glass)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              background: 'var(--bg-base)',
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
              className="absolute top-full left-0 mt-2 bg-[var(--bg-base)] rounded-2xl shadow-lg border border-[var(--border-glass)] z-30 animate-fade-in"
              style={{ minWidth: '200px', padding: '8px' }}
            >
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                  className="w-full text-left transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: sortBy === key ? 700 : 400,
                    color: sortBy === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: sortBy === key ? 'var(--bg-surface-elevated)' : 'transparent',
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
            color: 'var(--text-muted)',
            letterSpacing: '0.02em',
          }}
        >
          {loading ? '...' : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'Item' : 'Items'}`}
        </span>
      </div>

      {/* ─── Loading Skeleton ────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6 justify-items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-full animate-pulse" style={{ maxWidth: '260px' }}>
              <div className="bg-[var(--bg-surface-elevated)] rounded-[14px] lg:rounded-[20px]" style={{ aspectRatio: '214/264' }} />
              <div className="flex flex-col" style={{ gap: '6px', marginTop: '12px' }}>
                <div className="bg-[var(--bg-surface-elevated)] rounded-md" style={{ height: '10px', width: '40%' }} />
                <div className="bg-[var(--bg-surface-elevated)] rounded-md" style={{ height: '14px', width: '70%' }} />
                <div className="bg-[var(--bg-surface-elevated)] rounded-md" style={{ height: '12px', width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        /* ─── Product Grid ───────────────────────────────────────── */
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
              isFavorite={wishlist.includes(product._id)}
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
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Your wishlist is empty
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
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
