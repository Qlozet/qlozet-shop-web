'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TokenIcon } from '../icons/TokenIcon';
import { type SectionTab } from '@/data/studio-options';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { AccessoriesPanel } from './AccessoriesPanel';
import { AddonsPanel } from './AddonsPanel';

// ═══════════════════════════════════════════════════════════════
//  ProductCustomizePanel
//  Wide slide-in panel for CUSTOMIZABLE products.
//  Desktop: fixed side panel from right (~55% viewport, portalled)
//  Mobile: bottom sheet with backdrop
//  Follows the same UX pattern as SizeGuideModal.
// ═══════════════════════════════════════════════════════════════

import { type ApiProduct } from '@/lib/api-types';

interface ProductCustomizePanelProps {
  isOpen: boolean;
  customization: CustomizationState;
  onClose: () => void;
  product?: ApiProduct;
}

export const ProductCustomizePanel: React.FC<ProductCustomizePanelProps> = ({
  isOpen,
  customization,
  onClose,
  product,
}) => {
  const { user } = useApp();
  const { expandedSection, setExpandedSection } = customization;

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Customize
          </h3>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            Personalize this outfit to your taste
          </p>
        </div>
        <div className="flex items-center" style={{ gap: '10px' }}>
          <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '5px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
            <TokenIcon size={14} color="#D4AF37" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>{customization.tokenBalance.toLocaleString()}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center overflow-x-auto hide-scrollbar shrink-0"
        style={{
          gap: '20px',
          padding: '8px 24px 14px',
          borderBottom: '1px solid #F0F0F0',
          ...(!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : {})
        }}
      >
        {(() => {
          // Build tabs dynamically based on what the product has
          const hasStyles = (product?.clothing?.styles?.length ?? 0) > 0;
          const hasFabrics = (product?.clothing?.fabrics?.length ?? 0) > 0 || (product?.clothing?.color_variants?.length ?? 0) > 0;
          const hasAccessories = (product?.clothing?.accessories?.length ?? 0) > 0;
          const hasAddons = (product?.clothing?.addons?.length ?? 0) > 0;

          const dynamicTabs: SectionTab[] = [];
          // Always show STYLE if the product has styles, or if no product is provided (studio mode)
          if (hasStyles || !product) dynamicTabs.push({ id: 'styles', label: 'STYLE' });
          if (hasFabrics || !product) dynamicTabs.push({ id: 'fabric', label: 'FABRIC' });
          if (hasAccessories || !product) dynamicTabs.push({ id: 'accessories', label: 'ACCESSORIES' });
          dynamicTabs.push({ id: 'fit', label: 'FIT' });
          if (hasAddons || !product) dynamicTabs.push({ id: 'addons', label: 'ADD-ONS' });

          return dynamicTabs.map((tab: SectionTab) => (
            <button
              key={tab.id}
              onClick={() => setExpandedSection(tab.id)}
              className="flex flex-col items-center gap-1 shrink-0 relative transition-all"
              style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: expandedSection === tab.id ? 800 : 500,
                  color: expandedSection === tab.id ? '#1A1A1A' : '#999',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.label}
              </span>
              {expandedSection === tab.id && (
                <div
                  className="absolute -bottom-[14px] w-full h-[2px] rounded-full"
                  style={{ background: '#1A1A1A' }}
                />
              )}
            </button>
          ));
        })()}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{
          paddingBottom: '16px',
          ...(!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : {})
        }}
      >
        {expandedSection === 'addons' ? (
          <AddonsPanel
            selectedAddons={customization.selectedAddons}
            onSelectAddon={customization.selectAddon}
            product={product}
          />
        ) : expandedSection === 'accessories' ? (
          <AccessoriesPanel
            selectedAccessories={customization.selectedAccessories}
            onToggle={customization.toggleAccessory}
            product={product}
          />
        ) : (
          <SectionContent customization={customization} product={product} />
        )}
      </div>

      {/* Footer CTAs */}
      {!user ? (
        <div className="shrink-0 flex flex-col gap-3" style={{ padding: '16px 24px 24px', background: '#FAF6F1', borderTop: '1px solid #F0F0F0' }}>
          <p style={{ fontSize: '11.5px', color: '#8B5A2B', fontWeight: 600, lineHeight: 1.4, margin: 0, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
            ⚠ You must sign in first to customize this product.
          </p>
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center transition-all hover:opacity-90 text-center"
            style={{
              padding: '13px',
              borderRadius: '12px',
              background: '#2C1810',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Sign In to Customize
          </Link>
        </div>
      ) : (
        <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={onClose}
            className="flex-1 transition-colors hover:bg-gray-200"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#F4F4F4',
              color: '#1A1A1A',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center transition-colors hover:opacity-90"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#4C1D95',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              gap: '8px',
            }}
          >
            <span>Apply</span>
            <div className="flex items-center" style={{ gap: '4px', opacity: 0.85 }}>
              <TokenIcon size={14} color="#D4AF37" />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>25</span>
            </div>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet — portalled to body ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 z-[100] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
            style={{ maxHeight: '60vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
            </div>

            {panelContent}
          </div>
        </div>,
        document.body
      )}

      {/* ══════ DESKTOP: Floating card on the right — mirrors SizeGuideModal ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
          style={{ right: '48px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[420px] bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {panelContent}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
