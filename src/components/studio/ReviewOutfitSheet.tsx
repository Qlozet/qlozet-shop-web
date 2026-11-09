'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Check, ShoppingCart, Truck, X } from 'lucide-react';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useApp } from '@/context/AppContext';
import { GARMENT_LABELS, NEED_LABELS, type GarmentKind } from '@/lib/garment-measurements';
import { garmentGap, profileIsUsable, resolveProfile } from '@/lib/usable-measurements';
import type { OutfitSection } from '@/lib/outfit-summary';
import { OutfitBreakdown, useVsPictured, type OutfitSummaryData } from './OutfitSummary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Add the line to the cart (the page's normal add-to-cart). */
  onConfirm: () => void;
  /** Open the Customize panel at a tab to change something. */
  onEdit: (section: OutfitSection) => void;
  title: string;
  vendorName?: string;
  /** The AI preview when there is one, else the product photo. */
  image?: string | null;
  isPreview: boolean;
  size?: string | null;
  summary: OutfitSummaryData;
  measurementSetName: string | null;
  garmentKind: GarmentKind | null;
  /** "19 – 22 Sep" from the page's delivery estimate. */
  deliveryLabel?: string | null;
}

// One look at the whole outfit before it goes in the cart: what was chosen,
// whose measurements it is sewn to, when it should arrive, and the price
// line by line. Made-to-order outfits only.
export function ReviewOutfitSheet({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  title,
  vendorName,
  image,
  isPreview,
  size,
  summary,
  measurementSetName,
  garmentKind,
  deliveryLabel,
}: Props) {
  const { user } = useApp();
  const { profiles, isLoading } = useMeasurements();
  const vs = useVsPictured(summary.totals);
  if (!isOpen || typeof document === 'undefined') return null;

  const profile = resolveProfile(profiles, measurementSetName);
  const usable = profileIsUsable(profile);
  const gap = usable ? garmentGap(profile, garmentKind) : null;
  const measurementsOk = !!user && !isLoading && usable && !gap;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end lg:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-outfit-title"
        className="relative w-full flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          maxHeight: '88vh',
          margin: '12px',
          borderRadius: '24px',
          background: 'var(--bg-base)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
          style={{ top: '14px', right: '14px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer', zIndex: 1 }}
        >
          <X size={14} color="var(--text-secondary)" />
        </button>

        <div className="overflow-y-auto hide-scrollbar flex flex-col" style={{ padding: '22px 22px 16px', gap: '18px' }}>
          {/* The outfit */}
          <div className="flex" style={{ gap: '14px', paddingRight: '36px' }}>
            {image && (
              <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '76px', height: '100px', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isPreview && (
                  <span
                    className="absolute"
                    style={{ left: '6px', bottom: '6px', fontSize: '8px', fontWeight: 800, letterSpacing: '0.06em', color: '#FFFFFF', background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '2px 5px' }}
                  >
                    PREVIEW
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col" style={{ gap: '4px', minWidth: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Review your outfit
              </span>
              <h3 id="review-outfit-title" style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {title}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {[vendorName, size && `Size ${size}`].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>

          {/* Price, line by line */}
          <div style={{ borderRadius: '14px', border: '1px solid var(--border-glass)', padding: '6px 14px 10px' }}>
            <OutfitBreakdown data={summary} onJump={onEdit} />
            {vs && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', textAlign: 'right' }}>{vs}</p>
            )}
          </div>

          {/* Measurements */}
          <button
            type="button"
            onClick={() => onEdit('fit')}
            className="flex items-start text-left transition-opacity hover:opacity-80"
            style={{ gap: '10px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            {measurementsOk ? (
              <Check size={16} color="#2D6A4F" style={{ flexShrink: 0, marginTop: '1px' }} />
            ) : (
              <AlertCircle size={16} color="#B45309" style={{ flexShrink: 0, marginTop: '1px' }} />
            )}
            <span style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {!user
                ? 'You’ll choose whose measurements the tailor uses once you sign in at checkout.'
                : isLoading
                ? 'Checking your measurements…'
                : !profile
                  ? 'No measurements saved yet. Add them so the tailor can sew to your size.'
                  : !usable
                    ? `${profile.name} needs more measurements before the tailor can start.`
                    : gap
                      ? `${profile.name} is missing your ${gap.missing.map((n) => NEED_LABELS[n]).join(', ')}. Add ${gap.missing.length > 1 ? 'them' : 'it'} in Fit.`
                      : `Sewn to ${profile.name}${garmentKind ? `, which has everything this ${GARMENT_LABELS[garmentKind]} needs` : ''}.`}
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '2px' }}>
                {!user ? 'See Fit' : measurementsOk ? 'Change' : 'Fix in Fit'}
              </span>
            </span>
          </button>

          {deliveryLabel && (
            <div className="flex items-start" style={{ gap: '10px' }}>
              <Truck size={16} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                Estimated delivery <b>{deliveryLabel}</b>, including the making time.
              </span>
            </div>
          )}

          {isPreview && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              The tailor works from your choices above. The preview is a guide, not the exact finished piece.
            </p>
          )}
        </div>

        <div className="flex flex-col" style={{ padding: '12px 22px 20px', gap: '8px', borderTop: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ padding: '15px', borderRadius: '14px', border: 'none', background: '#064E3B', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', gap: '8px' }}
          >
            <ShoppingCart size={15} />
            Add to cart
          </button>
          <button
            type="button"
            onClick={() => onEdit('styles')}
            className="w-full transition-opacity hover:opacity-70"
            style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Change something
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
