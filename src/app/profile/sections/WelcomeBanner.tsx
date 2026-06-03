'use client';

import React from 'react';
import Image from 'next/image';

export default function WelcomeBanner() {
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ borderRadius: '24px', height: '80vh' }}
    >
      <Image
        src="/image/slim-girl-1.jpg"
        alt="Welcome to Qlozet"
        fill
        style={{ objectFit: 'cover', objectPosition: 'top center' }}
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)' }} />
      <div className="absolute flex flex-col" style={{ bottom: '32px', left: '32px', right: '32px', gap: '4px' }}>
        <h2
          className="font-display font-extrabold uppercase text-white"
          style={{ fontSize: 'clamp(24px, 4vw, 38px)', lineHeight: 1.1, letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
        >
          Hi There Welcome<br />To Qlozet
        </h2>
      </div>
    </div>
  );
}
