'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { type BrowseCategory } from '@/data/taxonomy';

interface BrowseCategoriesGridProps {
  categories: BrowseCategory[];
  title?: string;
}

export function BrowseCategoriesGrid({ categories, title = 'Browse Categories' }: BrowseCategoriesGridProps) {
  if (!categories || categories.length === 0) return null;

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
                background: cat.color || 'var(--brand-fill)',
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
                    color: 'var(--brand-fill-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {cat.label}
                </span>
                <ChevronRight
                  size={16}
                  color="var(--brand-fill-text)"
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
