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
      style={{ gap: '12px', paddingBottom: '4px' }}
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
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {banner.label}
            </span>
            <div
              className="flex items-center justify-center transition-transform group-hover:translate-x-1"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
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
