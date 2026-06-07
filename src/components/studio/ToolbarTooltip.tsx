'use client';

import React from 'react';

interface ToolbarTooltipProps {
  label: string;
}

export const ToolbarTooltip: React.FC<ToolbarTooltipProps> = ({ label }) => (
  <div
    className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-wider rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md flex items-center"
    style={{ padding: '10px 16px' }}
  >
    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45" />
    {label}
  </div>
);
