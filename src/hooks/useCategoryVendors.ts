'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ApiBusinessPublic, ApiProduct } from '@/lib/api-types';

// Vendors stocking one kind of product, ranked, each with a few items —
// GET /products/discover/vendors.
//
// One request per home row. The page used to fetch the 50 newest products
// once and split them four ways, so the rows competed for a shared budget:
// when recent uploads skewed to clothing, Fabric and Accessories starved, and
// a starved row vanished from the page — not because there was no stock, but
// because nobody had uploaded recently.

export interface CategoryVendor extends ApiBusinessPublic {
  average_rating: number;
  total_ratings: number;
  verified: boolean;
  product_count: number;
  products: ApiProduct[];
}

interface Payload {
  vendors: CategoryVendor[];
  total: number;
}

const EMPTY: Payload = { vendors: [], total: 0 };

// Same envelope dig as the other hooks: the interceptor wraps the service's
// `{ data }` in its own.
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
  };
}

export interface UseCategoryVendorsOptions {
  kind: 'clothing' | 'accessory' | 'fabric';
  clothingType?: 'customize' | 'non_customize';
  audience?: string;
  limit?: number;
  perVendor?: number;
  enabled?: boolean;
}

export function useCategoryVendors(opts: UseCategoryVendorsOptions) {
  const {
    kind,
    clothingType,
    audience,
    limit = 8,
    perVendor = 4,
    enabled = true,
  } = opts;

  const [payload, setPayload] = useState<Payload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async (): Promise<Payload> => {
    const res = await api.get('/products/discover/vendors', {
      params: {
        kind,
        limit,
        per_vendor: perVendor,
        ...(clothingType ? { clothing_type: clothingType } : {}),
        ...(audience ? { audience } : {}),
      },
    });
    return dig(res.data);
  }, [kind, clothingType, audience, limit, perVendor]);

  useEffect(() => {
    if (!enabled) return;

    // Guarded so a slow answer for the previous audience cannot land after a
    // newer one and show men's vendors on the women's feed. Nothing sets
    // state before the first await either, which keeps this off React's
    // cascading-render path.
    let cancelled = false;

    void (async () => {
      try {
        const next = await fetchVendors();
        if (cancelled) return;
        setPayload(next);
        setError(null);
      } catch {
        if (cancelled) return;
        // A row that cannot load hides itself rather than showing an error —
        // it is one of four on a browse page, not the page itself.
        setError('Could not load this category.');
        setPayload(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchVendors]);

  // For an explicit retry from a button. Unlike the effect this does show the
  // loading state, because the person asked for it and deserves feedback.
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await fetchVendors());
      setError(null);
    } catch {
      setError('Could not load this category.');
    } finally {
      setLoading(false);
    }
  }, [fetchVendors]);

  return { ...payload, loading, error, refetch };
}
