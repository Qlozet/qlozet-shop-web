'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type HeroBanner } from '@/data/taxonomy';

interface DiscoverHeroBannersProps {
  banners: HeroBanner[];
}

export function DiscoverHeroBanners({ banners }: DiscoverHeroBannersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto hide-scrollbar snap-x"
      style={{ gap: '16px', paddingBottom: '4px' }}
    >
      {banners.map((banner, idx) => (
        <Link
          key={idx}
          href={banner.href}
          className="relative overflow-hidden group snap-start"
          style={{
            flex: '1 0 0%',
            minWidth: '220px',
            height: '200px',
            borderRadius: '20px',
            textDecoration: 'none',
          }}
        >
          <Image
            src={banner.image}
            alt={banner.label}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div className="flex flex-col" style={{ gap: '2px', minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                }}
              >
                {banner.label}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {banner.description}
              </span>
            </div>
            <div
              className="flex items-center justify-center transition-transform group-hover:translate-x-1 flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                marginLeft: '8px',
              }}
            >
              <ArrowRight size={16} color="#FFF" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
