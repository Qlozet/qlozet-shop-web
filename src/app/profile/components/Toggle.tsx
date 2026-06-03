'use client';

import React from 'react';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="transition-all"
      style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? '#462814' : '#E0E0E0', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
    >
      <span
        className="transition-all"
        style={{ position: 'absolute', top: '2px', left: value ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#FFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
      />
    </button>
  );
}
