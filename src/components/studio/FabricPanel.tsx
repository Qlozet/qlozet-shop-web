'use client';

import React from 'react';
import { FABRICS, FABRIC_COLORS } from '@/data/studio-options';
import { FabricCard } from './FabricCard';
import { ColorPicker } from './ColorPicker';

interface FabricPanelProps {
  selectedFabric: string | null;
  onSelectFabric: (id: string) => void;
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
}

export const FabricPanel: React.FC<FabricPanelProps> = ({
  selectedFabric,
  onSelectFabric,
  selectedColor,
  onSelectColor,
}) => (
  <div style={{ padding: '20px' }}>
    {/* Material */}
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Material
      </span>
      <button
        className="transition-all hover:underline"
        style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        See all
      </button>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
      {FABRICS.map((fab) => (
        <FabricCard
          key={fab.id}
          fabric={fab}
          isSelected={selectedFabric === fab.id}
          onSelect={onSelectFabric}
        />
      ))}
    </div>

    {/* Color */}
    <span
      style={{
        fontSize: '11px', fontWeight: 800, color: '#666',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'block', marginBottom: '12px',
      }}
    >
      Color
    </span>
    <ColorPicker
      colors={FABRIC_COLORS}
      selectedColor={selectedColor}
      onSelect={onSelectColor}
    />
  </div>
);
