'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import {
  getProductImage,
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductTag,
  hasDiscount,
} from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';

// ═══════════════════════════════════════════════════════════════
//  Recently viewed (/recently-viewed) — the page behind every
//  "Recently Seen / Pick up where you left off → View All" link.
//  The context stores only { id, image, href } (12 most recent,
//  products AND vendors mixed), so each entry is hydrated to a full
//  card here; anything that fails to hydrate (delisted product,
//  deactivated vendor) falls back to its stored image tile.
// ═══════════════════════════════════════════════════════════════

interface HydratedVendor {
  _id: string;
  business_name?: string;
  business_logo_url?: string;
  cover_image_url?: string;
}

function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline" style={{ gap: '10px' }}>
      <h2
        style={{
          fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
          fontSize: '15px',
          fontWeight: 900,
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {title}
      </h2>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count}</span>
    </div>
  );
}

export default function RecentlyViewedPage() {
  const { recentlyViewed, wishlist, toggleWishlist } = useApp();

  // Stale string entries from the old storage format are dropped.
  const validItems = useMemo(
    () =>
      recentlyViewed.filter(
        (i) => typeof i === 'object' && !!i?.id && !!i?.href,
      ),
    [recentlyViewed],
  );

  const productItems = useMemo(
    () => validItems.filter((i) => i.href.startsWith('/products/')),
    [validItems],
  );
  const vendorItems = useMemo(
    () => validItems.filter((i) => i.href.startsWith('/vendor/')),
    [validItems],
  );

  const [products, setProducts] = useState<Record<string, ApiProduct>>({});
  const [vendors, setVendors] = useState<Record<string, HydratedVendor>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (validItems.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unwrap = (body: any) => body?.data?.data ?? body?.data ?? body;
    Promise.allSettled([
      ...productItems.map((i) =>
        api.get(`/products/${i.id}`).then((res) => {
          const p = unwrap(res.data);
          if (p?._id && !cancelled)
            setProducts((prev) => ({ ...prev, [i.id]: p }));
        }),
      ),
      ...vendorItems.map((i) =>
        api.get(`/business/public/${i.id}`).then((res) => {
          const v = unwrap(res.data);
          const doc = v?.business ?? v;
          if (doc?._id && !cancelled)
            setVendors((prev) => ({ ...prev, [i.id]: doc }));
        }),
      ),
    ]).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validItems.length]);

  // ── Empty state ──
  if (validItems.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center animate-fade-in"
        style={{ padding: '80px 24px', gap: '12px' }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: '64px', height: '64px', background: 'var(--bg-surface-elevated)' }}
        >
          <Clock size={26} color="var(--text-muted)" />
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Nothing viewed yet
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
          Products and shops you open will show up here so you can pick up
          where you left off.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center transition-opacity hover:opacity-80"
          style={{ marginTop: '6px', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--brand-brown)', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none' }}
        >
          Start exploring <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '28px', paddingBottom: '24px' }}>
      {/* Header */}
      <div className="flex flex-col" style={{ gap: '4px' }}>
        <h1
          style={{
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Recently viewed
        </h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          The last {validItems.length} product{validItems.length === 1 ? '' : 's'} and shops you opened — newest first.
        </p>
      </div>

      {/* ── Products ── */}
      {productItems.length > 0 && (
        <section className="flex flex-col" style={{ gap: '14px' }}>
          <SectionHead title="Products" count={productItems.length} />
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {productItems.map((item) => {
              const p = products[item.id];
              if (p) {
                return (
                  <ProductCard
                    key={item.id}
                    id={p._id}
                    imageUrl={getProductImage(p) || item.image}
                    title={getProductName(p)}
                    brand={typeof p.business === 'object' ? p.business?.business_name ?? '' : ''}
                    price={getProductPrice(p)}
                    originalPrice={hasDiscount(p) ? getProductOriginalPrice(p) : undefined}
                    tag={getProductTag(p)}
                    stockState={p.availability?.state}
                    isFavorite={wishlist.includes(p._id)}
                    onFavoriteToggle={() => toggleWishlist(p._id)}
                  />
                );
              }
              // Not hydrated (still loading, or the product is gone) — the
              // stored image still links through.
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative overflow-hidden transition-opacity hover:opacity-85${loading ? ' animate-pulse' : ''}`}
                  style={{ aspectRatio: '214/264', borderRadius: '18px', background: 'var(--bg-surface-elevated)' }}
                >
                  {item.image && (
                    <Image src={item.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 214px" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Shops ── */}
      {vendorItems.length > 0 && (
        <section className="flex flex-col" style={{ gap: '14px' }}>
          <SectionHead title="Shops" count={vendorItems.length} />
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {vendorItems.map((item) => {
              const v = vendors[item.id];
              const name = v?.business_name || 'Shop';
              const cover = v?.cover_image_url || item.image;
              const logo = v?.business_logo_url || item.image;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group relative overflow-hidden flex flex-col justify-end transition-transform hover:-translate-y-1${!v && loading ? ' animate-pulse' : ''}`}
                  style={{ aspectRatio: '214/150', borderRadius: '18px', background: 'var(--bg-surface-elevated)', textDecoration: 'none' }}
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 214px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Store size={26} color="var(--text-muted)" />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />
                  <div className="relative flex items-center" style={{ padding: '12px', gap: '9px' }}>
                    <div
                      className="flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF', border: '1.5px solid rgba(255,255,255,0.8)' }}
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Store size={14} color="var(--brand-brown)" />
                      )}
                    </div>
                    <span
                      className="truncate"
                      style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif", fontSize: '12.5px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    >
                      {name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
