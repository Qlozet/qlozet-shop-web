'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type BrowseCategory } from '@/data/taxonomy';

interface BrowseCategoriesGridProps {
  categories: BrowseCategory[];
}

export function BrowseCategoriesGrid({ categories }: BrowseCategoriesGridProps) {
  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Section Header */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        <h2
          style={{
            fontSize: '12px',
            fontWeight: 900,
            color: '#1A1A1A',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Browse Categories
        </h2>
        <ChevronRight size={14} color="#1A1A1A" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="relative overflow-hidden group"
            style={{
              borderRadius: '16px',
              height: '130px',
              textDecoration: 'none',
              background: cat.color || '#2C1810',
            }}
          >
            {/* Thumbnail images */}
            <div className="absolute right-0 bottom-0 flex items-end" style={{ gap: '3px', padding: '8px' }}>
              {cat.images.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden flex-shrink-0"
                  style={{
                    width: i === 0 ? '55px' : '45px',
                    height: i === 0 ? '70px' : '60px',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>

            {/* Label */}
            <span
              className="absolute"
              style={{
                top: '14px',
                left: '14px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
