'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { ApiBusinessPublic, ApiProduct } from '@/lib/api-types';
import { getProductImage } from '@/lib/api-types';

interface VendorDealCardProps {
  vendor: ApiBusinessPublic;
  products: ApiProduct[];
  dealLabel?: string;
  dealColor?: string;
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
  dealLabel,
  dealColor,
}) => {
  const vendorName = vendor.business_name;
  const coverImage =
    vendor.cover_image_url ||
    (products[0] ? getProductImage(products[0]) : '') ||
    '/image/bespoke-agbada-orange.webp';

  const themeColor = vendor.theme_color || '#8D7F72';
  const tcClean = themeColor.replace('#', '');
  const brightness =
    (parseInt(tcClean.substring(0, 2), 16) * 299 +
      parseInt(tcClean.substring(2, 4), 16) * 587 +
      parseInt(tcClean.substring(4, 6), 16) * 114) /
    1000;
  const isLight = brightness > 180;
  const darkBg = isLight ? darkenHex(themeColor, 0.05) : darkenHex(themeColor, 0.70);

  const vendorRating = vendor.average_rating ?? 0;
  const vendorReviewCount = vendor.total_ratings ?? 0;

  const formatCount = (n: number): string => {
    if (n >= 1000) {
      const k = n / 1000;
      return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
    }
    return String(n);
  };

  return (
    <Link
      href={`/vendor/${vendor._id}`}
      className="flex-shrink-0 flex flex-col overflow-hidden group snap-start"
      style={{ width: '340px', borderRadius: '20px', textDecoration: 'none' }}
    >
      {/* ─── Top: Cover Image + Brand Name ─── */}
      <div className="relative overflow-hidden" style={{ width: '100%', aspectRatio: '5 / 3' }}>
        <Image
          src={coverImage}
          alt={vendorName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="280px"
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.25)' }} />

        {/* Centered Brand Name or Logo */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ padding: '0 16px' }}>
          <div className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1">
            {(vendor.business_logo_svg_url || vendor.business_logo_url) ? (
              <div className="relative" style={{ width: '120px', height: '40px' }}>
                <Image 
                  src={vendor.business_logo_svg_url || vendor.business_logo_url || ''} 
                  alt={vendorName} 
                  fill 
                  style={{ objectFit: 'contain' }}
                  sizes="120px"
                />
              </div>
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em', textShadow: '0 2px 10px rgba(0,0,0,0.35)', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {vendorName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom: Solid info bar ─── */}
      <div className="flex flex-col" style={{ padding: '12px 16px 14px', gap: '3px', backgroundColor: darkBg }}>
        {/* Deal Badge */}
        {dealLabel && (
          <div>
            <span style={{ display: 'inline-block', background: dealColor || themeColor, color: '#FFFFFF', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', lineHeight: '14px', whiteSpace: 'nowrap' }}>
              {dealLabel}
            </span>
          </div>
        )}

        {/* Vendor Name */}
        <span className="transition-transform duration-500 ease-out group-hover:translate-x-1" style={{ fontSize: '13px', fontWeight: 700, fontFamily: "var(--font-outfit), 'Outfit', sans-serif", color: isLight ? '#1A1A1A' : '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, display: 'block' }}>
          {vendorName}
        </span>

        {/* Rating */}
        <div className="flex items-center" style={{ gap: '3px' }}>
          <Star size={10} color={isLight ? '#1A1A1A' : '#FFFFFF'} fill={isLight ? '#1A1A1A' : '#FFFFFF'} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
            {vendorRating.toFixed(1)} ({formatCount(vendorReviewCount)})
          </span>
        </div>
      </div>
    </Link>
  );
};
