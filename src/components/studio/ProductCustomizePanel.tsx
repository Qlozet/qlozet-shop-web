'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PRODUCT_TABS, type SectionTab } from '@/data/studio-options';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { AccessoriesPanel } from './AccessoriesPanel';

// ═══════════════════════════════════════════════════════════════
//  ProductCustomizePanel
//  Wide slide-in panel for CUSTOMIZABLE products.
//  Desktop: fixed side panel from right (~55% viewport, portalled)
//  Mobile: bottom sheet with backdrop
//  Follows the same UX pattern as SizeGuideModal.
// ═══════════════════════════════════════════════════════════════

interface ProductCustomizePanelProps {
  isOpen: boolean;
  customization: CustomizationState;
  onClose: () => void;
}

export const ProductCustomizePanel: React.FC<ProductCustomizePanelProps> = ({
  isOpen,
  customization,
  onClose,
}) => {
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
            <span style={{ fontSize: '13px' }}>🪙</span>
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
        style={{ gap: '20px', padding: '8px 24px 14px', borderBottom: '1px solid #F0F0F0' }}
      >
        {PRODUCT_TABS.map((tab: SectionTab) => (
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
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingBottom: '16px' }}>
        {expandedSection === 'addons' ? (
          <AccessoriesPanel
            selectedAccessories={customization.selectedAccessories}
            onToggle={customization.toggleAccessory}
          />
        ) : (
          <SectionContent customization={customization} />
        )}
      </div>

      {/* Footer CTAs */}
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
            background: '#7C3AED',
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
            <span style={{ fontSize: '13px' }}>🪙</span>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>25</span>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet ══════ */}
      <div className="lg:hidden">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <div
          className={`fixed left-3 right-3 bottom-3 z-[70] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
          style={{ maxHeight: '60vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
          </div>

          {panelContent}
        </div>
      </div>

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
