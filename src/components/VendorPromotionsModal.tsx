'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Promotion display data — decoupled from backend shape */
interface VendorPromotion {
  /** Discount id — used to filter the storefront to this offer's items. */
  id?: string;
  title: string;
  subtitle?: string;
  color: string;
}

/** Sheet chrome colours derived from the vendor's theme (matches the vendor
 *  profile's filter/review sheets). Defaults to a light sheet. */
interface SheetTheme {
  bg: string;
  text: string;
  subtle: string;
  border: string;
  muted: string;
}

const DEFAULT_THEME: SheetTheme = {
  bg: '#FFFFFF',
  text: '#1A1A1A',
  subtle: 'rgba(0,0,0,0.06)',
  border: 'rgba(0,0,0,0.08)',
  muted: 'rgba(0,0,0,0.5)',
};

interface VendorPromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: VendorPromotion[];
  /** Called when a promotion (or "View items") is clicked. */
  onSelectPromotion?: (discountId?: string) => void;
  /** Vendor-theme sheet colours; falls back to a light sheet if omitted. */
  theme?: SheetTheme;
}

export const VendorPromotionsModal: React.FC<VendorPromotionsModalProps> = ({
  isOpen,
  onClose,
  promotions,
  onSelectPromotion,
  theme = DEFAULT_THEME,
}) => {
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: theme.text }}>Promotions</h3>
        <button
          onClick={onClose}
          className="transition-colors rounded-full p-2"
          style={{ background: theme.subtle, color: theme.text }}
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Promo Cards */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {promotions.map((promo, idx) => (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPromotion?.(promo.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPromotion?.(promo.id); }}
              className="relative overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: promo.color,
                color: '#FFF',
                minHeight: '90px',
                cursor: 'pointer',
              }}
            >
              {/* Watermark % */}
              <div
                className="absolute select-none pointer-events-none"
                style={{
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '80px',
                  fontWeight: 900,
                  opacity: 0.15,
                  lineHeight: 1,
                }}
              >
                %
              </div>
              <p style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.4, position: 'relative', zIndex: 1, maxWidth: '80%' }}>
                {promo.title}
              </p>
              <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px', position: 'relative', zIndex: 1 }}>
                {promo.subtitle}
              </p>

              {/* Last card: VIEW ITEMS button */}
              {idx === promotions.length - 1 && promotions.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectPromotion?.(promo.id); }}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    marginTop: '14px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  VIEW ITEMS
                </button>
              )}
            </div>
          ))}

          {promotions.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px', gap: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>No promotions right now</p>
              <p style={{ fontSize: '12px', color: theme.muted }}>Check back later for deals!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-[calc(100%+60px)]'}`}
        style={{ maxHeight: '80vh', background: theme.bg, border: `1px solid ${theme.border}`, boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: theme.border }} />
        </div>
        {content}
      </div>
    </>,
    document.body
  );
};
