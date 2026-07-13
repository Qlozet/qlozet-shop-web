'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { type Vendor } from '@/data/vendors';
import { type Product } from '@/data/products';

interface VendorDealCardProps {
  vendor: Vendor;
  products: Product[];
}

function darkenHex(hex: string, amount: number = 0.65): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export const VendorDealCard: React.FC<VendorDealCardProps> = ({
  vendor,
  products,
}) => {
  const coverImage =
    vendor.heroImage ||
    products[0]?.gallery?.[0] ||
    products[0]?.image ||
    '/image/bespoke-agbada-orange.webp';

  const themeColor = vendor.themeColor || '#8D7F72';
  const tcClean = themeColor.replace('#', '');
  const brightness =
    (parseInt(tcClean.substring(0, 2), 16) * 299 +
      parseInt(tcClean.substring(2, 4), 16) * 587 +
      parseInt(tcClean.substring(4, 6), 16) * 114) /
    1000;
  const isLight = brightness > 180;
  const darkBg = isLight ? darkenHex(themeColor, 0.05) : darkenHex(themeColor, 0.70);

  const formatCount = (n: number): string => {
    if (n >= 1000) {
      const k = n / 1000;
      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return String(n);
  };

  return (
    <Link
      href={`/vendor/${vendor.id}`}
      className="flex-shrink-0 flex flex-col overflow-hidden group snap-start"
      style={{
        width: '340px',
        borderRadius: '20px',
        textDecoration: 'none',
      }}
    >
      {/* ─── Top: Cover Image + Brand Name ─── */}
      <div
        className="relative overflow-hidden"
        style={{ width: '100%', aspectRatio: '5 / 3' }}
      >
        <Image
          src={coverImage}
          alt={vendor.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="280px"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        />

        {/* Centered Brand Name */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ padding: '0 16px' }}
        >
          <div className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1">
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                fontFamily: 'var(--font-display)',
                textAlign: 'center',
                lineHeight: 1.1,
                maxWidth: '100%',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {vendor.name}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Solid info bar ─── */}
      <div
        className="flex flex-col"
        style={{
          padding: '12px 16px 14px',
          gap: '3px',
          backgroundColor: darkBg,
        }}
      >
        {/* Discount Badge */}
        {vendor.promo && (
          <div>
            <span
              style={{
                display: 'inline-block',
                background: vendor.promotions?.[0]?.color || themeColor,
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                lineHeight: '14px',
                whiteSpace: 'nowrap',
              }}
            >
              {vendor.promo.label}
            </span>
          </div>
        )}

        {/* Vendor Name */}
        <span
          className="transition-transform duration-500 ease-out group-hover:translate-x-1"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            color: isLight ? '#1A1A1A' : '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
            display: 'block',
          }}
        >
          {vendor.name}
        </span>

        {/* Rating */}
        <div className="flex items-center" style={{ gap: '3px' }}>
          <Star size={10} color={isLight ? '#1A1A1A' : '#FFFFFF'} fill={isLight ? '#1A1A1A' : '#FFFFFF'} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
              lineHeight: 1,
            }}
          >
            {vendor.rating} ({formatCount(vendor.reviewCount)})
          </span>
        </div>
      </div>
    </Link>
  );
};
