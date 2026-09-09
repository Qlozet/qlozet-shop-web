// Delivery estimate for the PDP.
//
// The range is built from two real parts: the product's own turnaround_days
// (the vendor's making time, clothing only) plus a platform-wide courier
// transit buffer that admins tune in Settings → Orders. It is an ESTIMATE for
// display — the On-Time Promise machinery works off order deadlines, not this.

import { api } from './api';

export interface TransitBuffer {
  min: number;
  max: number;
}

// Matches the backend schema defaults; also covers deployed backends that
// don't have GET /config/public yet.
export const DEFAULT_TRANSIT_BUFFER: TransitBuffer = { min: 2, max: 5 };

let cached: Promise<TransitBuffer> | null = null;

/** Fetch the admin-tuned transit buffer once per page load; never throws. */
export function fetchTransitBuffer(): Promise<TransitBuffer> {
  if (!cached) {
    cached = api
      .get('/config/public')
      .then((res) => {
        const d = res.data?.data ?? res.data;
        const min = Number(d?.delivery_transit_min_days);
        const max = Number(d?.delivery_transit_max_days);
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
          return DEFAULT_TRANSIT_BUFFER;
        }
        return { min, max: Math.max(min, max) };
      })
      .catch(() => DEFAULT_TRANSIT_BUFFER);
  }
  return cached;
}

export interface DeliveryRange {
  start: Date;
  end: Date;
  /** e.g. "19 – 22 Sep" or "28 Sep – 1 Oct" */
  label: string;
}

export function deliveryRange(
  turnaroundDays: number | null | undefined,
  buffer: TransitBuffer,
  from: Date = new Date(),
): DeliveryRange {
  const lead = turnaroundDays ?? 0;
  const start = addDays(from, lead + buffer.min);
  const end = addDays(from, lead + buffer.max);
  return { start, end, label: formatRange(start, end) };
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function formatRange(a: Date, b: Date): string {
  const mon = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short' });
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${b.getDate()} ${mon(a)}`;
  }
  return `${a.getDate()} ${mon(a)} – ${b.getDate()} ${mon(b)}`;
}
