'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { type Vendor } from '@/data/vendors';
import { type Product } from '@/data/products';

interface VendorShowcaseCardProps {
  vendor: Vendor;
  products: Product[];
  isFollowing: boolean;
  onToggleFollow: () => void;
}

/**
 * VendorShowcaseCard — Same shape as VendorCard but with:
 * - Cover photo (heroImage or first product image fallback)
 * - Brand logo (SVG/PNG) centered on the cover
 * - 3 rectangular product thumbnails at the bottom
 * - Same discount badge position as VendorCard
 */
export const VendorShowcaseCard: React.FC<VendorShowcaseCardProps> = ({
  vendor,
  products,
  isFollowing,
  onToggleFollow,
}) => {
  const hasPromo = !!vendor.promo;
  // Ensure we always show exactly 2 product thumbnails
  // If vendor has fewer products, pad with different gallery images
  const rawProducts = products.slice(0, 2);
  const displayProducts = rawProducts.length >= 2
    ? rawProducts
    : rawProducts.length === 1
      ? [rawProducts[0], rawProducts[0]] // duplicate with different gallery index
      : [];

  // Cover image: heroImage → first product image → fallback
  const coverImage =
    vendor.heroImage ||
    products[0]?.gallery?.[0] ||
    products[0]?.image ||
    '/image/bespoke-agbada-orange.webp';

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow();
  };

  // ─── Inner card (cover fills card, products overlay at bottom) ──
  const innerCard = (
    <Link
      href={`/vendor/${vendor.id}`}
      className="relative overflow-hidden flex-shrink-0 block group"
      style={{
        width: '100%',
        flex: hasPromo ? 1 : undefined,
        height: hasPromo ? undefined : '100%',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
        textDecoration: 'none',
      }}
    >
      {/* ── Full-bleed Cover Image ── */}
      <Image
        src={coverImage}
        alt={vendor.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        style={{ objectFit: 'cover' }}
        sizes="360px"
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      />

      {/* ── Top Section (Header) ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between"
        style={{ padding: '15px 15px 0 15px' }}
      >
        {/* Vendor Logo — left */}
        <div className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:translate-x-1">
          {vendor.logoStyle === 'image' && vendor.logoImage ? (
            <div
              className="relative overflow-hidden"
              style={{ width: '48px', height: '52px', borderRadius: '8px' }}
            >
              <Image
                src={vendor.logoImage}
                alt={vendor.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="48px"
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '52px',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {vendor.logoInitials}
            </div>
          )}
        </div>

        {/* Vendor name + rating */}
        {vendor.rating >= 4.0 && (
          <div
            className="flex-1 flex flex-col justify-center transition-transform duration-500 ease-out group-hover:translate-x-1.5"
            style={{ padding: '0 8px', minWidth: 0 }}
          >
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {vendor.name}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              ★ {vendor.rating} ({vendor.reviewCount})
            </span>
          </div>
        )}

        {/* Follow / Following Button — right */}
        <button
          onClick={handleFollowClick}
          className="transition-all hover:opacity-90 flex-shrink-0"
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            background: isFollowing ? '#111' : 'rgba(255,253,253,0.74)',
            color: isFollowing ? '#FFFFFF' : '#111',
            border: 'none',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </button>
      </div>

      {/* ── Centered Brand Name on Cover ── */}
      <div
        className="absolute z-10 flex items-center justify-center pointer-events-none"
        style={{
          left: '50%',
          top: 'calc((70px + (100% - 175px)) / 2)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1">
          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
              maxWidth: '90%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {vendor.name}
          </span>
        </div>
      </div>

      {/* ── Product Thumbnails — floating at bottom, transparent ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex"
        style={{ gap: '12px', padding: '15px' }}
      >
        {displayProducts.length > 0 ? (
          displayProducts.map((product, i) => (
            <Link
              key={product.id + '-' + i}
              href={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative overflow-hidden group/thumb"
              style={{
                flex: 1,
                aspectRatio: '3 / 4',
                borderRadius: '16px',
                background: '#F5F3F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                maxHeight: '160px',
              }}
            >
              <Image
                src={product.gallery?.[i] || product.gallery?.[0] || product.image}
                alt={product.title}
                fill
                className="object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                sizes="100px"
              />
            </Link>
          ))
        ) : (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              style={{
                flex: 1,
                aspectRatio: '3 / 4',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
              }}
            />
          ))
        )}
      </div>
    </Link>
  );

  // ─── Variant 2: With Discount wrapper ───────────────────────────
  if (hasPromo) {
    return (
      <div
        className="flex-shrink-0 w-[calc(100vw-56px)] max-w-[380px] h-[420px] lg:w-[360px] lg:max-w-none lg:h-[500px]"
        style={{
          borderRadius: '24px',
          background: '#514f4f',
          padding: '11px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          minWidth: '300px',
        }}
      >
        {/* Discount Banner */}
        <div
          className="flex flex-col items-center"
          style={{ width: '100%', gap: '5px', padding: '0 4px' }}
        >
          <div className="flex items-center" style={{ gap: '1px', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#C72C41',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                padding: '1px 4px',
                borderRadius: '4px',
                lineHeight: '15px',
                whiteSpace: 'nowrap',
              }}
            >
              {vendor.promo!.label}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: '#FFFFFF',
                lineHeight: '15px',
                marginLeft: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {vendor.promo!.condition}
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              color: '#CDCDCD',
              textAlign: 'center',
              lineHeight: 1.119,
            }}
          >
            and 1 Item more
          </span>
        </div>

        {/* Main Card */}
        {innerCard}
      </div>
    );
  }

  // ─── Variant 1: Without Discount ────────────────────────────────
  return (
    <div 
      className="flex-shrink-0 w-[calc(100vw-56px)] max-w-[380px] h-[420px] lg:w-[360px] lg:max-w-none lg:h-[500px]"
      style={{ minWidth: '300px' }}
    >
      {innerCard}
    </div>
  );
};
