'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { type FabricOption } from '@/data/studio-options';
import { useLongPress, PreviewCard } from './PreviewCard';
import { useCurrency } from '@/context/CurrencyContext';

// ── Fabric descriptions ─────────────────────────────────────
const FABRIC_DESC: Record<string, string> = {
  f1: 'Vibrant African wax print cotton — bold patterns and rich colors. Durable, breathable, and perfect for statement pieces.',
  f2: 'Imported French lace with intricate floral patterns. Lightweight and luxurious, ideal for evening wear and special occasions.',
  f3: 'Hand-woven Aso-Oke from Yorubaland. A prestigious traditional fabric with rich texture, perfect for ceremonial outfits.',
  f4: 'Crisp, lightweight cotton poplin with a smooth finish. Versatile and comfortable for everyday and formal wear.',
  f5: 'Luxurious premium silk with a natural sheen. Drapes beautifully and feels incredible against the skin.',
  f6: 'Genuine leather accent panels for structured, modern detailing. Adds an edgy, high-fashion element.',
};

interface FabricCardProps {
  fabric: FabricOption & { pricePerYard?: number; yards?: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const FabricCard: React.FC<FabricCardProps> = ({
  fabric,
  isSelected,
  onSelect,
}) => {
  const { fmt: fmtMoney } = useCurrency();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { showPreview, handlers, wasLongPress } = useLongPress();

  const handleClick = () => {
    if (wasLongPress()) return;
    onSelect(fabric.id);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        {...handlers}
        className="flex items-center transition-all hover:shadow-md w-full"
        style={{
          padding: '10px',
          borderRadius: '14px',
          border: isSelected ? '2px solid var(--brand-fill)' : '1.5px solid var(--border-glass)',
          background: 'var(--bg-surface-elevated)',
          cursor: 'pointer',
          gap: '10px',
          height: '60px',
        }}
      >
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: '40px', height: '40px', borderRadius: '10px' }}
        >
          <Image src={fabric.image} alt={fabric.name} fill style={{ objectFit: 'cover' }} />
        </div>
        <div className="flex-1 text-left" style={{ overflow: 'hidden', minWidth: 0 }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {fabric.name}
          </p>
          {fabric.pricePerYard ? (
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {fmtMoney(fabric.pricePerYard)}/yd
              {fabric.extraCost ? (
                <span style={{ color: '#059669' }}>
                  {' '}· ≈ {fmtMoney(fabric.extraCost)}
                  {fabric.yards ? ` (${fabric.yards} yd)` : ''}
                </span>
              ) : null}
            </p>
          ) : fabric.extraCost !== undefined ? (
            <p style={{ fontSize: '9px', fontWeight: 700, color: fabric.extraCost > 0 ? 'var(--text-primary)' : '#059669', marginTop: '2px' }}>
              {fabric.extraCost > 0 ? `+${fmtMoney(fabric.extraCost)}` : 'Included'}
            </p>
          ) : null}
        </div>
        <div
          style={{
            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
            border: isSelected ? '4px solid var(--brand-fill)' : '2px solid var(--border-glass)',
            background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
          }}
        />
      </button>

      {showPreview && (
        <PreviewCard
          info={{
            label: fabric.name,
            imageUrl: fabric.image,
            description: FABRIC_DESC[fabric.id] || `${fabric.name} — a quality fabric for your bespoke garment.`,
            extraCost: fabric.extraCost,
          }}
          anchorRef={btnRef}
        />
      )}
    </>
  );
};
