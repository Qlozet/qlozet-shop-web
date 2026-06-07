'use client';

import React from 'react';
import { ACCESSORIES } from '@/data/studio-options';
import { AccessoryCheckbox } from './AccessoryCheckbox';

interface AccessoriesPanelProps {
  selectedAccessories: string[];
  onToggle: (id: string) => void;
}

export const AccessoriesPanel: React.FC<AccessoriesPanelProps> = ({
  selectedAccessories,
  onToggle,
}) => (
  <div style={{ padding: '20px' }}>
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Embellishments
      </span>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
      {ACCESSORIES.map((acc) => (
        <AccessoryCheckbox
          key={acc.id}
          accessory={acc}
          isSelected={selectedAccessories.includes(acc.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  </div>
);
