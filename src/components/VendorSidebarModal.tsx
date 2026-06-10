'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Vendor } from '@/data/vendors';
import { 
  X, Share, ChevronRight, Info, DollarSign, Calendar,
  Camera as Instagram, PlayCircle as Youtube, Link as LinkIcon, Mail, AlertCircle
} from 'lucide-react';

interface VendorSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
  onShowReviews?: () => void;
  isLightTheme?: boolean;
}

export function VendorSidebarModal({ isOpen, onClose, vendor, onShowReviews, isLightTheme = false }: VendorSidebarModalProps) {
  // Darken the theme color to match the page's luxury dark aesthetic
  const hex = (vendor.themeColor || '#918171').replace('#', '');
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * 0.35);
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * 0.35);
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * 0.35);
  const sidebarBg = isLightTheme ? '#FFFFFF' : `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  const sText = isLightTheme ? '#1a1a1a' : '#ffffff';
  const sSubtle = isLightTheme ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
  const sMuted = isLightTheme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
  const sBorder = isLightTheme ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

  // Shared content
  const panelContent = (
    <>
      {/* Header Actions */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 8px' }}>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center transition-colors" style={{ borderRadius: '9999px', backgroundColor: sSubtle, color: sText }}>
          <X size={20} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center transition-colors" style={{ borderRadius: '9999px', backgroundColor: sSubtle, color: sText }}>
          <Share size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Vendor Info Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {vendor.logoStyle === 'image' && vendor.logoImage ? (
                <Image src={vendor.logoImage} alt={vendor.name} width={56} height={56} className="object-cover" />
              ) : (
                <span className="text-xl font-bold text-black">{vendor.logoInitials}</span>
              )}
            </div>
            <div>
              <h2 style={{ color: sText, fontSize: '24px', fontWeight: 700 }}>{vendor.name}</h2>
              <p style={{ color: sMuted, fontSize: '14px' }}>{vendor.rating} ★ ({vendor.reviewCount} Reviews)</p>
            </div>
          </div>

          {/* Links Block */}
          <div style={{ backgroundColor: sSubtle, borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="flex items-center w-full text-left group" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center overflow-hidden bg-white" style={{ width: '32px', height: '32px', borderRadius: '9999px' }}>
                <Image src={vendor.heroImage} alt="Shop all" width={32} height={32} className="object-cover" />
              </div>
              <span style={{ color: sText, fontWeight: 700 }}>Shop all</span>
            </button>
            {vendor.collections.slice(0, 3).map((col, idx) => (
              <button key={idx} className="flex items-center gap-3 w-full text-left group">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs" style={{ backgroundColor: sSubtle, color: sText }}>
                  {col[0]}
                </div>
                <span style={{ color: sText, fontWeight: 700 }}>{col}</span>
              </button>
            ))}
          </div>

          {/* Reviews Block */}
          <div style={{ backgroundColor: sSubtle, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex items-center justify-between">
              <h3 style={{ color: sText, fontSize: '20px', fontWeight: 700 }}>Reviews</h3>
              <button onClick={onShowReviews} className="flex items-center justify-center transition-colors" style={{ width: '32px', height: '32px', borderRadius: '9999px', backgroundColor: sSubtle, color: sText }}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div>
              <div className="flex items-baseline gap-2" style={{ color: sText, fontSize: '30px', fontWeight: 700 }}>
                {vendor.rating}
                <div className="flex text-[10px]">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span style={{ color: sMuted }}>★</span>
                </div>
              </div>
              <p style={{ color: sMuted, fontSize: '12px' }}>{vendor.reviewCount} ratings</p>
            </div>

            {/* Mock Review */}
            <div style={{ backgroundColor: sSubtle, borderRadius: '16px', padding: '16px' }}>
              <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px', fontSize: '10px', color: sText }}>
                <div className="bg-gray-200" style={{ width: '24px', height: '24px', borderRadius: '6px' }}></div>
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p style={{ color: sMuted, fontSize: '12px', lineHeight: 1.6, marginBottom: '12px' }}>
                Nice and heavy, well made material. I bought a size bigger in the zippy and shorts and they fit so comfortably.
              </p>
              <div className="flex items-center justify-between text-[10px]" style={{ color: sMuted }}>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center text-[8px] text-white">K</div>
                  <span>Kerry • Today</span>
                </div>
                <button className="flex items-center gap-1" style={{ color: sMuted }}>
                  <span>Helpful</span>
                </button>
              </div>
            </div>
          </div>

          {/* Policies Block */}
          <div style={{ backgroundColor: sSubtle, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: sText, fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button className="w-full flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>Privacy policy</span>
                <Info size={16} />
              </button>
              <button className="w-full flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>Refund policy</span>
                <DollarSign size={16} />
              </button>
              <button className="w-full flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>Shipping policy</span>
                <Calendar size={16} />
              </button>
            </div>
          </div>

          {/* Contact Block */}
          <div style={{ backgroundColor: sSubtle, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: sText, fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="#" className="flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>Instagram</span>
                <Instagram size={16} />
              </a>
              <a href="#" className="flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>Pinterest</span>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ border: `1px solid ${sText}` }}>P</div>
              </a>
              <a href="#" className="flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>YouTube</span>
                <Youtube size={16} />
              </a>
              <a href="#" className="flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>{vendor.socialLinks?.website || 'website.com'}</span>
                <LinkIcon size={16} />
              </a>
              <a href="#" className="flex items-center justify-between text-sm" style={{ color: sText }}>
                <span>{vendor.socialLinks?.email || 'help@vendor.com'}</span>
                <Mail size={16} />
              </a>
              <div className="text-sm pr-6 mt-4" style={{ color: sText }}>
                {vendor.socialLinks?.address || 'Lagos, Nigeria'}
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <button className="w-full flex items-center justify-between text-sm font-bold transition-colors" style={{ backgroundColor: sSubtle, borderRadius: '9999px', padding: '16px 20px', color: sText }}>
            <span>Visit online store</span>
            <LinkIcon size={16} />
          </button>
          
          <button className="w-full flex items-center justify-between text-sm font-bold transition-colors" style={{ backgroundColor: sSubtle, borderRadius: '9999px', padding: '16px 20px', color: sText }}>
            <span>Report store</span>
            <AlertCircle size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet — same pattern as ProductCustomizePanel ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 z-[100] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
            style={{ maxHeight: '75vh', backgroundColor: sidebarBg, boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: isLightTheme ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)' }} />
            </div>

            {panelContent}
          </div>
        </div>,
        document.body
      )}

      {/* ══════ DESKTOP: Floating sidebar — same pattern as ProductCustomizePanel ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}
          style={{ left: '120px', top: '48px', bottom: '48px' }}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[-1] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          />

          <aside
            className={`h-full w-[400px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ backgroundColor: sidebarBg }}
          >
            {panelContent}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
