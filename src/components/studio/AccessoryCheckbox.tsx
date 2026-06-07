'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { type AccessoryOption } from '@/data/studio-options';

interface AccessoryCheckboxProps {
  accessory: AccessoryOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const AccessoryCheckbox: React.FC<AccessoryCheckboxProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => (
  <button
    onClick={() => onToggle(accessory.id)}
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
      <span style={{ fontSize: '24px' }}>{accessory.emoji}</span>
    </div>
    <div className="flex-1 text-left flex flex-col justify-center">
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
        {accessory.name}
      </p>
      {accessory.extraCost && (
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>
          +${(accessory.extraCost / 1000).toFixed(0)}000
        </p>
      )}
    </div>
    <div
      className="flex items-center justify-center"
      style={{
        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
        border: isSelected ? 'none' : 'none',
        background: isSelected ? '#2C1810' : '#D1D5DB',
      }}
    >
      {isSelected && <Check size={12} color="#FFF" strokeWidth={3} />}
    </div>
  </button>
);
