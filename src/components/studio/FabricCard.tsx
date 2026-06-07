'use client';

import React from 'react';
import Image from 'next/image';
import { type FabricOption } from '@/data/studio-options';

interface FabricCardProps {
  fabric: FabricOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const FabricCard: React.FC<FabricCardProps> = ({
  fabric,
  isSelected,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(fabric.id)}
    className="flex items-center transition-all hover:bg-gray-50"
    style={{
      padding: '10px',
      borderRadius: '14px',
      border: isSelected ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.08)',
      background: isSelected ? '#FAF6F1' : '#FAFAFA',
      cursor: 'pointer',
      gap: '10px',
    }}
  >
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: '40px', height: '40px', borderRadius: '10px' }}
    >
      <Image src={fabric.image} alt={fabric.name} fill style={{ objectFit: 'cover' }} />
    </div>
    <div className="flex-1 text-left">
      <p style={{ fontSize: '10px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
        {fabric.name}
      </p>
      {fabric.extraCost && (
        <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
          +₦{fabric.extraCost.toLocaleString()}
        </p>
      )}
    </div>
    <div
      style={{
        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
        border: isSelected ? '4px solid #2C1810' : '2px solid #CCC',
        background: isSelected ? '#FFF' : 'transparent',
      }}
    />
  </button>
);
