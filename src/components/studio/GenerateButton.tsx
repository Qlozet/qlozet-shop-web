'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';
import { GENERATION_COST } from '@/data/studio-options';

interface GenerateButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
  disabled?: boolean;
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onGenerate,
  disabled = false,
  className = '',
}) => {
  const isInactive = disabled || isGenerating;

  return (
    <button
      onClick={onGenerate}
      disabled={isInactive}
      className={`w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-lg ${className}`}
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
            <span>{GENERATION_COST}</span>
          </div>
        </>
      )}
    </button>
  );
};
