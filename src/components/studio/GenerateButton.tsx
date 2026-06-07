'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { GENERATION_COST } from '@/data/studio-options';

interface GenerateButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  onGenerate,
  className = '',
}) => (
  <button
    onClick={onGenerate}
    disabled={isGenerating}
    className={`w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg ${className}`}
    style={{
      padding: '16px',
      borderRadius: '16px',
      background: '#9B51E0',
      color: '#FFF',
      fontSize: '13px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      border: 'none',
      cursor: isGenerating ? 'wait' : 'pointer',
      gap: '8px',
    }}
  >
    {isGenerating ? (
      <>
        <Loader2 size={16} className="animate-spin" />
        <span>Generating...</span>
      </>
    ) : (
      <>
        <span>GENERATE STYLE</span>
        <div className="flex items-center gap-1" style={{ opacity: 0.8 }}>
          <span style={{ fontSize: '14px' }}>🪙</span>
          <span>{GENERATION_COST}</span>
        </div>
      </>
    )}
  </button>
);
