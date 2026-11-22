'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, RotateCcw } from 'lucide-react';
import { storeHref } from '@/lib/store-link';
import { useMyMakers, useOrderAgain, type MyMaker } from '@/hooks/useOrderAgain';

/**
 * "Your tailors": the stores this shopper has bought from, newest first, with
 * Order again for the last listing they bought there. Signed-in shoppers with
 * at least one order only; renders nothing otherwise.
 */
export function YourTailors({ enabled }: { enabled: boolean }) {
  const { makers } = useMyMakers(enabled);
  const { orderAgain, busy } = useOrderAgain();
  if (!makers.length) return null;

  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 900,
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Your tailors
      </span>
      <div
        className="flex overflow-x-auto hide-scrollbar"
        style={{ gap: '10px', scrollbarWidth: 'none', paddingBottom: '2px' }}
      >
        {makers.map((m) => (
          <MakerCard
            key={m.business_id}
            maker={m}
            busy={!!m.reorder_reference && busy === `${m.reorder_reference}:`}
            onOrderAgain={() => m.reorder_reference && orderAgain(m.reorder_reference)}
          />
        ))}
      </div>
    </div>
  );
}

function MakerCard({
  maker,
  busy,
  onOrderAgain,
}: {
  maker: MyMaker;
  busy: boolean;
  onOrderAgain: () => void;
}) {
  const href = storeHref({ slug: maker.slug, _id: maker.business_id });
  const times = maker.orders_count === 1 ? 'Ordered once' : `Ordered ${maker.orders_count} times`;
  const last = lastOrdered(maker.last_ordered_at);

  return (
    <div
      className="flex-shrink-0 flex flex-col"
      style={{
        width: '232px',
        gap: '12px',
        padding: '14px',
        borderRadius: '16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-glass)',
      }}
    >
      <Link href={href} className="flex items-center min-w-0" style={{ gap: '10px', textDecoration: 'none' }}>
        <div
          className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}
        >
          {maker.business_logo_url ? (
            <Image src={maker.business_logo_url} alt={maker.business_name} fill className="object-cover" sizes="44px" />
          ) : (
            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)' }}>
              {maker.business_name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0" style={{ gap: '2px' }}>
          <span
            className="flex items-center"
            style={{ gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{maker.business_name}</span>
            {maker.verified && <BadgeCheck size={13} color="var(--text-primary)" style={{ flexShrink: 0 }} />}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {times}
            {last ? ` · ${last}` : ''}
          </span>
        </div>
      </Link>

      <div className="flex" style={{ gap: '8px' }}>
        {maker.reorder_reference ? (
          <button
            onClick={onOrderAgain}
            disabled={busy}
            className="flex-1 flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              gap: '6px',
              padding: '9px 10px',
              borderRadius: '100px',
              border: 'none',
              cursor: busy ? 'wait' : 'pointer',
              background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            <RotateCcw size={12} /> {busy ? 'Adding…' : 'Order again'}
          </button>
        ) : null}
        <Link
          href={href}
          className="flex-1 flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            padding: '9px 10px',
            borderRadius: '100px',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {maker.reorder_reference ? 'Visit' : 'Visit store'}
        </Link>
      </div>
    </div>
  );
}

/** "Last in March", or "Last this week" for a recent order. */
function lastOrdered(iso: string): string | null {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const days = (Date.now() - d.getTime()) / 86_400_000;
  if (days < 7) return 'last this week';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `last in ${d.toLocaleDateString('en-GB', sameYear ? { month: 'long' } : { month: 'short', year: 'numeric' })}`;
}
