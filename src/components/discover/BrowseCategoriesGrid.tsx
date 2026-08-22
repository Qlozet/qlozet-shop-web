'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type BrowseCategory } from '@/data/taxonomy';
import { useTheme } from '@/context/ThemeContext';

interface BrowseCategoriesGridProps {
  categories: BrowseCategory[];
  title?: string;
}

export function BrowseCategoriesGrid({ categories, title = 'Browse Categories' }: BrowseCategoriesGridProps) {
  const { isDark } = useTheme();
  if (!categories || categories.length === 0) return null;

  // The category colours are rich earthy tones. In dark mode they read too loud
  // against the near-black page, so blend ~28% of the near-black surface into
  // each one to mute/tint it. Labels stay white in both themes (the panels are
  // dark enough for white to read either way).
  const panelBg = (color?: string) => {
    const base = color || '#2C1810';
    return isDark ? `color-mix(in srgb, ${base} 72%, var(--bg-surface))` : base;
  };

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Section Header */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        <h2
          style={{
            fontSize: '12px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </h2>
        <ChevronRight size={14} color="var(--text-primary)" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
          return (
            <Link
              key={idx}
              href={cat.href}
              className="relative overflow-hidden group flex flex-col"
              style={{
                borderRadius: '24px',
                textDecoration: 'none',
                background: panelBg(cat.color),
              }}
            >
              {/* Header (Label + Arrow) */}
              <div
                className="relative z-10 flex items-center justify-between"
                style={{ padding: '16px 16px 10px' }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {cat.label}
                </span>
                <ChevronRight
                  size={16}
                  color="#FFFFFF"
                  className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                />
              </div>

              {/* Product images — fill width, always 3 */}
              <div className="flex relative z-10 flex-1" style={{ gap: '12px', padding: '0 16px 16px' }}>
                {cat.images.slice(0, 3).map((img, i) => {
                  const productId = cat.productIds?.[i];
                  return productId ? (
                    <Link
                      key={i}
                      href={`/products/${productId}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`relative overflow-hidden${i === 2 ? ' hidden lg:block' : ''}`}
                      style={{
                        flex: 1,
                        aspectRatio: '3 / 4',
                        borderRadius: '16px',
                        background: 'var(--bg-surface-elevated)',
                      }}
                    >
                      <Image src={img} alt="" fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className={`relative overflow-hidden${i === 2 ? ' hidden lg:block' : ''}`}
                      style={{
                        flex: 1,
                        aspectRatio: '3 / 4',
                        borderRadius: '16px',
                        background: 'var(--bg-surface-elevated)',
                      }}
                    >
                      <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
