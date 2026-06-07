'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FIT_OPTIONS } from '@/data/studio-options';
import { FitOptionCard } from './FitOptionCard';

interface FitPanelProps {
  selectedFit: string | null;
  onSelectFit: (id: string) => void;
}

export const FitPanel: React.FC<FitPanelProps> = ({
  selectedFit,
  onSelectFit,
}) => (
  <div style={{ padding: '20px' }}>
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Preference
      </span>
    </div>
    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
      {FIT_OPTIONS.map((fit) => (
        <FitOptionCard
          key={fit.id}
          option={fit}
          isSelected={selectedFit === fit.id}
          onSelect={onSelectFit}
        />
      ))}
    </div>

    {/* Measurements link */}
    <div
      className="flex items-center justify-between transition-all hover:bg-gray-50"
      style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}
    >
      <div>
        <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>Your Measurements</p>
        <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
          Tap to set or edit your body measurements
        </p>
      </div>
      <ChevronRight size={16} color="#888" />
    </div>
  </div>
);
