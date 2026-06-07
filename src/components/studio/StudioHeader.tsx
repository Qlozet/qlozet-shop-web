'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Bookmark,
  Layers,
  FlipHorizontal,
  User,
  Trash2,
  MoreVertical,
} from 'lucide-react';

interface StudioHeaderProps {
  designName: string;
  tokenBalance: number;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  designName,
  tokenBalance,
}) => (
  <>
    {/* ═══ DESKTOP TOP HEADER ═══ */}
    {/* Left: Back + Title */}
    <div className="absolute top-6 left-6 z-40 hidden lg:flex items-center" style={{ gap: '14px' }}>
      <Link
        href="/bespoke"
        className="flex items-center justify-center transition-all hover:bg-white/80 backdrop-blur-md shadow-sm"
        style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)' }}
      >
        <ArrowLeft size={20} color="#1A1A1A" />
      </Link>
      <div>
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Bespoke Studio
        </p>
        <p className="truncate" style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 600, maxWidth: '200px' }}>
          {designName}
        </p>
      </div>
    </div>

    {/* Right: Action icons */}
    <div className="absolute top-6 right-6 z-40 hidden lg:flex items-center" style={{ gap: '12px' }}>
      {[
        { icon: MessageSquare, label: 'AI Chat', dot: true },
        { icon: Bookmark, label: 'Save' },
        { icon: Layers, label: 'Layers' },
        { icon: FlipHorizontal, label: 'Mirror' },
        { icon: User, label: 'Mannequin' },
        { icon: Trash2, label: 'Delete', color: '#EF4444' },
      ].map(({ icon: Icon, label, color, dot }) => (
        <button
          key={label}
          title={label}
          className="relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <Icon size={18} color={color || '#1A1A1A'} />
          {dot && <div className="absolute top-0 right-0 w-[12px] h-[12px] rounded-full bg-[#FF2E63] border-2 border-white" />}
        </button>
      ))}
    </div>

    {/* ═══ MOBILE TOP HEADER ═══ */}
    <div
      className="absolute top-0 left-0 right-0 z-40 flex lg:hidden items-center justify-between bg-white border-b border-gray-100"
      style={{ height: '72px', padding: '0 20px' }}
    >
      {/* Left: Back + Title */}
      <div className="flex items-center" style={{ gap: '14px' }}>
        <Link
          href="/bespoke"
          className="flex items-center justify-center transition-all"
          style={{ width: '36px', height: '36px' }}
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </Link>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DESIGN STUDIO
          </p>
          <p className="truncate" style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 600, maxWidth: '180px' }}>
            {designName}
          </p>
        </div>
      </div>

      {/* Right: Mobile Token Pill & 3-dots */}
      <div className="flex items-center" style={{ gap: '12px' }}>
        <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '6px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
          <span style={{ fontSize: '13px' }}>🪙</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A' }}>{tokenBalance}</span>
        </div>
        <button className="flex items-center justify-center" style={{ width: '36px', height: '36px' }}>
          <MoreVertical size={22} color="#1A1A1A" />
        </button>
      </div>
    </div>
  </>
);
