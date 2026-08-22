'use client';

import React from 'react';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={value}
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onChange(!value); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!value); } }}
      className="transition-all"
      style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
    >
      <span
        className="transition-all"
        style={{ position: 'absolute', top: '2px', left: value ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: value ? 'var(--brand-fill-text)' : '#FFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      />
    </div>
  );
}
