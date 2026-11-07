'use client';

// The token packs on sale (GET /token/packs): set by the admin, priced by
// the server. Purchases send only the pack id.

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  bonus_tokens: number;
  total_tokens: number;
  price_ngn: number;
  tag: string | null;
  /** About how many AI designs the pack covers. */
  designs: number | null;
}

let cached: TokenPack[] | null = null;

export function useTokenPacks(enabled = true) {
  const [packs, setPacks] = useState<TokenPack[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && enabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || cached) return;
    let cancelled = false;
    api
      .get('/token/packs')
      .then((res) => {
        const body = res.data?.data ?? res.data;
        const list: TokenPack[] = Array.isArray(body?.packs) ? body.packs : [];
        cached = list;
        if (!cancelled) setPacks(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { packs, loading, failed };
}
