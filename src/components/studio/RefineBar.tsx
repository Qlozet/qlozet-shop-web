'use client';

import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';
import { type CustomizationState } from '@/hooks/useCustomization';

// Tap-to-fill ideas, so people see what kind of change works.
const IDEAS = ['Longer sleeves', 'Add gold embroidery', 'Make it floor length', 'Change to lace'];

/**
 * Change the version on screen in plain words. Uses the image editor on the
 * current picture, so it keeps the design and changes only what's asked —
 * no starting over. Shown once there's something to change.
 */
export const RefineBar: React.FC<{ customization: CustomizationState; compact?: boolean }> = ({
  customization,
  compact = false,
}) => {
  const { currentImage, isGenerating, isRefining, refineCurrent, editTokenCost } = customization;
  const [text, setText] = useState('');
  if (!currentImage) return null;

  const busy = isGenerating || isRefining;
  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy || !text.trim()) return;
    await refineCurrent(text);
    setText('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col w-full" style={{ gap: '8px' }}>
      <div
        className="flex items-center w-full"
        style={{
          gap: '8px',
          padding: '6px 6px 6px 14px',
          borderRadius: '14px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-glass)',
        }}
      >
        <label htmlFor="studio-refine" className="sr-only">
          Change this version
        </label>
        <input
          id="studio-refine"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Change something, e.g. longer sleeves"
          maxLength={200}
          disabled={busy}
          className="flex-1 min-w-0 bg-transparent outline-none"
          style={{ fontSize: '13px', color: 'var(--text-primary)', border: 'none' }}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="flex items-center flex-shrink-0 transition-all active:scale-[0.97]"
          style={{
            gap: '6px',
            padding: '9px 12px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--brand-fill)',
            color: 'var(--brand-fill-text)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: busy || !text.trim() ? 'default' : 'pointer',
            opacity: busy || !text.trim() ? 0.45 : 1,
          }}
        >
          {isRefining ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          <span>Refine</span>
          <span className="flex items-center" style={{ gap: '2px', opacity: 0.85 }}>
            <TokenIcon size={11} color="#D4AF37" />
            {editTokenCost}
          </span>
        </button>
      </div>
      {!compact && (
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              disabled={busy}
              onClick={() => setText(idea)}
              style={{
                padding: '4px 10px',
                borderRadius: '100px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: busy ? 'default' : 'pointer',
              }}
            >
              {idea}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
