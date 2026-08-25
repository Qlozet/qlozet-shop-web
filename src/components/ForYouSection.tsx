'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { RecentItem } from '@/context/AppContext';

interface ForYouSectionProps {
  recentlyViewed: RecentItem[];
  heroImage?: string;
}

const DEFAULT_HERO = '/image/bespoke-agbada-orange.webp';

export function ForYouSection({ recentlyViewed, heroImage }: ForYouSectionProps) {
  const forYouImage = heroImage || DEFAULT_HERO;

  // Filter out stale string entries from old format
  const validItems = recentlyViewed.filter(
    (item): item is RecentItem => typeof item === 'object' && !!item?.id && !!item?.image && !!item?.href
  );

  // Recently seen grid — up to 9 items (3×3)
  const recentGrid = validItems.slice(0, 9);

  return (
    <div
      className="flex flex-col lg:grid gap-[36px] lg:gap-4"
      style={{
        gridTemplateColumns: recentGrid.length > 0 ? '3fr 1fr' : '1fr',
      }}
    >
      {/* ── FOR YOU Card ────────────────────────────────────── */}
      <Link
        href="/for-you"
        className="relative overflow-hidden group transition-all hover:shadow-xl"
        style={{
          borderRadius: '20px',
          minHeight: '320px',
          textDecoration: 'none',
          display: 'flex',
        }}
      >
        <Image
          src={forYouImage}
          alt="For You"
          fill
          quality={90}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,30,30,0.3) 100%)',
          }}
        />
        {/* Label */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-end"
          style={{ padding: '24px' }}
        >
          <div className="flex items-center" style={{ gap: '10px' }}>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              }}
            >
              For You
            </span>
            <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
        </div>
      </Link>

      {/* ── RECENTLY SEEN Card ──────────────────────────────── */}
      {recentGrid.length > 0 && (
        <div
          className="flex flex-col overflow-hidden"
          style={{
            borderRadius: '20px',
            background: '#888888',
            minHeight: '320px',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 20px 6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Recently Seen
            </span>
          </div>

          {/* 4-column stacked grid */}
          <div
            className="flex-1 grid"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              padding: '0 20px 20px',
              alignContent: 'start',
            }}
          >
            {recentGrid.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.href}
                className="relative overflow-hidden transition-all hover:opacity-85 active:scale-95"
                style={{
                  borderRadius: '10px',
                  aspectRatio: '1 / 1',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="72px"
                />
              </Link>
            ))}
          </div>

          {/* View All footer */}
          <Link
            href="/products"
            className="flex items-center justify-end transition-opacity hover:opacity-80 mt-auto"
            style={{
              padding: '6px 20px 20px',
              textDecoration: 'none',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              }}
            >
              View All
            </span>
            <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
