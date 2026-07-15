'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Palette, ImageIcon, Ruler } from 'lucide-react';
import { ACCESSORIES } from '@/data/studio-options';
import { ToolbarTooltip } from './ToolbarTooltip';
import { type CustomizationState } from '@/hooks/useCustomization';
import { useStyleLibrary, type PlatformStyle } from '@/hooks/useStyleLibrary';

// ─── Toolbar style chip ────────────────────────────────────
function StyleChip({
  style,
  isActive,
  onClick,
}: {
  style: PlatformStyle | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden ${isActive ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
      style={{
        width: '48px', height: '48px', borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative',
      }}
      title={style?.name || 'Style'}
    >
      {style?.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={style.image_url}
          alt={style.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: '28px' }}>
          {style?.category === 'neckline' ? '👗' : style?.category === 'sleeve' ? '🧤' : style?.category === 'collar' ? '👔' : style?.category === 'skirt' ? '👗' : style?.category === 'trouser' ? '👖' : '👘'}
        </span>
      )}
    </button>
  );
}

interface FloatingToolbarProps {
  customization: CustomizationState;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ customization }) => {
  const {
    selectedNeckline, selectedSleeve, selectedCollar,
    selectedSkirt, selectedTrouser, selectedFullBody,
    selectedAccessories, selectedColor, referenceImages,
    expandedSection, setExpandedSection, designGender,
  } = customization;

  const { all: allStyles } = useStyleLibrary(designGender ?? undefined);

  // Look up selected styles from the API cache
  const findStyle = (id: string | null): PlatformStyle | null => {
    if (!id) return null;
    return allStyles.find((s) => s._id === id) || null;
  };

  // Collect all active style selections
  const activeSelections = [
    selectedFullBody,
    selectedNeckline,
    selectedSleeve,
    selectedCollar,
    selectedSkirt,
    selectedTrouser,
  ].filter(Boolean) as string[];

  return (
    <div className="absolute top-[90px] bottom-6 z-20 hidden lg:flex items-start" style={{ right: '420px' }}>
      <div className="flex flex-col gap-4 mt-4 px-4 lg:px-6 overflow-visible items-center" style={{ paddingBottom: '20px' }}>

        {/* 1. Styles Capsule */}
        <div className="group relative flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100" style={{ gap: '8px', padding: '12px' }}>
          <ToolbarTooltip label="Style" />
          {activeSelections.map((styleId, idx) => (
            <StyleChip
              key={`style-${idx}`}
              style={findStyle(styleId)}
              isActive={expandedSection === 'styles'}
              onClick={() => setExpandedSection('styles')}
            />
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
          className={`group flex items-center justify-center transition-all active:scale-95 shadow-sm border ${expandedSection === 'reference' ? 'border-[#2C1810]' : 'border-gray-100'} hover:bg-gray-50 relative`}
          style={{ width: '64px', height: '64px', borderRadius: '50%', cursor: 'pointer', alignSelf: 'center', background: '#FFF' }}
          title="Reference"
        >
          {referenceImages.length === 1 ? (
            /* Single image — fill the entire circle */
            <div className="absolute inset-[3px] rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referenceImages[0]} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : referenceImages.length > 1 ? (
            /* Multiple images — small stacked cards */
            <div className="relative w-full h-full flex items-center justify-center">
              {referenceImages.slice(0, 3).map((img, idx) => {
                const total = Math.min(referenceImages.length, 3);
                const rotation = (idx - (total - 1) / 2) * 15;
                return (
                  <div
                    key={idx}
                    className="absolute overflow-hidden"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '2px solid #FFF',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      transform: `rotate(${rotation}deg)`,
                      zIndex: 3 - idx,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Ref ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                );
              })}
              {/* Count badge */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  bottom: '0px', right: '0px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#2C1810', border: '2px solid #FFF', zIndex: 10,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFF' }}>{referenceImages.length}</span>
              </div>
            </div>
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
