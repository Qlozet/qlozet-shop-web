'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuRowProps {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  label: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  isActive?: boolean;
}

export default function MenuRow({
  icon: Icon,
  iconColor = '#462814',
  iconBg = 'rgba(70,40,20,0.08)',
  label,
  onClick,
  trailing,
  isActive,
}: MenuRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between transition-colors hover:bg-gray-50/80"
      style={{
        padding: '14px 20px',
        background: isActive ? 'rgba(70,40,20,0.04)' : 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        borderLeft: isActive ? '3px solid #462814' : '3px solid transparent',
      }}
    >
      <div className="flex items-center" style={{ gap: '14px' }}>
        <span
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: '34px', height: '34px', borderRadius: '10px', background: iconBg }}
        >
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </span>
        <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 600, color: '#1A1A1A' }}>{label}</span>
      </div>
      {trailing || <ChevronRight size={16} color="#CCC" />}
    </button>
  );
}
