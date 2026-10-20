'use client';

// One vendor's delivery: courier, a timeline of every courier update, and the
// tracking code (or a link to the courier's page) underneath as a backup.

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Truck } from 'lucide-react';
import type { Parcel } from '../types';
import { cardStyle } from '../styles';

const EVENT_LABELS: Record<string, string> = {
  booked: 'Booked with the courier',
  picked_up: 'Collected by the courier',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Delivered',
  failed: 'Delivery failed',
  cancelled: 'Delivery cancelled',
};

const PROBLEM = new Set(['failed', 'cancelled']);

const label = (status: string) =>
  EVENT_LABELS[status] ??
  status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const when = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Shown before the courier has the parcel, from the shipment's own state. */
const waitingLine = (p: Parcel) =>
  p.status === 'pending' || !p.status
    ? 'The vendor is preparing this parcel.'
    : 'Waiting for the courier to collect it.';

export function ParcelTimeline({
  parcel,
  index,
  total,
}: {
  parcel: Parcel;
  index: number;
  total: number;
}) {
  const [copied, setCopied] = useState(false);
  const events = [...parcel.events].reverse(); // newest first
  const latest = events[0];

  const copy = async () => {
    if (!parcel.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(parcel.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the code is still on screen to copy by hand.
    }
  };

  return (
    <div style={cardStyle}>
      <div className="flex flex-col" style={{ padding: '18px 20px', gap: '14px' }}>
        {/* Header */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-fill)' }}
          >
            <Truck size={18} color="var(--brand-fill-text)" />
          </div>
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {total > 1 ? `Parcel ${index + 1} of ${total}` : 'Your parcel'}
              {parcel.vendor ? ` · ${parcel.vendor}` : ''}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: latest && PROBLEM.has(latest.status) ? '#DC2626' : 'var(--text-muted)',
              }}
            >
              {latest ? label(latest.status) : waitingLine(parcel)}
              {parcel.courier ? ` · ${parcel.courier}` : ''}
            </span>
          </div>
        </div>

        {/* Timeline, newest first */}
        {events.length > 0 && (
          <ol className="flex flex-col" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {events.map((e, i) => {
              const first = i === 0;
              const last = i === events.length - 1;
              const problem = PROBLEM.has(e.status);
              return (
                <li key={`${e.status}-${e.at}`} className="flex" style={{ gap: '12px' }}>
                  <div className="flex flex-col items-center" style={{ width: '12px', flexShrink: 0 }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        marginTop: '3px',
                        background: problem
                          ? '#DC2626'
                          : first
                            ? 'var(--brand-fill)'
                            : 'var(--border-glass)',
                      }}
                    />
                    {!last && (
                      <span style={{ flex: 1, width: '2px', background: 'var(--border-glass)', minHeight: '18px' }} />
                    )}
                  </div>
                  <div className="flex flex-col" style={{ paddingBottom: last ? 0 : '12px', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: first ? 700 : 500,
                        color: problem
                          ? '#DC2626'
                          : first
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {label(e.status)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {when(e.at)}
                      {e.message ? ` · ${e.message}` : ''}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Backup: the courier's own page, or the code to quote to them */}
        {(parcel.trackingNumber || parcel.trackingUrl) && (
          <div
            className="flex items-center justify-between flex-wrap"
            style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', gap: '10px' }}
          >
            {parcel.trackingNumber && (
              <div className="flex items-center" style={{ gap: '8px', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tracking</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--brand-brown)',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {parcel.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy tracking number"
                  className="flex items-center justify-center"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-base)',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} color="#0F6E4F" /> : <Copy size={12} color="var(--text-muted)" />}
                </button>
              </div>
            )}
            {parcel.trackingUrl && (
              <a
                href={parcel.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
                style={{ gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--brand-brown)' }}
              >
                Track on courier site <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
