import React from 'react';
import type { StockState } from '@/lib/api-types';

// ─── Shared stock-availability visuals ────────────────────────
// One source of truth for the "Sold out" / "Low stock" treatment so every
// product card (listing, carousels, vendor pages, showcase) stays consistent.

/** Apply to a product image when it's sold out. */
export const soldOutImageStyle: React.CSSProperties = {
  opacity: 0.55,
  filter: 'grayscale(0.4)',
};

export function isSoldOut(state?: StockState): boolean {
  return state === 'out_of_stock';
}

interface StockBadgeProps {
  state?: StockState;
  /** Smaller pill for compact thumbnails. */
  size?: 'sm' | 'md';
}

/** Corner pill: "Sold out" (dark) or "Low stock" (amber). Renders nothing when
 *  the product is in stock. Place inside a `position: relative` container. */
export const StockBadge: React.FC<StockBadgeProps> = ({ state, size = 'md' }) => {
  if (state !== 'out_of_stock' && state !== 'low_stock') return null;
  const soldOut = state === 'out_of_stock';
  return (
    <div
      style={{
        position: 'absolute',
        top: size === 'sm' ? '6px' : '10px',
        left: size === 'sm' ? '6px' : '10px',
        backgroundColor: soldOut ? 'rgba(26,26,26,0.82)' : 'rgba(180,83,9,0.92)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        color: '#FFFFFF',
        fontSize: size === 'sm' ? '8px' : '9px',
        fontWeight: 800,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        padding: size === 'sm' ? '3px 7px' : '5px 10px',
        borderRadius: '6px',
        lineHeight: 1,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        zIndex: 2,
      }}
    >
      {soldOut ? 'Sold out' : 'Low stock'}
    </div>
  );
};
