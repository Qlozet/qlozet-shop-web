'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ApiAskConversation, ApiAskConversationSummary } from '@/lib/api-types';

// ─── useAskConversations ──────────────────────────────────────
// The customer's saved stylist conversations — what the clock button on the
// search page opens. Fetched when `enabled` turns true (the sheet opening),
// so a thread saved a moment ago is in the list the next time it is opened.
//
// Usage:
//   const { conversations, loading, load, remove } = useAskConversations(sheetOpen && !!user);

// The API wraps responses in { data }, sometimes twice.
const dig = <T,>(res: { data?: unknown }): T => {
  const outer = res.data as { data?: T } | T | undefined;
  const inner = (outer as { data?: T } | undefined)?.data;
  return (inner ?? outer) as T;
};

export function useAskConversations(enabled: boolean) {
  const [conversations, setConversations] = useState<ApiAskConversationSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Spinner only until the first list lands; later opens refresh quietly
  // behind the rows already shown. Derived, so no setState runs
  // synchronously inside the effect.
  const loading = enabled && !loaded;

  const fetchList = useCallback(async () => {
    const res = await api.get('/recommendations/conversations');
    const rows = dig<ApiAskConversationSummary[]>(res);
    return Array.isArray(rows) ? rows : [];
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Guarded so a slow answer cannot land after a delete and put the row back.
    let cancelled = false;

    void (async () => {
      try {
        const next = await fetchList();
        if (!cancelled) {
          setConversations(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your conversations');
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchList]);

  /** One full conversation, for resuming. */
  const load = useCallback(async (id: string): Promise<ApiAskConversation | null> => {
    try {
      const res = await api.get(`/recommendations/conversations/${id}`);
      return dig<ApiAskConversation>(res);
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    // Drop the row first; the request is fire-and-forget for the reader.
    setConversations((prev) => prev.filter((c) => c._id !== id));
    try {
      await api.delete(`/recommendations/conversations/${id}`);
    } catch {
      // Already gone from view; it will be gone from the list on the next
      // open if the delete did land, and back if it did not.
    }
  }, []);

  const removeAll = useCallback(async () => {
    setConversations([]);
    try {
      await api.delete('/recommendations/conversations');
    } catch {
      // As above.
    }
  }, []);

  return { conversations, loading, error, load, remove, removeAll };
}
