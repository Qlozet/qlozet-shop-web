'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const TRENDING_ITEMS = [
  { label: 'Jackets', image: '/image/seun.png' },
  { label: 'Agbada', image: '/image/bespoke-agbada-orange.webp' },
  { label: 'Kaftans', image: '/image/bespoke-kaftan-brown-1.png' },
];

export const TrendingBanner: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % TRENDING_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = TRENDING_ITEMS[activeIdx];

  return (
    <div
      className="relative overflow-hidden w-full rounded-[24px] lg:rounded-[20px]"
      style={{
        height: '440px',
        background: '#E8DDD0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}
    >
      {/* Responsive height override for desktop */}
      <style>{`@media(min-width:1024px){.trending-banner-wrap{height:280px!important}}`}</style>
      {/* Background Images */}
      {TRENDING_ITEMS.map((item, idx) => (
        <div
          key={item.label}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: idx === activeIdx ? 1 : 0,
          }}
        >
          <Image
            src={item.image}
            alt={item.label}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            priority={idx === 0}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end"
        style={{ padding: '0 0 36px 0' }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '4px',
          }}
        >
          Trending This Week
        </span>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            marginBottom: '8px',
          }}
        >
          &lsquo;{current.label}&rsquo;
        </h2>
        {/* Underline accent */}
        <div
          style={{
            width: '40px',
            height: '3px',
            borderRadius: '2px',
            background: '#FFFFFF',
          }}
        />
      </div>
    </div>
  );
};
