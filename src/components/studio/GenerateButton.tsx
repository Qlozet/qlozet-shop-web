'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';

interface GenerateButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
  disabled?: boolean;
  /** Tokens one generation costs (from platform settings). */
  cost: number;
  /** What's picked, shown as one line above the button. */
  summary?: string[];
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onGenerate,
  disabled = false,
  cost,
  summary = [],
  className = '',
}) => {
  const isInactive = disabled || isGenerating;
  const shown = summary.slice(0, 4);
  const more = summary.length - shown.length;

  return (
    <div className={`flex flex-col min-w-0 ${className}`} style={{ gap: '6px' }}>
      {summary.length > 0 && (
        <p
          className="truncate text-center"
          title={summary.join(' · ')}
          style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          {shown.join(' · ')}
          {more > 0 ? ` · +${more} more` : ''}
        </p>
      )}
      <button
        onClick={onGenerate}
        disabled={isInactive}
        className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
        style={{
          padding: '16px',
          borderRadius: '16px',
          background: '#4C1D95',
          color: '#FFF',
          fontSize: '13px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          border: 'none',
          cursor: isInactive ? 'not-allowed' : 'pointer',
          gap: '8px',
          opacity: isInactive ? 0.4 : 1,
          pointerEvents: isInactive ? 'none' : 'auto',
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>GENERATE</span>
            <div className="flex items-center gap-1" style={{ opacity: 0.8 }}>
              <TokenIcon size={14} color="#D4AF37" />
              <span>{cost}</span>
            </div>
          </>
        )}
      </button>
    </div>
  );
};
