'use client';

import React from 'react';
import { SILHOUETTES, NECKLINES, SLEEVES } from '@/data/studio-options';
import { StyleOptionButton } from './StyleOptionButton';

interface StylesPanelProps {
  selectedSilhouette: string | null;
  onSelectSilhouette: (id: string) => void;
  selectedNeckline: string | null;
  onSelectNeckline: (id: string) => void;
  selectedSleeve: string | null;
  onSelectSleeve: (id: string) => void;
}

export const StylesPanel: React.FC<StylesPanelProps> = ({
  selectedSilhouette,
  onSelectSilhouette,
  selectedNeckline,
  onSelectNeckline,
  selectedSleeve,
  onSelectSleeve,
}) => (
  <div style={{ padding: '20px' }}>
    {/* Silhouette */}
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Silhouette
      </span>
      <button
        className="transition-all hover:underline"
        style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        See all
      </button>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
      {SILHOUETTES.map((opt) => (
        <StyleOptionButton
          key={opt.id}
          option={opt}
          isSelected={selectedSilhouette === opt.id}
          onSelect={onSelectSilhouette}
        />
      ))}
    </div>

    {/* Neckline */}
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Neckline
      </span>
      <button
        className="transition-all hover:underline"
        style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        See all
      </button>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
      {NECKLINES.map((opt) => (
        <StyleOptionButton
          key={opt.id}
          option={opt}
          isSelected={selectedNeckline === opt.id}
          onSelect={onSelectNeckline}
        />
      ))}
    </div>

    {/* Sleeves */}
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Sleeves
      </span>
      <button
        className="transition-all hover:underline"
        style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        See all
      </button>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
      {SLEEVES.map((opt) => (
        <StyleOptionButton
          key={opt.id}
          option={opt}
          isSelected={selectedSleeve === opt.id}
          onSelect={onSelectSleeve}
        />
      ))}
    </div>
  </div>
);
