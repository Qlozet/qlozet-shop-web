'use client';

import React, { useRef, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { CustomizableBadge } from '@/components/ProductThumb';
import { productHref } from '@/lib/product-link';
import { getPriceUnit, getProductImage, getProductName, getProductPrice, getProductTag } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';

/**
 * The colours a ReasonPanel comes in, one per reason (the same as the app):
 * graphite for picks, slate for fit, sage for the sale, tan for new, wine
 * for trending.
 */
export const REASON_COLORS = {
  graphite: '#4A4A4A',
  slate: '#55607A',
  sage: '#5E9474',
  tan: '#8E7B57',
  wine: '#7F4F4F',
  teal: '#4F7472',
} as const;

interface PanelBoxProps {
  title: string;
  subtitle?: string;
  /** Leave out for a plain box: the shopper's own things. */
  color?: string;
  /** Where VIEW ALL goes. */
  href?: string;
  /** Cards for the sideways row. */
  children?: ReactNode;
  /** In place of the row (an empty state, say). */
  body?: ReactNode;
  /** How many cards, to know whether arrows help. */
  count?: number;
}

/**
 * The box every For You row sits in: title, why it is here, a sideways row
 * (arrows with a mouse) and VIEW ALL. Coloured for what Qlozet picked for the
 * shopper, plain for their own things, as in the app.
 */
export function PanelBox({ title, subtitle, color, href, children, body, count = 0 }: PanelBoxProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const plain = !color;
  const ink = plain ? 'var(--text-primary)' : '#FFFFFF';
  const soft = plain ? 'var(--text-muted)' : 'rgba(255,255,255,0.72)';
  const scrollBy = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{
        background: plain ? 'var(--bg-surface-elevated)' : color,
        border: plain ? '1px solid var(--border-glass)' : 'none',
        borderRadius: '24px',
        minWidth: 0,
        flex: 1,
      }}
    >
      <div className="flex items-start justify-between" style={{ padding: '20px 20px 0', gap: '12px' }}>
        <div className="flex flex-col" style={{ gap: '4px', minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              fontSize: '15px',
              fontWeight: 800,
              color: ink,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <span className="truncate" style={{ fontSize: '12px', color: soft }}>
              {subtitle}
            </span>
          )}
        </div>
        {/* Arrows for a mouse; a phone swipes. */}
        {!body && count > 2 && (
          <div className="hidden lg:flex flex-shrink-0" style={{ gap: '8px' }}>
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollBy(dir)}
                aria-label={dir < 0 ? 'Scroll back' : 'Scroll on'}
                className={`flex items-center justify-center transition-colors ${plain ? 'hover:opacity-70' : 'hover:bg-white/25'}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: plain ? '1px solid var(--border-glass)' : '1px solid rgba(255,255,255,0.25)',
                  background: plain ? 'var(--bg-surface)' : 'rgba(255,255,255,0.12)',
                  color: ink,
                  cursor: 'pointer',
                }}
              >
                {dir < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {body ? (
        <div style={{ padding: '16px 20px 0' }}>{body}</div>
      ) : (
        <div
          ref={rowRef}
          className="flex overflow-x-auto hide-scrollbar snap-x"
          style={{ gap: '12px', padding: '16px 20px 0', scrollPaddingLeft: '20px' }}
        >
          {children}
        </div>
      )}

      {/* Beside a taller box, VIEW ALL keeps to the bottom. */}
      <div style={{ flex: 1 }} />
      {href ? (
        <Link
          href={href}
          className="flex items-center justify-between group/all"
          style={{ padding: '14px 20px 18px', textDecoration: 'none' }}
        >
          <span
            style={{
              fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              fontSize: '22px',
              fontWeight: 900,
              color: ink,
              letterSpacing: '0.01em',
            }}
          >
            VIEW ALL
          </span>
          <ArrowRight size={26} color={ink} className="transition-transform group-hover/all:translate-x-1" />
        </Link>
      ) : (
        <div style={{ height: '20px' }} />
      )}
    </section>
  );
}

interface ReasonPanelProps {
  title: string;
  subtitle?: string;
  /** Leave out for a plain box. */
  color?: string;
  products: ApiProduct[];
  /** Where VIEW ALL goes. */
  href?: string;
  /** A short line for a card's corner ("Your size M"), in place of CUSTOMIZABLE. */
  note?: (product: ApiProduct) => string | undefined;
}

/**
 * A coloured panel that says why its products are here, a row of photo cards
 * (swipe on a phone, arrows with a mouse) and VIEW ALL. The For You page is
 * built from these, as in the app.
 */
export function ReasonPanel({ title, subtitle, color, products, href, note }: ReasonPanelProps) {
  return (
    <PanelBox title={title} subtitle={subtitle} color={color} href={href} count={products.length}>
      {products.map((p) => (
        <PanelCard key={p._id} product={p} note={note?.(p)} />
      ))}
    </PanelBox>
  );
}

/** A photo card on a panel: price on dark glass, heart, CUSTOMIZABLE or the note. */
function PanelCard({ product, note }: { product: ApiProduct; note?: string }) {
  const { wishlist, toggleWishlist } = useApp();
  const { fmt } = useCurrency();
  const trackEvent = useTrackEvent();
  const saved = wishlist.includes(product._id);
  const name = getProductName(product);
  const price = getProductPrice(product);
  const unit = getPriceUnit(product) ?? '';
  const image = getProductImage(product);

  return (
    <Link
      href={productHref(product)}
      onClick={() =>
        trackEvent({
          eventType: 'click_item',
          properties: { itemId: product._id, price },
          context: { surface: 'for_you_panel' },
        })
      }
      aria-label={`${name}, ${fmt(price)}${unit}`}
      className="group relative flex-shrink-0 snap-start overflow-hidden w-[160px] h-[216px] lg:w-[190px] lg:h-[256px]"
      style={{ borderRadius: '16px', background: '#F5F5F5', textDecoration: 'none' }}
    >
      {image && (
        <Image
          src={image}
          alt={name}
          fill
          sizes="190px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <span
        className="absolute"
        style={{
          top: '8px',
          left: '8px',
          padding: '3px 7px',
          borderRadius: '6px',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 800,
          zIndex: 2,
        }}
      >
        {fmt(price)}
        {unit}
      </span>
      <button
        type="button"
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product._id);
          if (saved) toast('Removed from wishlist');
          else toast.success('Saved to wishlist', { description: name });
        }}
        className="absolute flex items-center justify-center transition-transform hover:scale-110"
        style={{
          top: '6px',
          right: '6px',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'rgba(18,17,17,0.51)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <Heart size={15} color="#FFFFFF" fill={saved ? '#FFFFFF' : 'none'} />
      </button>
      {note ? (
        <span
          className="absolute"
          style={{
            bottom: '8px',
            left: '8px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.9)',
            color: '#2D2D2D',
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            zIndex: 2,
          }}
        >
          {note}
        </span>
      ) : (
        getProductTag(product) === 'CUSTOMIZABLE' && <CustomizableBadge />
      )}
    </Link>
  );
}

/** A panel's shape while its products load. */
export function ReasonPanelSkeleton({ color }: { color: string }) {
  return (
    <div className="animate-pulse flex flex-col" style={{ background: color, borderRadius: '24px', padding: '20px', gap: '16px' }}>
      <div style={{ width: '180px', height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.18)' }} />
      <div className="flex overflow-hidden" style={{ gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[160px] h-[216px] lg:w-[190px] lg:h-[256px]"
            style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.14)' }}
          />
        ))}
      </div>
      <div style={{ width: '110px', height: '20px', borderRadius: '6px', background: 'rgba(255,255,255,0.18)' }} />
    </div>
  );
}
