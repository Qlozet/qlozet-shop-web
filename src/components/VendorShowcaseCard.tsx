'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ApiBusinessPublic } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import { getProductImage, getProductName } from '@/lib/api-types';

interface VendorShowcaseCardProps {
  vendor: ApiBusinessPublic;
  products: ApiProduct[];
  isFollowing: boolean;
  onToggleFollow: () => void;
}

/**
 * VendorShowcaseCard — Shows a vendor with:
 * - Cover photo (cover_image_url or first product image fallback)
 * - Brand logo (SVG/PNG) centered on the cover
 * - 2 rectangular product thumbnails at the bottom
 * - Follow/Following button
 */
export const VendorShowcaseCard: React.FC<VendorShowcaseCardProps> = ({
  vendor,
  products,
  isFollowing,
  onToggleFollow,
}) => {
  // Ensure we always show exactly 2 product thumbnails
  const rawProducts = products.slice(0, 2);
  const displayProducts = rawProducts.length >= 2
    ? rawProducts
    : rawProducts.length === 1
      ? [rawProducts[0], rawProducts[0]]
      : [];

  // Derived vendor fields
  const vendorName = vendor.business_name;
  const vendorLogo = vendor.business_logo_url;
  const vendorRating = vendor.average_rating ?? 0;
  const vendorReviewCount = vendor.total_ratings ?? 0;
  const logoInitials = vendorName.slice(0, 2).toUpperCase();

  // Cover image: cover_image_url → first product image → fallback
  const coverImage =
    vendor.cover_image_url ||
    (products[0] ? getProductImage(products[0]) : '') ||
    '/image/bespoke-agbada-orange.webp';

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow();
  };

  // ─── Inner card (cover fills card, products overlay at bottom) ──
  const innerCard = (
    <Link
      href={`/vendor/${vendor._id}`}
      className="relative overflow-hidden flex-shrink-0 block group"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
        textDecoration: 'none',
      }}
    >
      {/* ── Full-bleed Cover Image ── */}
      <Image
        src={coverImage}
        alt={vendorName}
        fill
        quality={100}
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, 360px"
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
          {vendorLogo ? (
            <div
              className="relative overflow-hidden"
              style={{ width: '48px', height: '52px', borderRadius: '8px' }}
            >
              <Image
                src={vendorLogo}
                alt={vendorName}
                fill
                quality={100}
                unoptimized={true}
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
              {logoInitials}
            </div>
          )}
        </div>

        {/* Vendor name + rating */}
        {vendorRating >= 4.0 && (
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
              {vendorName}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              ★ {vendorRating.toFixed(1)} ({vendorReviewCount})
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

      {/* ── Centered Brand Name or Logo on Cover ── */}
      <div
        className="absolute z-10 flex items-center justify-center pointer-events-none"
        style={{
          left: '50%',
          top: 'calc((70px + (100% - 175px)) / 2)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1">
          {(vendor.business_logo_svg_url || vendor.business_logo_url) ? (
            <div className="relative" style={{ width: '180px', height: '60px' }}>
              <Image 
                src={vendor.business_logo_svg_url || vendor.business_logo_url || ''} 
                alt={vendorName} 
                fill 
                style={{ objectFit: 'contain' }}
                sizes="180px"
              />
            </div>
          ) : (
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
              {vendorName}
            </span>
          )}
        </div>
      </div>

      {/* ── Product Thumbnails — floating at bottom, transparent ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex"
        style={{ gap: '12px', padding: '15px' }}
      >
        {displayProducts.length > 0 ? (
          displayProducts.map((product, i) => {
            const thumbImage = getProductImage(product);
            const thumbName = getProductName(product);
            return (
              <Link
                key={product._id + '-' + i}
                href={`/products/${product._id}`}
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
                {thumbImage ? (
                  <Image
                    src={thumbImage}
                    alt={thumbName}
                    fill
                    className="object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                    sizes="100px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E8E0D8]" />
                )}
              </Link>
            );
          })
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

  // ─── Always render without promo wrapper (backend doesn't support vendor promos yet) ──
  return (
    <div 
      className="flex-shrink-0 w-[calc(100vw-56px)] max-w-[380px] h-[420px] lg:w-[360px] lg:max-w-none lg:h-[500px]"
      style={{ minWidth: '300px' }}
    >
      {innerCard}
    </div>
  );
};
