'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

/**
 * "Turn fabric into outfits" — the Home banner from the shop app: a fabric
 * swatch + a style = your outfit, with a button into the bespoke hub. One
 * glance explains what Qlozet does that a plain store doesn't.
 *
 * Inline styles for spacing (the shop's unlayered `* { padding: 0 }` reset
 * beats Tailwind padding/margin classes).
 */
const STEPS = [
  { src: '/image/fabric-cta-swatch.png', alt: 'A fabric swatch', bg: 'transparent' },
  { src: '/image/fabric-cta-model.png', alt: 'A style to copy', bg: 'transparent' },
  { src: '/image/fabric-cta-outfit.png', alt: 'The finished outfit in your fabric', bg: '#FFFFFF' },
];

export function FabricToOutfitBanner() {
  return (
    <section
      aria-label="Turn fabric into outfits"
      style={{
        background: '#1A1A1A',
        borderRadius: '24px',
        padding: '20px 20px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}
    >
      <h2
        style={{
          color: '#FFFFFF',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(22px, 4vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          textWrap: 'balance',
          margin: 0,
        }}
      >
        Turn fabric into outfits
      </h2>

      <div
        className="flex items-center justify-between"
        style={{ gap: '8px', marginTop: '22px', maxWidth: '560px' }}
      >
        {STEPS.map((step, i) => (
          <React.Fragment key={step.src}>
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: 'clamp(84px, 24%, 140px)',
                aspectRatio: '81 / 116',
                borderRadius: '15px',
                background: step.bg,
              }}
            >
              <Image src={step.src} alt={step.alt} fill sizes="140px" style={{ objectFit: 'cover' }} />
            </div>
            {i === 0 && <Plus size={20} color="#FFFFFF" strokeWidth={2.5} aria-hidden />}
            {i === 1 && <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} aria-hidden />}
          </React.Fragment>
        ))}
      </div>

      <Link
        href="/bespoke"
        className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          marginTop: '22px',
          height: '50px',
          maxWidth: '560px',
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        Create my look
      </Link>
    </section>
  );
}
