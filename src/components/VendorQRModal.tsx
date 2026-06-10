'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface VendorQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  vendorId: string;
}

export const VendorQRModal: React.FC<VendorQRModalProps> = ({
  isOpen,
  onClose,
  vendorName,
  vendorId,
}) => {
  const vendorUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vendor/${vendorId}`
    : '';

  // Generate QR code using a public API (no dependencies needed)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(vendorUrl)}&margin=12`;

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A' }}>Scan QR Code</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* QR Code */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '16px 24px 32px', gap: '24px' }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: '260px',
            height: '260px',
            borderRadius: '20px',
            border: '2px solid #D4AF37',
            padding: '16px',
            background: '#FAFAFA',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt={`QR code for ${vendorName}`}
            width={220}
            height={220}
            style={{ borderRadius: '8px' }}
          />
        </div>

        <button
          className="w-full transition-all hover:opacity-90"
          style={{
            maxWidth: '260px',
            padding: '14px',
            borderRadius: '14px',
            background: '#F5F5F5',
            color: '#1A1A1A',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Scan or Save QR code
        </button>
      </div>
    </>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-[calc(100%+60px)]'}`}
        style={{ maxHeight: '80vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
        </div>
        {content}
      </div>
    </>,
    document.body
  );
};
