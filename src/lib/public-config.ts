// Public storefront config — the admin-tuned display/limit knobs the backend
// exposes without auth via GET /config/public. Fetched once per page load;
// the defaults double as the fallback for backends deployed before a given
// field (or the endpoint itself) existed.

import { api } from './api';

export interface PublicConfig {
  delivery_transit_min_days: number;
  delivery_transit_max_days: number;
  max_quote_vendors_per_design: number;
  /** Days a vendor has to ship an item with no making time of its own. */
  default_turnaround_days: number;
}

export const PUBLIC_CONFIG_DEFAULTS: PublicConfig = {
  delivery_transit_min_days: 2,
  delivery_transit_max_days: 5,
  max_quote_vendors_per_design: 5,
  default_turnaround_days: 3,
};

let cached: Promise<PublicConfig> | null = null;

/** Fetch the public config once per page load; never throws. */
export function fetchPublicConfig(): Promise<PublicConfig> {
  if (!cached) {
    cached = api
      .get('/config/public')
      .then((res) => {
        const d = res.data?.data ?? res.data;
        const num = (v: unknown, fallback: number) => {
          const n = Number(v);
          return Number.isFinite(n) && n > 0 ? n : fallback;
        };
        return {
          delivery_transit_min_days: Number.isFinite(Number(d?.delivery_transit_min_days))
            ? Number(d.delivery_transit_min_days)
            : PUBLIC_CONFIG_DEFAULTS.delivery_transit_min_days,
          delivery_transit_max_days: num(
            d?.delivery_transit_max_days,
            PUBLIC_CONFIG_DEFAULTS.delivery_transit_max_days,
          ),
          max_quote_vendors_per_design: num(
            d?.max_quote_vendors_per_design,
            PUBLIC_CONFIG_DEFAULTS.max_quote_vendors_per_design,
          ),
          default_turnaround_days: num(
            d?.default_turnaround_days,
            PUBLIC_CONFIG_DEFAULTS.default_turnaround_days,
          ),
        };
      })
      .catch(() => PUBLIC_CONFIG_DEFAULTS);
  }
  return cached;
}
