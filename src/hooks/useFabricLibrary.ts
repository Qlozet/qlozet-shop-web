'use client';

// useFabricLibrary
// Real fabric products (kind: 'fabric') that vendors have listed for sale,
// mapped to the studio's FabricOption shape. Used by the bespoke studio so
// "generate" applies an actual, fetchable fabric image — not the local
// placeholder swatches. A module-level cache keeps every caller (the fabric
// panel + useCustomization) on a single fetch.

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  getProductImage,
  getProductName,
  type ApiProduct,
} from '@/lib/api-types';
import type { FabricOption } from '@/data/studio-options';

let cache: FabricOption[] | null = null;
let inflight: Promise<FabricOption[]> | null = null;

async function fetchFabricLibrary(): Promise<FabricOption[]> {
  // in_stock: an out-of-stock fabric would pin the design to yards nobody can
  // supply — quotes on it are unfulfillable and (for cross-vendor fabrics)
  // the order would charge for stock the fabric vendor doesn't have.
  const res = await api.get('/products', {
    params: { kind: 'fabric', size: 60, status: 'active', in_stock: true },
  });
  // The list endpoint is paginated and the wrapper nests the payload, so the
  // rows can live at res.data.data.data / res.data.data / res.data.
  const payload = res.data?.data ?? res.data;
  const list: ApiProduct[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : Array.isArray(res.data?.data?.data)
        ? res.data.data.data
        : [];

  return list
    .map((p): FabricOption => {
      const pricePerYard = Number(p.fabric?.price_per_yard) || 0;
      return {
        id: p._id, // real fabric product id
        name: getProductName(p),
        image: getProductImage(p), // real Cloudinary URL
        extraCost: pricePerYard,
        colors: (p.fabric?.colors ?? []).filter((c) => c?.name || c?.hex),
      };
    })
    // Only usable, fetchable fabrics (a real remote image URL).
    .filter((f) => !!f.image && /^https?:\/\//i.test(f.image));
}

export interface UseFabricLibraryReturn {
  fabrics: FabricOption[];
  loading: boolean;
}

export function useFabricLibrary(): UseFabricLibraryReturn {
  const [fabrics, setFabrics] = useState<FabricOption[]>(cache ?? []);
  const [loading, setLoading] = useState<boolean>(!cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    if (!inflight) {
      inflight = fetchFabricLibrary()
        .then((opts) => {
          cache = opts;
          return opts;
        })
        .catch(() => {
          cache = [];
          return [];
        })
        .finally(() => {
          inflight = null;
        });
    }
    inflight.then((opts) => {
      if (cancelled) return;
      setFabrics(opts);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { fabrics, loading };
}
