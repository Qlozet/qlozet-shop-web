'use client';

import React from 'react';

export interface OtpInputsProps {
  value: string[];
  onChange: (v: string[]) => void;
  /** Called with the full code once every cell is filled (typing or paste). */
  onComplete?: (code: string) => void;
  /** Unique DOM id prefix so multiple instances (mobile/desktop) don't clash. */
  idPrefix?: string;
}

/**
 * Six-cell verification code input.
 *  • Dark-mode-visible via tokens (surface-elevated bg, text-primary).
 *  • Pasting the whole code (e.g. copied from the email) fills every cell,
 *    not just the first — the old handler kept only the first digit.
 */
export function OtpInputs({ value, onChange, onComplete, idPrefix = 'otp' }: OtpInputsProps) {
  const len = value.length || 6;

  const focusCell = (i: number) => {
    const el = document.getElementById(`${idPrefix}-${i}`);
    if (el) (el as HTMLInputElement).focus();
  };

  const handleChange = (raw: string, idx: number) => {
    const digit = raw.replace(/\D/g, '');
    if (raw && !digit) return; // ignore non-numeric
    const next = [...value];
    next[idx] = digit.slice(-1);
    onChange(next);
    if (digit && idx < len - 1) focusCell(idx + 1);
    if (next.every((c) => c !== '')) onComplete?.(next.join(''));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!digits) return;
    e.preventDefault();
    const next = [...value];
    // Fill from the cell being pasted into onward.
    for (let i = 0; i < digits.length && idx + i < len; i++) {
      next[idx + i] = digits[i];
    }
    onChange(next);
    const lastFilled = Math.min(idx + digits.length, len) - 1;
    focusCell(Math.min(lastFilled + 1, len - 1));
    if (next.every((c) => c !== '')) onComplete?.(next.join(''));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) focusCell(idx - 1);
    if (e.key === 'ArrowLeft' && idx > 0) focusCell(idx - 1);
    if (e.key === 'ArrowRight' && idx < len - 1) focusCell(idx + 1);
  };

  return (
    <div className="flex justify-center" style={{ gap: '10px' }}>
      {value.map((cell, idx) => (
        <input
          key={idx}
          id={`${idPrefix}-${idx}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={cell}
          onChange={(e) => handleChange(e.target.value, idx)}
          onPaste={(e) => handlePaste(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-brown)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,90,43,0.12)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = cell ? 'var(--brand-brown)' : 'var(--border-glass)'; e.currentTarget.style.boxShadow = 'none'; }}
          style={{
            width: '52px',
            height: '60px',
            borderRadius: '14px',
            border: cell ? '2px solid var(--brand-brown)' : '1px solid var(--border-glass)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            fontSize: '22px',
            fontWeight: 800,
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'var(--font-display)',
          }}
        />
      ))}
    </div>
  );
}
