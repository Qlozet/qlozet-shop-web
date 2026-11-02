'use client';

// useFabricLibrary
// Real fabric products (kind: 'fabric') that vendors have listed for sale,
// mapped to the studio's FabricOption shape. Used by the bespoke studio so
// "generate" applies an actual, fetchable fabric image — not the local
// placeholder swatches. A module-level cache keeps every caller (the fabric
// panel + useCustomization) on a single fetch.
//
// The studio's fabric picker also searches the whole catalogue. Anything it
// shows is remembered here, so a fabric picked from page 3 of a search still
// resolves to its name and image for previews, summaries and saving.

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
const remembered = new Map<string, FabricOption>();
const listeners = new Set<() => void>();

const isRemote = (u?: string) => !!u && /^https?:\/\//i.test(u);

/** A fabric product as a studio fabric option. */
export function toFabricOption(p: ApiProduct): FabricOption {
  const f = (p.fabric ?? {}) as NonNullable<ApiProduct['fabric']> & {
    material?: string;
    pattern?: string;
    sold_by?: 'yard' | 'piece' | 'both';
    piece_yards?: number;
    piece_price?: number;
    yard_length?: number;
  };
  const pricePerYard = Number(f.price_per_yard) || 0;
  const business = (p as { business?: string | { _id?: string; business_name?: string } }).business;
  return {
    id: p._id, // real fabric product id
    name: getProductName(p),
    image: getProductImage(p), // real Cloudinary URL
    extraCost: pricePerYard,
    pricePerYard,
    colors: (f.colors ?? []).filter((c) => c?.name || c?.hex),
    material: f.material || undefined,
    pattern: f.pattern || undefined,
    soldBy: f.sold_by ?? 'yard',
    pieceYards: Number(f.piece_yards) || undefined,
    piecePrice: Number(f.piece_price) || undefined,
    yardsInStock: Number.isFinite(Number(f.yard_length)) ? Number(f.yard_length) : undefined,
    vendorName: typeof business === 'object' ? business?.business_name : undefined,
  };
}

/** Keep these fabrics resolvable by id for the rest of the session. */
export function rememberFabrics(list: FabricOption[]) {
  let changed = false;
  for (const f of list) {
    if (!f?.id || !isRemote(f.image)) continue;
    if (!remembered.has(f.id)) changed = true;
    remembered.set(f.id, f);
  }
  if (changed) listeners.forEach((l) => l());
}

type Envelope = { data?: unknown; totalItems?: unknown; total?: unknown; meta?: { total?: unknown } };
const env = (v: unknown): Envelope => (v && typeof v === 'object' ? (v as Envelope) : {});

/** The rows of a /products response body, however deeply it is wrapped. */
function rowsOf(body: unknown): ApiProduct[] {
  // The list endpoint is paginated and the wrapper nests the payload, so the
  // rows can live at body.data.data / body.data / body.
  const payload = env(body).data ?? body;
  if (Array.isArray(env(payload).data)) return env(payload).data as ApiProduct[];
  if (Array.isArray(payload)) return payload as ApiProduct[];
  return [];
}

function totalOf(body: unknown): number | null {
  const payload = env(env(body).data ?? body);
  const n = Number(payload.totalItems ?? payload.total ?? payload.meta?.total);
  return Number.isFinite(n) ? n : null;
}

/**
 * One page of in-stock fabrics, optionally matching a search (name,
 * material, pattern or colour). Results are remembered.
 */
export async function searchFabrics(opts: { search?: string; page?: number; size?: number }) {
  const size = opts.size ?? 24;
  const page = opts.page ?? 1;
  const res = await api.get('/products', {
    params: {
      kind: 'fabric',
      status: 'active',
      in_stock: true,
      size,
      page,
      ...(opts.search?.trim() ? { search: opts.search.trim() } : {}),
    },
  });
  const raw = rowsOf(res.data);
  const rows = raw.map(toFabricOption).filter((f) => isRemote(f.image));
  rememberFabrics(rows);
  const total = totalOf(res.data);
  return { rows, hasMore: total !== null ? page * size < total : raw.length === size };
}

async function fetchFabricLibrary(): Promise<FabricOption[]> {
  // in_stock: an out-of-stock fabric would pin the design to yards nobody can
  // supply — quotes on it are unfulfillable and (for cross-vendor fabrics)
  // the order would charge for stock the fabric vendor doesn't have.
  const res = await api.get('/products', {
    params: { kind: 'fabric', size: 60, status: 'active', in_stock: true },
  });
  return rowsOf(res.data)
    .map(toFabricOption)
    // Only usable, fetchable fabrics (a real remote image URL).
    .filter((f) => isRemote(f.image));
}

const merged = (): FabricOption[] => {
  const base = cache ?? [];
  const ids = new Set(base.map((f) => f.id));
  return [...base, ...[...remembered.values()].filter((f) => !ids.has(f.id))];
};

export interface UseFabricLibraryReturn {
  fabrics: FabricOption[];
  loading: boolean;
}

export function useFabricLibrary(): UseFabricLibraryReturn {
  const [fabrics, setFabrics] = useState<FabricOption[]>(merged);
  const [loading, setLoading] = useState<boolean>(!cache);

  useEffect(() => {
    const onChange = () => setFabrics(merged());
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

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
    inflight.then(() => {
      if (cancelled) return;
      setFabrics(merged());
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { fabrics, loading };
}
