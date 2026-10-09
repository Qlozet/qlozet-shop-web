'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Ranked tailors for one bespoke design —
// GET /bespoke/designs/:id/suggested-vendors, or
// GET /bespoke/suggested-vendors?category=&fabric_id= before the design is
// saved, which is the usual case.
//
// Design-scoped rather than the generic vendor list, because the two best
// signals depend on the design: who supplies its fabric (and so avoids the
// cross-vendor transfer cost) and who makes that kind of garment.

export interface SuggestionReason {
  code:
    | 'fabric_owner'
    | 'category_match'
    | 'well_rated'
    | 'reliable'
    | 'experienced'
    | 'verified'
    | 'new_here';
  label: string;
}

export interface SuggestedVendor {
  _id: string;
  business_name: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  business_category?: string;
  city?: string;
  state?: string;
  average_rating: number;
  total_ratings: number;
  success_rate?: number;
  total_items_sold?: number;
  accepts_external_fabric?: boolean;
  /** The platform's own verification tier. */
  verified: boolean;
  reasons: SuggestionReason[];
}

interface Payload {
  vendors: SuggestedVendor[];
  total: number;
  ranked_by: string[];
}

const EMPTY: Payload = { vendors: [], total: 0, ranked_by: [] };

// Same envelope dig as the other hooks: the interceptor wraps the service's
// `{ data }` in its own, so the payload sits a couple of levels down.
function dig(value: unknown): Payload {
  let node = value as Record<string, unknown> | undefined;
  for (let i = 0; i < 4; i += 1) {
    if (!node || typeof node !== 'object') return EMPTY;
    if (Array.isArray((node as unknown as Payload).vendors)) break;
    node = node.data as Record<string, unknown> | undefined;
  }
  const payload = node as unknown as Payload | undefined;
  if (!payload || !Array.isArray(payload.vendors)) return EMPTY;
  return {
    vendors: payload.vendors,
    total: typeof payload.total === 'number' ? payload.total : payload.vendors.length,
    ranked_by: Array.isArray(payload.ranked_by) ? payload.ranked_by : [],
  };
}

const FAILED = 'Could not rank tailors for this design.';

/**
 * Shared machinery for both forms below.
 *
 * The effect sets no state before its first await, which keeps it off
 * React's cascading-render path, and it guards against a slow answer landing
 * after a newer one — changing the fabric mid-flight should not resurrect the
 * previous ranking.
 */
function useRankedVendors(fetcher: () => Promise<Payload>, enabled: boolean) {
  const [payload, setPayload] = useState<Payload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void (async () => {
      try {
        const next = await fetcher();
        if (cancelled) return;
        setPayload(next);
        setError(null);
      } catch {
        if (cancelled) return;
        // The caller falls back to the plain vendor list, so this is a quiet
        // degradation rather than a dead end.
        setError(FAILED);
        setPayload(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, fetcher]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await fetcher());
      setError(null);
    } catch {
      setError(FAILED);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { ...payload, loading, error, refetch };
}

export function useSuggestedVendors(
  designId: string | null | undefined,
  opts: { enabled?: boolean; limit?: number } = {}
) {
  const { enabled = true, limit = 8 } = opts;

  const fetcher = useCallback(async () => {
    if (!designId) return EMPTY;
    const res = await api.get(
      `/bespoke/designs/${encodeURIComponent(designId)}/suggested-vendors`,
      { params: { limit } }
    );
    return dig(res.data);
  }, [designId, limit]);

  return useRankedVendors(fetcher, enabled && Boolean(designId));
}

/**
 * The same ranking before the design exists.
 *
 * The studio only saves a design when quotes are requested, so a first quote
 * request has no id to rank against — which is the usual case. Category and
 * fabric are all the ranking needs, and the studio has both.
 */
export function useSuggestedVendorsForCriteria(opts: {
  category?: string;
  fabricId?: string;
  enabled?: boolean;
  limit?: number;
}) {
  const { category, fabricId, enabled = true, limit = 8 } = opts;

  const fetcher = useCallback(async () => {
    const res = await api.get('/bespoke/suggested-vendors', {
      params: {
        limit,
        ...(category ? { category } : {}),
        ...(fabricId ? { fabric_id: fabricId } : {}),
      },
    });
    return dig(res.data);
  }, [category, fabricId, limit]);

  return useRankedVendors(fetcher, enabled);
}
