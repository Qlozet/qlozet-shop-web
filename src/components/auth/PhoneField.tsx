'use client';

import React from 'react';

export interface PhoneFieldProps {
  dialCode: string;
  onDialCodeChange: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  variant?: 'box' | 'underline';
}

// Curated dial codes (unique values). Nigeria first (default market).
const DIAL_CODES = [
  { c: 'NG', flag: '🇳🇬', dial: '+234' },
  { c: 'GH', flag: '🇬🇭', dial: '+233' },
  { c: 'KE', flag: '🇰🇪', dial: '+254' },
  { c: 'ZA', flag: '🇿🇦', dial: '+27' },
  { c: 'EG', flag: '🇪🇬', dial: '+20' },
  { c: 'UG', flag: '🇺🇬', dial: '+256' },
  { c: 'TZ', flag: '🇹🇿', dial: '+255' },
  { c: 'US', flag: '🇺🇸', dial: '+1' },
  { c: 'GB', flag: '🇬🇧', dial: '+44' },
  { c: 'FR', flag: '🇫🇷', dial: '+33' },
  { c: 'AE', flag: '🇦🇪', dial: '+971' },
  { c: 'IN', flag: '🇮🇳', dial: '+91' },
];

const BOX: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid var(--border-glass)',
  background: 'var(--bg-surface-elevated)',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

const UNDERLINE: React.CSSProperties = {
  padding: '12px 0',
  border: 'none',
  borderBottom: '1px solid var(--border-glass)',
  background: 'transparent',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
};

export function PhoneField({ dialCode, onDialCodeChange, value, onChange, variant = 'box' }: PhoneFieldProps) {
  const base = variant === 'box' ? BOX : UNDERLINE;
  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <select
        value={dialCode}
        onChange={(e) => onDialCodeChange(e.target.value)}
        style={{ ...base, flexShrink: 0, cursor: 'pointer', paddingRight: variant === 'box' ? '10px' : '4px', color: 'var(--text-primary)' }}
        aria-label="Country dial code"
      >
        {DIAL_CODES.map((c) => (
          <option key={c.c} value={c.dial} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        placeholder="801 234 5677"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ''))}
        style={{ ...base, flex: 1, minWidth: 0 }}
        required
      />
    </div>
  );
}
