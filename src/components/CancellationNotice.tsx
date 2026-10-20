'use client';

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { api } from '@/lib/api';

// Read once per page load and shared: every custom-item surface shows the
// same number, the one the backend charges.
let cached: Promise<number> | null = null;

const loadPercent = (): Promise<number> => {
  if (!cached) {
    cached = api
      .get('/users/platform-settings')
      .then((res) => {
        const body = res.data?.data ?? res.data;
        const value = Number(body?.custom_cancellation_fee_percent ?? 30);
        return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 30;
      })
      .catch(() => {
        cached = null; // try again next time
        return 30;
      });
  }
  return cached;
};

/** The cancellation fee percentage for custom pieces, from platform settings. */
export function useCancellationFeePercent(): number | null {
  const [percent, setPercent] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    loadPercent().then((p) => live && setPercent(p));
    return () => {
      live = false;
    };
  }, []);
  return percent;
}

/**
 * One line, shown wherever a customer is about to pay for a custom or bespoke
 * piece: cancelling is free until the tailor confirms, then a share is kept
 * for the work already started. Renders nothing when the fee is 0.
 */
export function CancellationNotice({ style }: { style?: React.CSSProperties }) {
  const percent = useCancellationFeePercent();
  if (!percent) return null;
  return (
    <p
      className="flex items-start"
      style={{
        gap: '6px',
        fontSize: '11px',
        lineHeight: 1.45,
        color: 'var(--text-muted)',
        margin: 0,
        ...style,
      }}
    >
      <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span>
        Free cancellation until your tailor confirms. After that, {percent}% of each
        custom piece is kept to cover fabric and work already started.
      </span>
    </p>
  );
}
