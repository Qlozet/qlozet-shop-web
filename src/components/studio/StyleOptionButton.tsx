'use client';

import React from 'react';
import { type StyleOption } from '@/data/studio-options';

interface StyleOptionButtonProps {
  option: StyleOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const StyleOptionButton: React.FC<StyleOptionButtonProps> = ({
  option,
  isSelected,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(option.id)}
    className="flex items-center transition-all hover:opacity-90"
    style={{
      padding: '8px 12px',
      borderRadius: '16px',
      border: isSelected ? '1px solid #2C1810' : '1px solid transparent',
      background: isSelected ? '#FAF6F1' : '#F5F5F5',
      cursor: 'pointer',
      gap: '12px',
    }}
  >
    <div
      className="flex items-center justify-center bg-white shadow-sm"
      style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}
    >
      <span style={{ fontSize: '24px' }}>{option.emoji}</span>
    </div>
    <div className="flex-1 text-left flex flex-col justify-center">
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
        {option.label}
      </p>
      {option.extraCost !== undefined && (
        <p style={{ fontSize: '10px', fontWeight: 700, color: option.extraCost > 0 ? '#1A1A1A' : '#059669', marginTop: '4px' }}>
          {option.extraCost > 0 ? `+₦${option.extraCost.toLocaleString()}` : 'Included'}
        </p>
      )}
    </div>
    <div
      className="flex items-center justify-center"
      style={{
        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
        border: isSelected ? '1.5px solid #2C1810' : 'none',
        background: isSelected ? 'transparent' : '#D1D5DB',
      }}
    >
      {isSelected && (
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />
      )}
    </div>
  </button>
);
