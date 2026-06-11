'use client';

import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';

interface CollectionChipsProps {
  chips: { label: string; href: string }[];
  activeSlug?: string;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

export function CollectionChips({ chips, activeSlug, showFilter, onFilterClick }: CollectionChipsProps) {
  return (
    <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '8px', paddingBottom: '2px' }}>
      {/* Filter icon */}
      {showFilter && (
        <button
          onClick={onFilterClick}
          className="flex-shrink-0 flex items-center justify-center transition-colors hover:bg-gray-100"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1.5px solid #E5E5E5',
            background: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={14} color="#1A1A1A" />
        </button>
      )}

      {/* Chips */}
      {chips.map((chip) => {
        const isActive = chip.href.endsWith(`/${activeSlug}`);
        return (
          <Link
            key={chip.label}
            href={chip.href}
            className="flex-shrink-0 transition-all"
            style={{
              height: '36px',
              padding: '0 18px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              color: isActive ? '#FFFFFF' : '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: isActive ? '#1A1A1A' : '#F4F4F4',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
