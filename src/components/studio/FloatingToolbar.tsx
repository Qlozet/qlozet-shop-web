'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Palette, ImageIcon, Ruler } from 'lucide-react';
import { SILHOUETTES, NECKLINES, SLEEVES, ACCESSORIES } from '@/data/studio-options';
import { ToolbarTooltip } from './ToolbarTooltip';
import { type CustomizationState } from '@/hooks/useCustomization';

interface FloatingToolbarProps {
  customization: CustomizationState;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ customization }) => {
  const {
    selectedSilhouette, selectedNeckline, selectedSleeve,
    selectedAccessories, selectedColor, referenceImages,
    expandedSection, setExpandedSection,
  } = customization;

  return (
    <div className="absolute top-[90px] bottom-6 z-20 hidden lg:flex items-start" style={{ right: '420px' }}>
      <div className="flex flex-col gap-4 mt-4 px-4 lg:px-6 overflow-visible items-center" style={{ paddingBottom: '20px' }}>

        {/* 1. Styles Capsule */}
        <div className="group relative flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100" style={{ gap: '8px', padding: '12px' }}>
          <ToolbarTooltip label="Style" />
          {[selectedSilhouette, selectedNeckline, selectedSleeve].filter(Boolean).map((styleId, idx) => (
            <button
              key={`style-${idx}`}
              onClick={() => setExpandedSection('styles')}
              className={`flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden ${expandedSection === 'styles' ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
              style={{
                width: '48px', height: '48px', borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative',
              }}
              title="Styles"
            >
              <span style={{ fontSize: '28px' }}>
                {SILHOUETTES.find(s => s.id === styleId)?.emoji || NECKLINES.find(n => n.id === styleId)?.emoji || SLEEVES.find(sl => sl.id === styleId)?.emoji || '👗'}
              </span>
            </button>
          ))}
          <button
            onClick={() => setExpandedSection('styles')}
            className="flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden"
            style={{ width: '48px', height: '48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <Plus size={24} color="#555" strokeWidth={1.5} />
          </button>
        </div>

        {/* 2. Accessories Capsule */}
        <div className="group relative flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100" style={{ gap: '8px', padding: '12px' }}>
          <ToolbarTooltip label="Accessories" />
          {selectedAccessories.map((accId, idx) => (
            <button
              key={`acc-${idx}`}
              onClick={() => setExpandedSection('accessories')}
              className={`flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden ${expandedSection === 'accessories' ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
              style={{ width: '48px', height: '48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
              title="Accessories"
            >
              <span style={{ fontSize: '24px' }}>{ACCESSORIES.find(a => a.id === accId)?.emoji || '💎'}</span>
            </button>
          ))}
          <button
            onClick={() => setExpandedSection('accessories')}
            className="flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden"
            style={{ width: '48px', height: '48px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <Plus size={24} color="#555" strokeWidth={1.5} />
          </button>
        </div>

        {/* 3. Color/Fabric Swatch */}
        <button
          onClick={() => setExpandedSection('fabric')}
          className="group relative flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border border-gray-100"
          style={{ width: '64px', height: '64px', borderRadius: '50%', cursor: 'pointer', alignSelf: 'center' }}
          title="Color"
        >
          {selectedColor ? (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedColor, border: '3px solid #FFF', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }} />
          ) : (
            <Palette size={26} color="#555" strokeWidth={1.5} />
          )}
          <ToolbarTooltip label="Fabric & Color" />
        </button>

        {/* 4. Reference Image */}
        <button
          onClick={() => setExpandedSection('reference')}
          className={`group flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border ${expandedSection === 'reference' ? 'border-[#2C1810]' : 'border-gray-100'} hover:bg-gray-50 overflow-visible relative`}
          style={{ width: '64px', height: '64px', borderRadius: '50%', cursor: 'pointer', alignSelf: 'center' }}
          title="Reference"
        >
          {referenceImages.length > 0 ? (
            <Image src={referenceImages[0]} alt="Reference" fill style={{ objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={26} color="#555" strokeWidth={1.5} />
          )}
          <ToolbarTooltip label="Reference" />
        </button>

        {/* 5. Fit/Ruler */}
        <button
          onClick={() => setExpandedSection('fit')}
          className={`group flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border ${expandedSection === 'fit' ? 'border-[#2C1810]' : 'border-gray-100'} hover:bg-gray-50 overflow-visible relative`}
          style={{ width: '64px', height: '64px', borderRadius: '50%', cursor: 'pointer', alignSelf: 'center' }}
          title="Fit & Measurements"
        >
          <Ruler size={26} color="#555" strokeWidth={1.5} />
          <ToolbarTooltip label="Fit" />
        </button>
      </div>
    </div>
  );
};
