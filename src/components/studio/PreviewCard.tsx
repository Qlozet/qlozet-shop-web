'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '@/context/CurrencyContext';

// ─── Types ──────────────────────────────────────────────────
export interface PreviewInfo {
  label: string;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  extraCost?: number;
}

// ─── Interaction hook: hover on desktop, long-press on mobile ──
export function useLongPress(delay = 500) {
  const [showPreview, setShowPreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const isTouching = useRef(false);

  // ── Desktop: hover ──
  const handleMouseEnter = () => {
    if (isTouching.current) return; // ignore hover on touch devices
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    if (isTouching.current) return;
    setShowPreview(false);
  };

  // ── Mobile: long-press ──
  const handleTouchStart = () => {
    isTouching.current = true;
    didLongPress.current = false;
    timer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowPreview(true);
    }, delay);
  };

  const handleTouchEnd = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setShowPreview(false);
    // Reset touch flag after a short delay so subsequent mouse events work on hybrid devices
    setTimeout(() => { isTouching.current = false; }, 300);
  };

  const wasLongPress = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return true;
    }
    return false;
  };

  const handlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };

  return { showPreview, handlers, wasLongPress };
}

// ─── Preview Card (Portal) ──────────────────────────────────
export function PreviewCard({
  info,
  anchorRef,
}: {
  info: PreviewInfo;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const { fmt: fmtMoney } = useCurrency();
  const [layout, setLayout] = useState<{ x: number; y: number; direction: 'above' | 'below' } | null>(null);
  const CARD_W = 220;
  const CARD_H_EST = 280;
  const GAP = 8;

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    const spaceAbove = rect.top;
    const direction = spaceAbove > CARD_H_EST + GAP ? 'above' : 'below';

    let x = rect.left + rect.width / 2 - CARD_W / 2;
    x = Math.max(8, Math.min(x, vw - CARD_W - 8));

    const y = direction === 'above'
      ? rect.top + window.scrollY - GAP
      : rect.bottom + window.scrollY + GAP;

    setLayout({ x, y, direction });
  }, [anchorRef]);

  if (!layout) return null;

  const isAbove = layout.direction === 'above';

  return createPortal(
    <div
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${CARD_W}px`,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: isAbove
          ? `translate(${layout.x}px, ${layout.y}px) translateY(-100%)`
          : `translate(${layout.x}px, ${layout.y}px)`,
        borderRadius: '16px',
        background: 'var(--bg-surface-elevated)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      {info.imageUrl && (
        <div style={{ width: '100%', height: '160px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.imageUrl}
            alt={info.label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {info.label}
        </p>
        {info.description && (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
            {info.description}
          </p>
        )}
        {info.tags && info.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {info.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--border-glass)',
                  borderRadius: '6px',
                  padding: '2px 7px',
                  textTransform: 'capitalize',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {info.extraCost !== undefined && (
          <p style={{ fontSize: '11px', fontWeight: 700, color: info.extraCost > 0 ? 'var(--brand-fill)' : '#059669' }}>
            {info.extraCost > 0 ? `+${fmtMoney(info.extraCost)}` : '✓ Included'}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div style={{
        position: 'absolute',
        ...(isAbove ? { bottom: '-6px' } : { top: '-6px' }),
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: '12px',
        height: '12px',
        background: isAbove ? 'var(--bg-surface-elevated)' : (info.imageUrl ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)'),
        boxShadow: isAbove
          ? '2px 2px 4px rgba(0,0,0,0.06)'
          : '-2px -2px 4px rgba(0,0,0,0.06)',
      }} />
    </div>,
    document.body,
  );
}
