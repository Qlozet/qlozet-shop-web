'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, RotateCcw, X } from 'lucide-react';
import { GeneratingView } from './GeneratingView';

interface StudioCanvasProps {
  /** The front of the version on screen. */
  currentImage: string | null;
  /** What to draw: the back view when it's switched on, else the front. */
  displayImage?: string | null;
  isGenerating: boolean;
  referenceImages: string[];
  isLoading?: boolean;
  /** Every version made in this design, oldest first. */
  versions?: string[];
  activeIndex?: number;
  onSelectVersion?: (index: number) => void;
  /** Delete a version; it never reaches a tailor. */
  onDeleteVersion?: (index: number) => void;
  /** A refine is running (the wait shows the version being changed). */
  isRefining?: boolean;
  /** What's picked, shown while a new version is made. */
  summary?: string[];
  /** The version on screen has a back view. */
  hasBack?: boolean;
  showingBack?: boolean;
  onShowBack?: (on: boolean) => void;
  /** Make the back of the version on screen. */
  onMakeBack?: () => void;
  isMakingBack?: boolean;
  /** Tokens a back view costs (same as a refine). */
  backCost?: number;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  currentImage,
  displayImage,
  isGenerating,
  isLoading = false,
  versions = [],
  activeIndex = 0,
  onSelectVersion,
  onDeleteVersion,
  isRefining = false,
  summary = [],
  hasBack = false,
  showingBack = false,
  onShowBack,
  onMakeBack,
  isMakingBack = false,
  backCost,
}) => {
  const shown = displayImage ?? currentImage;
  const bar = (className: string) => (
    <DesignBar
      className={className}
      versions={versions}
      activeIndex={activeIndex}
      onSelect={onSelectVersion}
      onDelete={onDeleteVersion}
      disabled={isGenerating}
      show={!!currentImage && !isLoading && !isGenerating}
      hasBack={hasBack}
      showingBack={showingBack}
      onShowBack={onShowBack}
      onMakeBack={onMakeBack}
      backCost={backCost}
    />
  );

  return (
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
          <GeneratingView
            refining={isRefining}
            backView={isMakingBack}
            baseImage={isMakingBack ? currentImage : shown}
            summary={summary}
          />
        ) : shown ? (
          // Generated image
          <div className="relative animate-fade-in w-full h-full lg:max-w-[680px] lg:max-h-[95%]">
            <Image
              src={shown}
              alt={showingBack && hasBack ? 'Back of your design' : 'Your design'}
              fill
              style={{ objectFit: 'contain', padding: '8px' }}
            />
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

        {/* Desktop: centred under the design, inside its frame. */}
        {bar('hidden lg:flex bottom-6 max-w-[calc(100%-24px)]')}
      </div>

      {/* Phones: pinned to the canvas just below the 72px header. The picture
          frame runs up behind the header there, so a bar placed inside it
          ended up hidden; the bottom sheet covers the lower half. */}
      {bar('flex lg:hidden top-[84px] max-w-[calc(100%-32px)]')}
    </div>
  );
};

/**
 * Under the design: every version made (each Generate or Refine is kept; tap
 * one to bring it back, × to delete it), and Front / Back. The version on
 * screen is the one tailors make: Save and Get Quotes send it as the cover.
 */
const DesignBar: React.FC<{
  className: string;
  versions: string[];
  activeIndex: number;
  onSelect?: (index: number) => void;
  onDelete?: (index: number) => void;
  disabled: boolean;
  show: boolean;
  hasBack: boolean;
  showingBack: boolean;
  onShowBack?: (on: boolean) => void;
  onMakeBack?: () => void;
  backCost?: number;
}> = ({
  className, versions, activeIndex, onSelect, onDelete, disabled, show,
  hasBack, showingBack, onShowBack, onMakeBack, backCost,
}) => {
  // Deleting takes two taps: × arms it, the second tap deletes.
  const [armed, setArmed] = useState<number | null>(null);
  useEffect(() => {
    if (armed === null) return;
    const t = setTimeout(() => setArmed(null), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  if (!show) return null;
  const pill: React.CSSProperties = {
    height: '30px', padding: '0 10px', borderRadius: '9px', border: 'none',
    fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  };

  return (
    <div
      className={`absolute z-10 left-1/2 -translate-x-1/2 items-center overflow-x-auto ${className}`}
      style={{
        gap: '6px',
        padding: '6px',
        borderRadius: '14px',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      }}
    >
      {versions.length > 1 && (
        <div className="flex items-center" style={{ gap: '6px' }} role="group" aria-label="Versions">
          {versions.map((src, i) => {
            const active = i === activeIndex;
            const isArmed = armed === i;
            return (
              <div key={`${i}-${src}`} className="relative flex-shrink-0" style={{ width: '40px', height: '52px' }}>
                <button
                  type="button"
                  onClick={() => onSelect?.(i)}
                  disabled={disabled}
                  aria-label={`Version ${i + 1}${active ? ' (showing)' : ''}`}
                  aria-pressed={active}
                  className="relative w-full h-full overflow-hidden transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2"
                  style={{
                    borderRadius: '9px',
                    padding: 0,
                    cursor: disabled ? 'default' : 'pointer',
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
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isArmed) {
                        setArmed(null);
                        onDelete(i);
                      } else setArmed(i);
                    }}
                    disabled={disabled}
                    aria-label={isArmed ? `Tap again to delete version ${i + 1}` : `Delete version ${i + 1}`}
                    title={isArmed ? 'Tap again to delete' : 'Delete this version'}
                    className="absolute flex items-center justify-center focus-visible:outline focus-visible:outline-2"
                    style={{
                      top: '-5px', right: '-5px', height: '18px',
                      minWidth: '18px', padding: isArmed ? '0 5px' : 0,
                      borderRadius: '9px', border: '1.5px solid var(--bg-base)',
                      background: isArmed ? '#C0392B' : 'rgba(0,0,0,0.65)',
                      color: '#FFF', fontSize: '9px', fontWeight: 800, cursor: 'pointer',
                    }}
                  >
                    {isArmed ? 'Delete' : <X size={10} strokeWidth={3} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {versions.length > 1 && (
        <span aria-hidden style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border-glass)', margin: '2px 2px' }} />
      )}

      {/* Front / Back of the version on screen */}
      {hasBack ? (
        <div className="flex items-center" style={{ gap: '2px', padding: '2px', borderRadius: '11px', background: 'var(--bg-surface-elevated)' }} role="group" aria-label="Side">
          {(['Front', 'Back'] as const).map((side) => {
            const on = (side === 'Back') === showingBack;
            return (
              <button
                key={side}
                type="button"
                onClick={() => onShowBack?.(side === 'Back')}
                aria-pressed={on}
                style={{
                  ...pill,
                  height: '26px',
                  background: on ? 'var(--text-primary)' : 'transparent',
                  color: on ? 'var(--bg-base)' : 'var(--text-secondary)',
                }}
              >
                {side}
              </button>
            );
          })}
          {onMakeBack && (
            <button
              type="button"
              onClick={onMakeBack}
              title={`Make the back again${backCost ? ` (${backCost} tokens)` : ''}`}
              aria-label="Make the back again"
              style={{ ...pill, height: '26px', padding: '0 7px', background: 'transparent', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      ) : (
        onMakeBack && (
          <button
            type="button"
            onClick={onMakeBack}
            style={{ ...pill, background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}
            title="See the back of this design. Tailors get it with the front."
          >
            See the back{backCost ? <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}> · {backCost}</span> : null}
          </button>
        )
      )}
    </div>
  );
};
