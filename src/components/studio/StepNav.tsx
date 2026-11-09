'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
}

/** "Step 2 of 4" for a header. Empty when the section isn't one of the steps. */
export function stepCount(steps: Step[], current: string): string {
  const i = steps.findIndex((s) => s.id === current);
  return i < 0 ? '' : `Step ${i + 1} of ${steps.length}`;
}

const nice = (label: string) => label.charAt(0) + label.slice(1).toLowerCase();

// The way through a panel's tabs one at a time, shown at the foot of each
// tab: back to the previous one, on to the next. The tabs stay for jumping
// around; this is for anyone who'd rather be walked through. On the last tab
// it says what to do next instead.
export function StepNav({
  steps,
  current,
  onGo,
  lastHint,
}: {
  steps: Step[];
  current: string;
  onGo: (id: string) => void;
  /** Shown on the last step, e.g. "That's everything. Tap Done to keep it." */
  lastHint: string;
}) {
  const i = steps.findIndex((s) => s.id === current);
  if (i < 0 || steps.length < 2) return null;
  const prev = steps[i - 1];
  const next = steps[i + 1];

  return (
    <div className="flex flex-col" style={{ padding: '4px 20px 16px', gap: '10px' }}>
      {!next && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>{lastHint}</p>
      )}
      <div className="flex items-center" style={{ gap: '10px' }}>
        {prev ? (
          <button
            type="button"
            onClick={() => onGo(prev.id)}
            className="flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              flex: next ? '0 0 auto' : 1,
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} />
            {nice(prev.label)}
          </button>
        ) : null}
        {next && (
          <button
            type="button"
            onClick={() => onGo(next.id)}
            className="flex-1 flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--text-primary)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              gap: '6px',
            }}
          >
            Next: {nice(next.label)}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
