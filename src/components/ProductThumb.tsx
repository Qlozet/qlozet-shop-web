import React from 'react';
import Image from 'next/image';
import type { StockState } from '@/lib/api-types';
import { StockBadge, soldOutImageStyle } from '@/components/StockBadge';

// ─── ProductThumb ─────────────────────────────────────────────
// The shared image block for every product surface (listing card, carousels,
// vendor grid, showcase). It owns the pieces that were duplicated across ~6
// hand-rolled cards: the image, the empty-image fallback, the sold-out dim, and
// the Sold out / Low stock + Customizable badges. Surfaces keep their own outer
// wrapper (sizing, title, price, link) and pass overlays (e.g. a favorite
// button) as children.

const EMPTY_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNCOCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

export function CustomizableBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#2D2D2D',
        fontSize: '9px',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '5px 12px',
        borderRadius: '6px',
        lineHeight: 1,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        zIndex: 2,
      }}
    >
      Customizable
    </div>
  );
}

interface ProductThumbProps {
  imageUrl?: string;
  alt: string;
  /** CSS aspect-ratio, e.g. '214/264' or '3 / 4'. Default 214/264. */
  aspectRatio?: string;
  /** Classes for the image container (rounding, etc.). */
  containerClassName?: string;
  /** Background behind the image (while loading / letterboxing). */
  bg?: string;
  /** Extra classes on the <Image>. Defaults to a hover-zoom. */
  imageClassName?: string;
  stockState?: StockState;
  customizable?: boolean;
  badgeSize?: 'sm' | 'md';
  sizes?: string;
  /** Overlays rendered on top (favorite button, etc.). */
  children?: React.ReactNode;
}

export const ProductThumb: React.FC<ProductThumbProps> = ({
  imageUrl,
  alt,
  aspectRatio = '214/264',
  containerClassName = 'rounded-[14px] lg:rounded-[20px]',
  bg = '#F5F3F0',
  imageClassName = 'object-cover transition-transform duration-700 group-hover:scale-105',
  stockState,
  customizable = false,
  badgeSize = 'md',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  children,
}) => {
  const soldOut = stockState === 'out_of_stock';
  return (
    <div
      className={`relative w-full overflow-hidden ${containerClassName}`}
      style={{ aspectRatio, background: bg }}
    >
      <Image
        src={imageUrl || EMPTY_IMG}
        alt={alt}
        fill
        className={imageClassName}
        sizes={sizes}
        style={soldOut ? soldOutImageStyle : undefined}
      />
      <StockBadge state={stockState} size={badgeSize} />
      {customizable && <CustomizableBadge />}
      {children}
    </div>
  );
};
