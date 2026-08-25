'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  /** Small uppercase label above the title */
  eyebrow: string;
  title: string;
  /** Button label */
  cta: string;
  href: string;
  image: string;
  /** Optional corner badge, e.g. "30% OFF" */
  badge?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** ms between auto-advances (0 disables). */
  interval?: number;
}

/**
 * Home hero — a rotating set of clickable "front doors" (Your Edit, Bespoke
 * Studio, Trending, Deals). Each slide is a real destination with a CTA;
 * auto-advances, pauses on hover, and has manual dots + arrows.
 */
export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, interval = 5500 }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((i: number) => setActive((i + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1 || interval <= 0) return;
    const t = setInterval(() => setActive((p) => (p + 1) % count), interval);
    return () => clearInterval(t);
  }, [paused, count, interval]);

  // Keep index in range if slide count changes
  useEffect(() => {
    if (active >= count) setActive(0);
  }, [count, active]);

  if (count === 0) return null;

  return (
    <div
      className="relative overflow-hidden w-full rounded-[30px] h-[380px] lg:h-[360px]"
      style={{ background: 'var(--bg-surface-elevated)', boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === active;
        return (
          <Link
            key={`${slide.href}-${idx}`}
            href={slide.href}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 100%)' }}
            />

            {slide.badge && (
              <span
                className="absolute"
                style={{ top: '18px', right: '18px', padding: '6px 12px', borderRadius: '100px', background: '#D4800D', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {slide.badge}
              </span>
            )}

            <div className="absolute inset-0 flex flex-col justify-end" style={{ padding: '28px 28px 32px', maxWidth: '80%' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '8px' }}>
                {slide.eyebrow}
              </span>
              <h2
                className="line-clamp-2"
                style={{ fontSize: '26px', lineHeight: 1.1, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)', marginBottom: '16px', textWrap: 'balance' }}
              >
                {slide.title}
              </h2>
              <span
                className="inline-flex items-center self-start"
                style={{ gap: '8px', padding: '11px 20px', borderRadius: '100px', background: '#FFFFFF', color: '#1a1a1a', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {slide.cta}
                <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        );
      })}

      {count > 1 && (
        <>
          {/* Arrows (desktop) */}
          <button
            onClick={(e) => { e.preventDefault(); go(active - 1); }}
            className="absolute z-10 hidden lg:flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer' }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} color="#FFF" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); go(active + 1); }}
            className="absolute z-10 hidden lg:flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
            style={{ right: '14px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer' }}
            aria-label="Next slide"
          >
            <ChevronRight size={18} color="#FFF" />
          </button>

          {/* Dots */}
          <div className="absolute z-10 flex items-center" style={{ bottom: '16px', right: '20px', gap: '7px' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setActive(i); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === active ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '100px',
                  background: i === active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.3s, background 0.3s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
