'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Scissors } from 'lucide-react';

// The steps a tailor would take, shown while the picture is being made. They
// move on a timer: the job reports no real progress, so they never claim a
// percentage, and the last step holds until the picture arrives.
const NEW_STEPS = ['Reading your choices', 'Cutting the pattern', 'Draping your fabric', 'Adding the details', 'Final stitches'];
const REFINE_STEPS = ['Reading your change', 'Unpicking the seams', 'Making your change', 'Final stitches'];
const BACK_STEPS = ['Turning it round', 'Matching the fabric', 'Drawing the back', 'Final stitches'];
const STEP_MS = 7000;

export const GeneratingView: React.FC<{
  refining: boolean;
  /** The version being changed (refine) — shown softly behind the steps. */
  baseImage?: string | null;
  /** What's picked, as chips, so the wait shows what's being made. */
  summary?: string[];
  /** Making the back of the version on screen. */
  backView?: boolean;
}> = ({ refining: refiningProp, baseImage, summary = [], backView = false }) => {
  // A back view works from the version on screen, like a refine.
  const refining = refiningProp || backView;
  const steps = backView ? BACK_STEPS : refining ? REFINE_STEPS : NEW_STEPS;
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      const elapsed = Date.now() - started;
      setSeconds(Math.floor(elapsed / 1000));
      setStep(Math.min(steps.length - 1, Math.floor(elapsed / STEP_MS)));
    }, 1000);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {refining && baseImage && (
        <div className="absolute inset-0 lg:max-w-[680px] lg:mx-auto" aria-hidden style={{ filter: 'blur(6px)', opacity: 0.35 }}>
          <Image src={baseImage} alt="" fill unoptimized style={{ objectFit: 'contain' }} />
        </div>
      )}
      <div className="relative flex flex-col items-center text-center" style={{ gap: '18px', maxWidth: '320px', padding: '0 16px' }} role="status" aria-live="polite">
        <div
          className="flex items-center justify-center studio-needle"
          style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)' }}
        >
          <Scissors size={28} color="#B8962E" />
        </div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{steps[step]}…</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {seconds < 60 ? 'This can take a minute or two' : 'Still working. Busy times take a little longer'}
          </p>
        </div>
        {/* Step dots */}
        <div className="flex" style={{ gap: '6px' }} aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? '18px' : '6px',
                height: '6px',
                borderRadius: '6px',
                background: i <= step ? '#B8962E' : 'var(--border-glass)',
                transition: 'width 300ms ease',
              }}
            />
          ))}
        </div>
        {!refining && summary.length > 0 && (
          <div className="flex flex-wrap justify-center" style={{ gap: '6px' }}>
            {summary.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{
                  padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                  background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes studioSnip { 0%, 100% { transform: rotate(-8deg) } 50% { transform: rotate(8deg) } }
        .studio-needle { animation: studioSnip 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .studio-needle { animation: none; } }
      `}</style>
    </div>
  );
};
