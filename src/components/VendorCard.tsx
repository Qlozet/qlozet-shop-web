'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ApiBusinessPublic, ApiProduct } from '@/lib/api-types';
import { getProductImage, getProductImages } from '@/lib/api-types';

interface VendorCardProps {
  vendor: ApiBusinessPublic;
  products: ApiProduct[];
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  products,
  isFollowing,
  onToggleFollow,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const vendorName = vendor.business_name;
  const vendorLogo = vendor.business_logo_url;
  const vendorRating = vendor.average_rating ?? 0;
  const vendorReviewCount = vendor.total_ratings ?? 0;
  const logoInitials = vendorName.slice(0, 2).toUpperCase();

  // Get all images from vendor's products for the carousel
  const carouselImages = products.flatMap((p) =>
    getProductImages(p).map((img) => ({ image: img, productId: p._id }))
  );
  const images = carouselImages.slice(0, 5);
  const totalDots = Math.min(images.length, 5);

  // Auto-scroll on hover
  useEffect(() => {
    if (isHovered && images.length > 1) {
      hoverTimerRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % images.length);
      }, 1800);
    }
    return () => {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
    };
  }, [isHovered, images.length]);

  const goLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFollow();
  };

  if (images.length === 0) return null;

  const currentImage = images[activeIdx];

  // ─── The inner image card ─────────────────────────────────────
  const imageCard = (
    <div
      className="relative overflow-hidden flex-shrink-0 group"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setActiveIdx(0); }}
    >
      {/* Product Image Carousel — full bleed */}
      <Link href={`/products/${currentImage.productId}`} className="absolute inset-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: idx === activeIdx ? 1 : 0 }}
          >
            <Image
              src={img.image}
              alt={`${vendorName} product ${idx + 1}`}
              fill
              quality={90}
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ))}
      </Link>

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.2)' }} />

      {/* ── Top Section (Header) ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between" style={{ padding: '15px 15px 0 15px' }}>
        {/* Vendor Logo — left */}
        <Link href={`/vendor/${vendor._id}`} className="transition-transform hover:scale-110" onClick={(e) => e.stopPropagation()}>
          {vendorLogo ? (
            <div className="relative overflow-hidden" style={{ width: '48px', height: '52px', borderRadius: '8px' }}>
              <Image src={vendorLogo} alt={vendorName} fill quality={90} style={{ objectFit: 'cover' }} sizes="96px" />
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ width: '48px', height: '52px', color: '#FFFFFF', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.02em', lineHeight: 1 }}>
              {logoInitials}
            </div>
          )}
        </Link>

        {/* Vendor name + rating */}
        {vendorRating >= 4.4 && (
          <div className="flex-1 flex flex-col justify-center" style={{ padding: '0 8px', minWidth: 0 }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              {vendorName}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              {vendorRating.toFixed(1)}★ ({vendorReviewCount})
            </span>
          </div>
        )}

        {/* Follow / Following Button — right */}
        <button
          onClick={handleFollowClick}
          className="transition-all hover:opacity-90 flex-shrink-0"
          style={{
            padding: '10px 16px', borderRadius: '8px',
            background: isFollowing ? '#111' : 'rgba(255,253,253,0.74)',
            color: isFollowing ? '#FFFFFF' : '#111',
            border: 'none', fontSize: '10px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '1px',
            cursor: 'pointer', fontFamily: 'var(--font-display)', backdropFilter: 'blur(8px)',
          }}
        >
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </button>
      </div>

      {/* ── Carousel Arrows — visible on hover ── */}
      {images.length > 1 && (
        <>
          <button onClick={goLeft} className="absolute z-10 flex items-center justify-center transition-opacity" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', opacity: isHovered ? 1 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <ChevronLeft size={14} color="#1A1A1A" />
          </button>
          <button onClick={goRight} className="absolute z-10 flex items-center justify-center transition-opacity" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', opacity: isHovered ? 1 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <ChevronRight size={14} color="#1A1A1A" />
          </button>
        </>
      )}

      {/* ── Bottom Section — Carousel Indicator Dots ── */}
      {totalDots > 1 && (
        <div className="absolute z-10 flex items-center justify-center" style={{ bottom: '20px', left: 0, right: 0, gap: '8px' }}>
          {Array.from({ length: totalDots }).map((_, idx) => (
            <span key={idx} className="transition-all" style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === activeIdx ? '#FFFFFF' : 'rgba(255,255,255,0.27)' }} />
          ))}
        </div>
      )}
    </div>
  );

  // ─── Always render without promo wrapper ────────────────────────
  return (
    <div className="flex-shrink-0 w-[calc(100vw-56px)] max-w-[380px] h-[420px] lg:w-[360px] lg:max-w-none lg:h-[500px]">
      {imageCard}
    </div>
  );
};
