'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useRemembered } from '@/lib/remembered';
import type { ApiBusinessPublic } from '@/lib/api-types';

/**
 * The stores this shopper follows, as store rows.
 *
 * The Following bar and page used to pick followed ids out of the first page
 * of public stores, so a followed store beyond the first 20 to 50 never
 * showed. This reads the account's own list. `followedIds` is the live follow
 * state: rows are filtered by it (an unfollow disappears at once) and the
 * list is read again when it changes. `known` fills in a store just followed
 * before the next read lands.
 */
export function useFollowedStores(
  followedIds: string[],
  enabled: boolean,
  known: ApiBusinessPublic[] = [],
): { stores: ApiBusinessPublic[]; loading: boolean } {
  const [state, setState] = useRemembered<{ data: ApiBusinessPublic[] | null; loading: boolean }>(
    'followed-stores',
    { data: null, loading: enabled },
  );
  const idsKey = [...followedIds].sort().join(',');

  useEffect(() => {
    if (!enabled || !followedIds.length) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: !prev.data }));
    api
      .get('/users/me/following-businesses', { params: { page: 1, size: 100 } })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        const rows = payload?.data ?? payload?.rows ?? payload;
        if (!cancelled) setState({ data: Array.isArray(rows) ? rows : [], loading: false });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ data: prev.data ?? [], loading: false }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, idsKey]);

  const byId = new Map<string, ApiBusinessPublic>();
  for (const s of [...(state.data ?? []), ...known]) {
    if (s?._id && followedIds.includes(s._id) && !byId.has(s._id)) byId.set(s._id, s);
  }
  // Keep the follow order (newest follows last in the account list).
  const stores = followedIds.map((id) => byId.get(id)).filter(Boolean) as ApiBusinessPublic[];
  return { stores, loading: enabled && state.loading };
}
