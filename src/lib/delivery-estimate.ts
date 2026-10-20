// Delivery estimate for the PDP.
//
// The range is built from two real parts: the product's own turnaround_days
// (the vendor's making time, clothing only) plus a platform-wide courier
// transit buffer that admins tune in Settings → Orders. An item with no making
// time of its own (fabric, accessories) may ship the same day or as late as
// the platform's default time to ship, so that window widens only the end of
// the range. It is an ESTIMATE for
// display — the On-Time Promise machinery works off order deadlines, not this.

import { fetchPublicConfig, PUBLIC_CONFIG_DEFAULTS } from './public-config';

export interface TransitBuffer {
  min: number;
  max: number;
  /** Platform default time to ship, for items with no turnaround of their own. */
  shipWithin?: number;
}

// Matches the backend schema defaults; also covers deployed backends that
// don't have GET /config/public yet.
export const DEFAULT_TRANSIT_BUFFER: TransitBuffer = {
  min: PUBLIC_CONFIG_DEFAULTS.delivery_transit_min_days,
  max: PUBLIC_CONFIG_DEFAULTS.delivery_transit_max_days,
  shipWithin: PUBLIC_CONFIG_DEFAULTS.default_turnaround_days,
};

/** Fetch the admin-tuned transit buffer once per page load; never throws. */
export function fetchTransitBuffer(): Promise<TransitBuffer> {
  return fetchPublicConfig().then((cfg) => ({
    min: cfg.delivery_transit_min_days,
    max: Math.max(cfg.delivery_transit_min_days, cfg.delivery_transit_max_days),
    shipWithin: cfg.default_turnaround_days,
  }));
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
  const own = turnaroundDays && turnaroundDays > 0 ? turnaroundDays : null;
  const start = addDays(from, (own ?? 0) + buffer.min);
  const end = addDays(from, (own ?? buffer.shipWithin ?? 0) + buffer.max);
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
