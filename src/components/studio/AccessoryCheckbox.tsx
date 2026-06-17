'use client';

import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import { type AccessoryOption } from '@/data/studio-options';
import { useLongPress, PreviewCard } from './PreviewCard';

// ── Accessory descriptions ──────────────────────────────────
const ACCESSORY_DESC: Record<string, string> = {
  a1: 'Premium gold-toned buttons that add a luxurious finishing touch to collars, cuffs, and front closures.',
  a2: 'A structured waist belt to cinch the silhouette and add definition to the outfit.',
  a3: 'Handcrafted embroidery patterns that bring intricate detail and cultural richness to the garment.',
  a4: 'Hand-sewn beadwork accents that add texture, color, and a premium artisanal feel.',
  a5: 'Sparkling sequin detailing for evening and event wear — adds glamour and light-catching movement.',
  a6: 'Delicate lace trim along hems, necklines, or sleeves for a feminine and elegant finish.',
};

interface AccessoryCheckboxProps {
  accessory: AccessoryOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const AccessoryCheckbox: React.FC<AccessoryCheckboxProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { showPreview, handlers, wasLongPress } = useLongPress();

  const handleClick = () => {
    if (wasLongPress()) return;
    onToggle(accessory.id);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        {...handlers}
        className="flex items-center transition-all hover:shadow-md w-full"
        style={{
          padding: '8px 12px',
          borderRadius: '16px',
          border: isSelected ? '1px solid #2C1810' : '1px solid transparent',
          background: isSelected ? '#FAF6F1' : '#F5F5F5',
          cursor: 'pointer',
          gap: '12px',
          height: '56px',
        }}
      >
        <div
          className="flex items-center justify-center bg-white shadow-sm"
          style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}
        >
          <span style={{ fontSize: '24px' }}>{accessory.emoji}</span>
        </div>
        <div className="flex-1 text-left flex flex-col justify-center" style={{ overflow: 'hidden', minWidth: 0 }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {accessory.name}
          </p>
          {accessory.extraCost && (
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#1A1A1A', marginTop: '2px' }}>
              +₦{accessory.extraCost.toLocaleString()}
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center"
          style={{
            width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
            background: isSelected ? '#2C1810' : '#D1D5DB',
          }}
        >
          {isSelected && <Check size={12} color="#FFF" strokeWidth={3} />}
        </div>
      </button>

      {showPreview && (
        <PreviewCard
          info={{
            label: accessory.name,
            description: ACCESSORY_DESC[accessory.id] || `${accessory.name} — a premium finishing detail for your bespoke garment.`,
            extraCost: accessory.extraCost,
          }}
          anchorRef={btnRef}
        />
      )}
    </>
  );
};
