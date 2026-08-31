'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Share2,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';

import { useApp } from '@/context/AppContext';

interface StudioHeaderProps {
  designName: string;
  tokenBalance: number;
  /** A generated design image exists — Save/Duplicate/Share need one. */
  hasImages?: boolean;
  /** Opens the shared Save Design modal (same flow as the desktop panel). */
  onSave?: () => void;
  /** Clone the current design into a fresh draft (the reorder path). */
  onDuplicate?: () => void;
  duplicating?: boolean;
  onShare?: () => void;
  /** Deleting needs a saved design. */
  onDelete?: () => void;
  deleting?: boolean;
  canDelete?: boolean;
}

// Every action here is real and wired — Publish/Unpublish and Chat Vendor were
// removed: the platform has no design-publishing concept, and bespoke chat
// lives on orders (there is no vendor to chat with at the studio stage).
interface StudioAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color?: string;
  disabled?: boolean;
  busy?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  designName,
  tokenBalance,
  hasImages,
  onSave,
  onDuplicate,
  duplicating,
  onShare,
  onDelete,
  deleting,
  canDelete,
}) => {
  const { user } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    if (showMobileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const hasUser = !!user;
  const actions: StudioAction[] = [
    {
      id: 'save',
      label: 'Save',
      icon: Bookmark,
      disabled: !hasUser || !hasImages,
    },
    {
      id: 'duplicate',
      label: duplicating ? 'Duplicating…' : 'Duplicate',
      icon: Copy,
      disabled: !hasUser || !hasImages || !!duplicating,
      busy: !!duplicating,
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      disabled: !hasUser || !hasImages,
    },
    {
      id: 'delete',
      label: deleting ? 'Deleting…' : 'Delete',
      icon: Trash2,
      color: '#EF4444',
      disabled: !hasUser || !canDelete || !!deleting,
      busy: !!deleting,
    },
  ];

  const handleAction = (id: string) => {
    setShowMobileMenu(false);
    if (id === 'save') onSave?.();
    else if (id === 'duplicate') onDuplicate?.();
    else if (id === 'share') onShare?.();
    else if (id === 'delete') onDelete?.();
  };

  return (
    <>
      {/* ═══ DESKTOP TOP HEADER ═══ */}
      {/* Left: Back + Title */}
      <div className="absolute top-6 left-6 z-40 hidden lg:flex items-center" style={{ gap: '14px' }}>
        <Link
          href="/bespoke"
          className="flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] backdrop-blur-md shadow-sm"
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-base)' }}
        >
          <ArrowLeft size={20} color="var(--text-primary)" />
        </Link>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Bespoke Studio
          </p>
          <p className="truncate" style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '200px' }}>
            {designName}
          </p>
        </div>
      </div>

      {/* Right: Desktop action buttons */}
      <div className="absolute top-6 right-6 z-40 hidden lg:flex items-center" style={{ gap: '10px' }}>
        {actions.map(({ id, label, icon: Icon, color, disabled, busy }) => (
          <button
            key={id}
            title={label}
            onClick={() => handleAction(id)}
            disabled={disabled}
            className="relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--bg-base)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled && !busy ? 0.4 : 1,
            }}
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" color={color || 'var(--text-primary)'} />
            ) : (
              <Icon size={18} color={color || 'var(--text-primary)'} />
            )}
          </button>
        ))}
      </div>

      {/* ═══ MOBILE TOP HEADER ═══ */}
      <div
        className="absolute top-0 left-0 right-0 z-40 flex lg:hidden items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--border-glass)]"
        style={{ height: '72px', padding: '0 20px' }}
      >
        {/* Left: Back + Title */}
        <div className="flex items-center" style={{ gap: '14px' }}>
          <Link
            href="/bespoke"
            className="flex items-center justify-center transition-all"
            style={{ width: '36px', height: '36px' }}
          >
            <ArrowLeft size={22} color="var(--text-primary)" />
          </Link>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DESIGN STUDIO
            </p>
            <p className="truncate" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '180px' }}>
              {designName}
            </p>
          </div>
        </div>

        {/* Right: Token pill + 3-dot menu */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '6px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
            <TokenIcon size={14} color="#D4AF37" />
            {/* Pill background is a fixed cream, so the count stays dark in both
                themes (var(--text-primary) would turn white in dark mode). */}
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#2C1810' }}>{tokenBalance}</span>
          </div>

          {/* 3-dot menu trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-center"
              style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <MoreVertical size={22} color="var(--text-primary)" />
            </button>

            {/* Dropdown */}
            {showMobileMenu && (
              <div
                className="absolute animate-fade-in"
                style={{
                  top: '44px',
                  right: 0,
                  minWidth: '190px',
                  background: 'var(--bg-base)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 0',
                  zIndex: 100,
                }}
              >
                {actions.map(({ id, label, icon: Icon, color, disabled, busy }) => (
                  <React.Fragment key={id}>
                    {/* Separator before Delete */}
                    {id === 'delete' && (
                      <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }} />
                    )}
                    <button
                      onClick={() => !disabled && handleAction(id)}
                      disabled={disabled}
                      className="w-full flex items-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
                      style={{
                        padding: '12px 18px',
                        gap: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled && !busy ? 0.4 : 1,
                      }}
                    >
                      {busy ? (
                        <Loader2 size={18} className="animate-spin" color={color || 'var(--text-primary)'} />
                      ) : (
                        <Icon size={18} color={color || 'var(--text-primary)'} />
                      )}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: color || 'var(--text-primary)' }}>
                        {label}
                      </span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
