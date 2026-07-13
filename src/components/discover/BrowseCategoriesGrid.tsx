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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="overflow-hidden group flex flex-col"
            style={{
              borderRadius: '24px',
              textDecoration: 'none',
              background: cat.color || '#2C1810',
            }}
          >
            {/* Label */}
            <span
              style={{
                padding: '16px 16px 10px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {cat.label}
            </span>

            {/* Product images — fill width, always 3 */}
            <div className="flex" style={{ gap: '12px', padding: '0 16px 16px' }}>
              {cat.images.slice(0, 3).map((img, i) => {
                const productId = cat.productIds?.[i];
                const imageContent = (
                  <div
                    className={`relative overflow-hidden${i === 2 ? ' hidden lg:block' : ''}`}
                    style={{
                      flex: 1,
                      aspectRatio: '3 / 4',
                      borderRadius: '16px',
                      background: '#F5F3F0',
                    }}
                  >
                    <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                );

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
                      background: '#F5F3F0',
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
                      background: '#F5F3F0',
                    }}
                  >
                    <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                );
              })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
