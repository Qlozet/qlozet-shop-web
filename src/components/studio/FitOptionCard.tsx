'use client';

import React from 'react';
import { type FitOption } from '@/data/studio-options';

interface FitOptionCardProps {
  option: FitOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const FitOptionCard: React.FC<FitOptionCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(option.id)}
    className="flex flex-col transition-all hover:bg-gray-50"
    style={{
      padding: '14px',
      borderRadius: '14px',
      border: isSelected ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.08)',
      background: isSelected ? '#FAF6F1' : '#FAFAFA',
      cursor: 'pointer',
      gap: '4px',
      textAlign: 'left',
    }}
  >
    <div className="flex items-center justify-between w-full">
      <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>
        {option.label}
      </p>
      <div
        style={{
          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
          border: isSelected ? '4px solid #2C1810' : '2px solid #CCC',
          background: isSelected ? '#FFF' : 'transparent',
        }}
      />
    </div>
    <p style={{ fontSize: '9px', color: '#888', lineHeight: 1.4 }}>
      {option.desc}
    </p>
  </button>
);
