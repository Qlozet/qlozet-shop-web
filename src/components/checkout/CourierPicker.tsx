'use client';

// One shipping row per vendor at checkout. Each vendor ships its own parcel,
// so each needs a courier, but listing every courier for every vendor made a
// three-vendor cart a wall of options. The row shows the courier already
// picked (the cheapest) and when it arrives; "Change" opens the others.

import { useState } from 'react';
import Image from 'next/image';
import type { CourierRate } from '@/lib/api-types';

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rates: CourierRate[];
  selectedId?: string | number;
  onSelect: (rate: CourierRate) => void;
  formatMoney: (n: number) => string;
  /** "Arrives" for parcels to the customer, "Reaches the tailor" for fabric. */
  arrivalVerb?: string;
  accent?: string;
}

/** "Arrives 23 – 24 Nov", from the backend's dates, or the courier's phrase. */
export function arrivalLabel(rate: CourierRate, verb = 'Arrives'): string {
  if (rate.arrives_from && rate.arrives_to) {
    return `${verb} ${formatDayRange(parseDay(rate.arrives_from), parseDay(rate.arrives_to))}`;
  }
  // An older backend without arrival dates: the courier's own words.
  const phrase = [rate.delivery_eta, rate.delivery_eta_time].find(
    (t) => t && !/\d{4}-\d{2}-\d{2}/.test(String(t)),
  );
  return phrase ? String(phrase) : '';
}

function parseDay(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatDayRange(a: Date, b: Date): string {
  const mon = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
  if (a.getTime() === b.getTime()) return `${a.getDate()} ${mon(a)}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${b.getDate()} ${mon(a)}`;
  }
  return `${a.getDate()} ${mon(a)} – ${b.getDate()} ${mon(b)}`;
}

const sortKey = (r: CourierRate) => r.arrives_to ?? '';

export function CourierPicker({
  title,
  subtitle,
  rates,
  selectedId,
  onSelect,
  formatMoney,
  arrivalVerb = 'Arrives',
  accent = '#064E3B',
}: Props) {
  const [open, setOpen] = useState(false);
  if (!rates.length) return null;

  const selected = rates.find((r) => String(r.courier_id) === String(selectedId)) ?? rates[0];
  const cheapest = rates.reduce((a, b) => (a.rate_amount <= b.rate_amount ? a : b));
  const fastest = rates.reduce((a, b) => (sortKey(a) && sortKey(a) <= sortKey(b) ? a : b));
  const tagFor = (r: CourierRate) =>
    r === cheapest ? 'Cheapest' : r === fastest && sortKey(r) < sortKey(cheapest) ? 'Fastest' : null;
  const sorted = [...rates].sort((a, b) => a.rate_amount - b.rate_amount);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
        {subtitle && (
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
            {subtitle}
          </span>
        )}
      </div>

      {!open ? (
        <div
          className="flex items-center justify-between w-full"
          style={{
            padding: '10px 12px',
            borderRadius: '10px',
            border: `2px solid ${accent}`,
            background: 'var(--bg-surface-elevated)',
            gap: '10px',
          }}
        >
          <RateBody rate={selected} verb={arrivalVerb} tag={tagFor(selected)} />
          <div className="flex items-center" style={{ gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatMoney(selected.rate_amount)}
            </span>
            {rates.length > 1 && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: accent,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 2px',
                  textDecoration: 'underline',
                }}
              >
                Change
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {sorted.map((rate) => {
            const isOn = rate === selected;
            return (
              <button
                type="button"
                key={String(rate.courier_id)}
                onClick={() => {
                  onSelect(rate);
                  setOpen(false);
                }}
                className="flex items-center justify-between w-full"
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isOn ? `2px solid ${accent}` : '1px solid var(--border-glass)',
                  background: 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                  gap: '10px',
                }}
              >
                <RateBody rate={rate} verb={arrivalVerb} tag={tagFor(rate)} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                  {formatMoney(rate.rate_amount)}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              alignSelf: 'flex-start',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            Keep {selected.courier_name}
          </button>
        </div>
      )}
    </div>
  );
}

function RateBody({ rate, verb, tag }: { rate: CourierRate; verb: string; tag: string | null }) {
  const arrival = arrivalLabel(rate, verb);
  return (
    <div className="flex items-center" style={{ gap: '8px', minWidth: 0, textAlign: 'left' }}>
      {rate.courier_image && (
        <Image src={rate.courier_image} alt="" width={20} height={20} style={{ borderRadius: '4px', flexShrink: 0 }} />
      )}
      <div style={{ minWidth: 0 }}>
        <div className="flex items-center" style={{ gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{rate.courier_name}</span>
          {tag && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-glass)',
                borderRadius: '100px',
                padding: '1px 6px',
              }}
            >
              {tag}
            </span>
          )}
        </div>
        {arrival && (
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{arrival}</div>
        )}
      </div>
    </div>
  );
}
