'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Save, X } from 'lucide-react';

interface UnsavedDesignDialogProps {
  isOpen: boolean;
  /** The design's current cover, so the shopper sees what they would lose. */
  image?: string | null;
  isSavedBefore: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

// Asked when leaving the studio with a design that has changed since it was
// last saved (or was never saved). Generations cost tokens, so losing one by
// tapping Home should never happen silently.
export const UnsavedDesignDialog: React.FC<UnsavedDesignDialogProps> = ({
  isOpen,
  image,
  isSavedBefore,
  onSave,
  onDiscard,
  onKeepEditing,
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onKeepEditing}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-design-title"
        className="relative w-full animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          margin: '20px',
          borderRadius: '24px',
          background: 'var(--bg-base)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onKeepEditing}
          aria-label="Keep editing"
          className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer',
          }}
        >
          <X size={14} color="var(--text-secondary)" />
        </button>

        <div className="flex flex-col" style={{ padding: '28px 24px 24px', gap: '18px' }}>
          <div className="flex items-center" style={{ gap: '14px', paddingRight: '36px' }}>
            {image && (
              <div
                className="flex-shrink-0 overflow-hidden"
                style={{ width: '56px', height: '70px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="flex flex-col" style={{ gap: '6px' }}>
              <h3
                id="unsaved-design-title"
                style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25 }}
              >
                Save your design before you leave?
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {isSavedBefore
                  ? 'Your latest changes aren’t saved yet. If you leave now, they’re gone.'
                  : 'This design isn’t saved yet. If you leave now, it’s gone, along with the tokens it used.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: '8px' }}>
            <button
              onClick={onSave}
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: '14px', borderRadius: '14px', background: 'var(--brand-fill)',
                color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', gap: '8px',
              }}
            >
              <Save size={15} />
              Save design
            </button>
            <button
              onClick={onDiscard}
              className="w-full transition-all hover:opacity-80 active:scale-[0.98]"
              style={{
                padding: '13px', borderRadius: '14px', background: 'none',
                color: '#DC2626', fontSize: '12px', fontWeight: 700,
                border: '1px solid var(--border-glass)', cursor: 'pointer',
              }}
            >
              {isSavedBefore ? 'Leave without saving' : 'Discard design'}
            </button>
            <button
              onClick={onKeepEditing}
              className="w-full transition-all hover:opacity-70"
              style={{
                padding: '10px', background: 'none', color: 'var(--text-muted)',
                fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
            >
              Keep editing
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
