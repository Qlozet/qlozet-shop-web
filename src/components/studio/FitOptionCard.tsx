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
    className="flex flex-col transition-all hover:bg-[var(--bg-surface-elevated)]"
    style={{
      padding: '14px',
      borderRadius: '14px',
      border: isSelected ? '2px solid var(--brand-fill)' : '1.5px solid var(--border-glass)',
      background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)',
      cursor: 'pointer',
      gap: '4px',
      textAlign: 'left',
    }}
  >
    <div className="flex items-center justify-between w-full">
      <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
        {option.label}
      </p>
      <div
        style={{
          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
          border: isSelected ? '4px solid var(--brand-fill)' : '2px solid var(--border-glass)',
          background: isSelected ? 'var(--brand-fill-text)' : 'transparent',
        }}
      />
    </div>
    <p style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
      {option.desc}
    </p>
  </button>
);
