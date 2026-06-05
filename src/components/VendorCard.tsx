'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Vendor } from '@/data/vendors';
import { type Product } from '@/data/products';

interface VendorCardProps {
  vendor: Vendor;
  products: Product[];
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

  // Get all gallery images from vendor's products for the carousel
  const carouselImages = products.flatMap((p) =>
    p.gallery.map((img) => ({ image: img, productId: p.id }))
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
  const hasPromo = !!vendor.promo;

  // ─── The inner image card (shared by both variants) ─────────────
  const imageCard = (
    <div
      className="relative overflow-hidden flex-shrink-0 group"
      style={{
        width: '100%',
        flex: hasPromo ? 1 : undefined,
        height: hasPromo ? undefined : '100%',
        borderRadius: hasPromo ? '24px' : '24px',
        boxShadow: hasPromo ? undefined : '0 4px 24px rgba(0,0,0,0.14)',
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
              alt={`${vendor.name} product ${idx + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="280px"
            />
          </div>
        ))}
      </Link>

      {/* Gradient Overlay 1: Vertical (top→bottom) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Gradient Overlay 2: Horizontal tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(0,0,0,0.2)',
        }}
      />

      {/* ── Top Section (Header) ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between"
        style={{ padding: '15px 15px 0 15px' }}
      >
        {/* Vendor Logo — left */}
        <Link
          href={`/products?search=${encodeURIComponent(vendor.name)}`}
          className="transition-transform hover:scale-110"
          onClick={(e) => e.stopPropagation()}
        >
          {vendor.logoStyle === 'image' && vendor.logoImage ? (
            <div
              className="relative overflow-hidden"
              style={{
                width: '48px',
                height: '52px',
                borderRadius: '8px',
              }}
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
        </Link>

        {/* Vendor name + rating (inline, between logo and follow) */}
        {vendor.rating >= 4.4 && (
          <div
            className="flex-1 flex flex-col justify-center"
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
              {vendor.rating}★ ({vendor.reviewCount})
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

      {/* ── Carousel Arrows — visible on hover ── */}
      {images.length > 1 && (
        <>
          <button
            onClick={goLeft}
            className="absolute z-10 flex items-center justify-center transition-opacity"
            style={{
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              border: 'none',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <ChevronLeft size={14} color="#1A1A1A" />
          </button>
          <button
            onClick={goRight}
            className="absolute z-10 flex items-center justify-center transition-opacity"
            style={{
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              border: 'none',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <ChevronRight size={14} color="#1A1A1A" />
          </button>
        </>
      )}

      {/* ── Bottom Section — Carousel Indicator Dots ── */}
      {totalDots > 1 && (
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{
            bottom: '20px',
            left: 0,
            right: 0,
            gap: '8px',
          }}
        >
          {Array.from({ length: totalDots }).map((_, idx) => (
            <span
              key={idx}
              className="transition-all"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === activeIdx ? '#FFFFFF' : 'rgba(255,255,255,0.27)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ─── Variant 2: With Discount wrapper ───────────────────────────
  if (hasPromo) {
    return (
      <div
        className="flex-shrink-0 w-[calc(100vw-56px)] h-[420px] lg:w-[360px] lg:h-[500px]"
        style={{
          borderRadius: '24px',
          background: '#514f4f',
          padding: '11px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
        }}
      >
        {/* Discount Banner */}
        <div
          className="flex flex-col items-center"
          style={{
            width: '100%',
            gap: '5px',
            padding: '0 4px',
          }}
        >
          {/* Primary Discount Line */}
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

          {/* Secondary Text */}
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
        {imageCard}
      </div>
    );
  }

  // ─── Variant 1: Without Discount ────────────────────────────────
  return (
    <div className="flex-shrink-0 w-[calc(100vw-56px)] h-[420px] lg:w-[360px] lg:h-[500px]">
      {imageCard}
    </div>
  );
};
