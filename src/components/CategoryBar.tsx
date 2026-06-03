'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

// ─── Category Types ───────────────────────────────────────────────
export type CategoryKind = 'all' | 'bespoke' | 'custom' | 'read-to-wear' | 'fabric' | 'accessory';

export const CATEGORIES: { id: CategoryKind; label: string }[] = [
  { id: 'all', label: 'ALL ITEMS' },
  { id: 'bespoke', label: 'BESPOKE' },
  { id: 'custom', label: 'CUSTOM' },
  { id: 'read-to-wear', label: 'READ-TO-WEAR' },
  { id: 'fabric', label: 'FABRICS' },
  { id: 'accessory', label: 'ACCESSORIES' },
];

// ─── Component Props ──────────────────────────────────────────────
interface CategoryBarProps {
  selectedKind: CategoryKind;
  onCategoryChange: (kind: CategoryKind) => void;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  itemCount: number;
}

// ─── CategoryBar Component ────────────────────────────────────────
// Renders the filter toggle button + horizontal scrollable category
// pills + item count. Fully inline-styled to avoid Tailwind JIT bugs.

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedKind,
  onCategoryChange,
  isFilterOpen,
  onFilterToggle,
  itemCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        width: '100%',
      }}
    >
      {/* Left side: Filter button + Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflowX: 'auto',
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="no-scrollbar scrollbar-none hide-scrollbar"
      >
        {/* Filter Toggle Button */}
        <button
          onClick={onFilterToggle}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          title="Toggle Filters"
        >
          <SlidersHorizontal size={16} color="#1A1A1A" strokeWidth={2.2} />
        </button>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="no-scrollbar scrollbar-none hide-scrollbar"
        >
          {CATEGORIES.map((pill) => {
            const isActive = selectedKind === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => onCategoryChange(pill.id)}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? '#1A1A1A' : '#F4F4F4',
                  color: isActive ? '#FFFFFF' : '#1A1A1A',
                  flexShrink: 0,
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side: Item count */}
      <span
        className="hidden lg:block"
        style={{
          fontSize: '12px',
          color: '#9A95B6',
          fontWeight: 600,
          letterSpacing: '0.025em',
          flexShrink: 0,
        }}
      >
        Showing {itemCount} items
      </span>
    </div>
  );
};
