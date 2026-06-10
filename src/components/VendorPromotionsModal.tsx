'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { type VendorPromotion } from '@/data/vendors';

interface VendorPromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: VendorPromotion[];
}

export const VendorPromotionsModal: React.FC<VendorPromotionsModalProps> = ({
  isOpen,
  onClose,
  promotions,
}) => {
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#1A1A1A' }}>Promotions</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
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
              className="relative overflow-hidden"
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: promo.color,
                color: '#FFF',
                minHeight: '90px',
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
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#999' }}>No promotions right now</p>
              <p style={{ fontSize: '12px', color: '#BBB' }}>Check back later for deals!</p>
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
        className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-[calc(100%+60px)]'}`}
        style={{ maxHeight: '80vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
        </div>
        {content}
      </div>
    </>,
    document.body
  );
};
