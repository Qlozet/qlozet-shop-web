'use client';

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
}

/**
 * Shared full-page product grid — used by the Trending / What's New / Top Rated
 * pages. Header centres on desktop, left-aligns on mobile (matches the rest of
 * the shop), with a loading skeleton and an empty state.
 */
export function ProductListPage({ title, subtitle, products, loading, emptyText }: ProductListPageProps) {
  const { wishlist, toggleWishlist } = useApp();

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
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 lg:gap-5">
          {products.map((product) => (
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
              onFavoriteToggle={() => toggleWishlist(product._id)}
            />
          ))}
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
    </div>
  );
}
