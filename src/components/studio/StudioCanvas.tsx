'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface StudioCanvasProps {
  currentImage: string | null;
  isGenerating: boolean;
  referenceImages: string[];
  isLoading?: boolean;
  /** Every version made in this design, oldest first. */
  versions?: string[];
  activeIndex?: number;
  onSelectVersion?: (index: number) => void;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  currentImage,
  isGenerating,
  isLoading = false,
  versions = [],
  activeIndex = 0,
  onSelectVersion,
}) => (
  // lg:pr-[540px] reserves the right-hand furniture instead of ignoring it.
  // The config panel sits at right:24px and is 380px wide, and the floating
  // toolbar at right:420px is about 112px across - so roughly 532px from the
  // right edge is already spoken for. The canvas used to span the full
  // viewport and centre a 680px image in it, which overlapped the toolbar on
  // anything narrower than about 1744px: most laptops.
  //
  // Padding the CONTAINER rather than the image matters. The image stays
  // centred, just within the space it actually has, so it never sits
  // off-centre in its own frame and shrinks gracefully on a small laptop
  // rather than sliding under the controls.
  <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pt-[72px] pb-4 px-4 lg:pt-0 lg:pb-0 lg:pl-0 lg:pr-[540px]">
    {/* Card Wrapper */}
    <div className="relative w-full h-full lg:w-full lg:h-full lg:max-w-none lg:max-h-none max-w-[500px] max-h-[800px] flex items-center justify-center lg:bg-transparent rounded-[32px] lg:rounded-none">

      {/* Canvas content */}
      {isLoading ? (
        // Loading saved design state
        <div className="flex flex-col items-center animate-pulse" style={{ gap: '16px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(70,40,20,0.08)' }}
          >
            <Loader2 size={32} color="var(--brand-brown)" className="animate-spin" />
          </div>
          <div className="text-center">
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Loading saved design...</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Retrieving your customization</p>
          </div>
        </div>
      ) : isGenerating ? (
        // Generating state
        <div className="flex flex-col items-center animate-pulse" style={{ gap: '16px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)' }}
          >
            <Loader2 size={32} color="#7C3AED" className="animate-spin" />
          </div>
          <div className="text-center">
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Generating your outfit...</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>This may take a moment</p>
          </div>
        </div>
      ) : currentImage ? (
        // Generated image
        <div className="relative animate-fade-in w-full h-full lg:max-w-[680px] lg:max-h-[95%]">
          <Image src={currentImage} alt="Generated outfit" fill style={{ objectFit: 'contain', padding: '8px' }} />
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center" style={{ gap: '16px' }}>
          <div className="relative w-[120px] h-[160px] opacity-20">
            <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M80 10 L60 40 L40 40 L30 80 L25 140 L45 180 L80 190 L115 180 L135 140 L130 80 L120 40 L100 40 Z" stroke="var(--text-muted)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M60 40 Q80 60 100 40" stroke="var(--text-muted)" strokeWidth="4" />
              <path d="M30 80 L25 140" stroke="var(--text-muted)" strokeWidth="4" />
              <path d="M130 80 L135 140" stroke="var(--text-muted)" strokeWidth="4" />
            </svg>
          </div>
          <div className="text-center px-6">
            <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              NO DESIGN YET?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5, maxWidth: '280px' }}>
              Select a style, fabric, and details — then tap Generate to preview your outfit.
            </p>
          </div>
        </div>
      )}

      {/* Versions — every Generate is kept; tap one to bring it back. The
          one on screen is what Save and Get Quotes use as the cover. Top on
          phones (the bottom sheet covers the lower half), bottom on desktop. */}
      {versions.length > 1 && !isLoading && (
        <div
          className="absolute z-10 left-1/2 -translate-x-1/2 top-3 lg:top-auto lg:bottom-6 flex items-center max-w-[calc(100%-24px)] overflow-x-auto"
          style={{
            gap: '6px',
            padding: '6px',
            borderRadius: '14px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          }}
          role="group"
          aria-label="Versions"
        >
          {versions.map((src, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={`${i}-${src}`}
                type="button"
                onClick={() => onSelectVersion?.(i)}
                disabled={isGenerating}
                aria-label={`Version ${i + 1}${active ? ' (showing)' : ''}`}
                aria-pressed={active}
                className="relative flex-shrink-0 overflow-hidden transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2"
                style={{
                  width: '40px',
                  height: '52px',
                  borderRadius: '9px',
                  padding: 0,
                  cursor: isGenerating ? 'default' : 'pointer',
                  background: 'var(--bg-surface-elevated)',
                  border: active ? '2px solid var(--text-primary)' : '2px solid transparent',
                  opacity: active ? 1 : 0.75,
                }}
              >
                <Image src={src} alt="" fill unoptimized style={{ objectFit: 'cover' }} />
                <span
                  className="absolute"
                  style={{
                    left: '3px', bottom: '3px', fontSize: '9px', fontWeight: 800,
                    color: '#FFF', background: 'rgba(0,0,0,0.55)', borderRadius: '4px', padding: '0 3px', lineHeight: '13px',
                  }}
                >
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
