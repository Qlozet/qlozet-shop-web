'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// Unread counts for the bespoke order chat — GET /orders/messages/unread.
//
// One request covers every order, keyed by reference, because the alternative
// is asking per row and the orders list is paginated. Without this the only
// way to find a tailor's reply is to open each order in turn.

interface UnreadCounts {
  total: number;
  perOrder: Record<string, number>;
}

const EMPTY: UnreadCounts = { total: 0, perOrder: {} };

// Same envelope dig as the other hooks: the interceptor wraps the service's
// `{ data }` in its own, so the payload sits a couple of levels down.
function dig(v: unknown): UnreadCounts {
  let node = v as Record<string, unknown> | undefined;
  for (let i = 0; i < 4; i += 1) {
    if (!node || typeof node !== 'object') return EMPTY;
    if ('total' in node) break;
    node = node.data as Record<string, unknown> | undefined;
  }
  if (!node || typeof node !== 'object' || !('total' in node)) return EMPTY;
  const perOrder = node.per_order;
  return {
    total: typeof node.total === 'number' ? node.total : 0,
    perOrder:
      perOrder && typeof perOrder === 'object'
        ? (perOrder as Record<string, number>)
        : {},
  };
}

export function useUnreadOrderMessages(enabled: boolean) {
  const [counts, setCounts] = useState<UnreadCounts>(EMPTY);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get('/orders/messages/unread');
      setCounts(dig(res.data));
    } catch {
      // A badge is not worth surfacing an error for; leave the last known
      // counts in place rather than flashing them to zero.
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...counts, refresh };
}
