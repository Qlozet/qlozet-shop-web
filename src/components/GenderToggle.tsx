'use client';

import React from 'react';

interface GenderToggleProps {
  gender: 'male' | 'female';
  onToggle: (g: 'male' | 'female') => void;
}

export const GenderToggle: React.FC<GenderToggleProps> = ({ gender, onToggle }) => {
  return (
    <div
      className="flex items-center"
      style={{
        gap: '4px',
        background: '#F0F0F0',
        borderRadius: '20px',
        padding: '4px',
        width: 'fit-content',
      }}
    >
      <button
        onClick={() => onToggle('male')}
        className="flex items-center justify-center transition-all"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: gender === 'male' ? '#1A1A1A' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Male icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gender === 'male' ? '#FFFFFF' : '#999'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="14" r="5" />
          <path d="M19 5l-4.35 4.35" />
          <path d="M15 5h4v4" />
        </svg>
      </button>
      <button
        onClick={() => onToggle('female')}
        className="flex items-center justify-center transition-all"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: gender === 'female' ? '#1A1A1A' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Female icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gender === 'female' ? '#FFFFFF' : '#999'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M12 13v8" />
          <path d="M9 18h6" />
        </svg>
      </button>
    </div>
  );
};
