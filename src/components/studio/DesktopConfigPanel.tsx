'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { GenerateButton } from './GenerateButton';

interface DesktopConfigPanelProps {
  customization: CustomizationState;
}

export const DesktopConfigPanel: React.FC<DesktopConfigPanelProps> = ({ customization }) => {
  const { expandedSection, tokenBalance, isGenerating, handleGenerate } = customization;

  const sectionLabel: Record<string, string> = {
    styles: 'Styles',
    fabric: 'Fabric',
    accessories: 'Accessories',
    fit: 'Fit',
    reference: 'Reference',
  };

  return (
    <div
      className="absolute z-20 hidden lg:flex flex-col"
      style={{ right: '24px', top: '90px', bottom: '24px', width: '380px', gap: '16px' }}
    >
      <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden border border-gray-100 rounded-[24px]">
        {/* Context Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 20px 8px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {sectionLabel[expandedSection] || ''}
          </span>
          <div className="flex items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px' }}>🪙</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37' }}>{tokenBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0' }}>
          <SectionContent customization={customization} />
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="flex-shrink-0 flex flex-col w-full" style={{ gap: '10px' }}>
        <GenerateButton isGenerating={isGenerating} onGenerate={handleGenerate} />

        {/* Order Now */}
        <button
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: '#065F46',
            color: '#FFF',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            border: 'none',
            cursor: 'pointer',
            gap: '8px',
          }}
        >
          <ShoppingCart size={16} />
          <span>Order Now</span>
        </button>
      </div>
    </div>
  );
};
