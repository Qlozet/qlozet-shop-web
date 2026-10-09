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

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await api.get('/products/discover/vendors', {
        params: {
          kind,
          limit,
          per_vendor: perVendor,
          ...(clothingType ? { clothing_type: clothingType } : {}),
          ...(audience ? { audience } : {}),
        },
      });
      setPayload(dig(res.data));
      setError(null);
    } catch {
      // A row that cannot load hides itself rather than showing an error —
      // it is one of four on a browse page, not the page itself.
      setError('Could not load this category.');
      setPayload(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [kind, clothingType, audience, limit, perVendor, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...payload, loading, error, refetch: load };
}
