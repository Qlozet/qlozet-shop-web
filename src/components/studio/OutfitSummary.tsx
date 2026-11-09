'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import {
  outfitHeadline,
  type OutfitLine,
  type OutfitSection,
  type OutfitTotals,
} from '@/lib/outfit-summary';

export interface OutfitSummaryData {
  lines: OutfitLine[];
  totals: OutfitTotals;
  /** The server price is being worked out for the latest change. */
  pricing: boolean;
}

// The breakdown table, shared by the panel's summary and the review card.
// Tapping a line jumps to the tab where it can be changed.
export function OutfitBreakdown({
  data,
  onJump,
}: {
  data: OutfitSummaryData;
  onJump?: (section: OutfitSection) => void;
}) {
  const { fmt } = useCurrency();
  const { lines, totals, pricing } = data;
  const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '12px',
    padding: '7px 0',
  };
  return (
    <div className="flex flex-col" style={{ opacity: pricing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <div style={row}>
        <span style={{ color: 'var(--text-secondary)' }}>Tailoring</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(totals.tailoring)}</span>
      </div>
      {lines.map((l) => {
        const price = l.price === null ? '' : l.price > 0 ? `+${fmt(l.price)}` : 'Included';
        const content = (
          <>
            <span className="truncate" style={{ color: 'var(--text-secondary)', minWidth: 0 }}>
              {l.label}: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.value}</span>
            </span>
            <span className="flex items-center" style={{ gap: '4px', flexShrink: 0, color: l.price ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {price}
              {onJump && <ChevronRight size={12} color="var(--text-muted)" />}
            </span>
          </>
        );
        return onJump ? (
          <button
            key={l.key}
            type="button"
            onClick={() => onJump(l.section)}
            className="transition-opacity hover:opacity-70"
            style={{ ...row, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            {content}
          </button>
        ) : (
          <div key={l.key} style={row}>
            {content}
          </div>
        );
      })}
      {totals.discount > 0 && (
        <div style={row}>
          <span style={{ color: 'var(--text-secondary)' }}>Discount</span>
          <span style={{ color: '#2D6A4F', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>−{fmt(totals.discount)}</span>
        </div>
      )}
      <div style={{ ...row, borderTop: '1px solid var(--border-glass)', marginTop: '4px', paddingTop: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Total</span>
        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(totals.total)}</span>
      </div>
    </div>
  );
}

/** "+₦6,000 for your choices" / "−₦2,000 for your choices" / nothing. */
export function useVsPictured(totals: OutfitTotals): string | null {
  const { fmt } = useCurrency();
  const d = Math.round(totals.vsPictured);
  if (Math.abs(d) < 1) return null;
  return `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))} for your choices`;
}

// The live strip above the panel's buttons: the outfit in a line and its
// price right now, with the full breakdown a tap away.
export function OutfitSummary({
  data,
  onJump,
}: {
  data: OutfitSummaryData;
  onJump: (section: OutfitSection) => void;
}) {
  const { fmt } = useCurrency();
  const [open, setOpen] = useState(false);
  const vs = useVsPictured(data.totals);
  const headline = outfitHeadline(data.lines);

  return (
    <div
      className="shrink-0 flex flex-col"
      style={{ margin: '0 24px 10px', borderRadius: '14px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', padding: '12px 14px' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex flex-col w-full text-left"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', gap: '4px' }}
      >
        {headline && (
          <span className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)', width: '100%' }}>
            {headline}
          </span>
        )}
        <span className="flex items-center justify-between w-full" style={{ gap: '10px' }}>
          <span className="flex items-baseline" style={{ gap: '8px', minWidth: 0, opacity: data.pricing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(data.totals.total)}
            </span>
            {vs && (
              <span className="truncate" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {vs}
              </span>
            )}
          </span>
          <span className="flex items-center" style={{ gap: '2px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
            Details
            <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </span>
        </span>
      </button>
      {open && (
        <div className="overflow-y-auto hide-scrollbar" style={{ maxHeight: '220px', marginTop: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '4px' }}>
          <OutfitBreakdown data={data} onJump={(s) => { setOpen(false); onJump(s); }} />
        </div>
      )}
    </div>
  );
}
