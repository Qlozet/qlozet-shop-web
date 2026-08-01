'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import type {
  ApiFeedItem,
  ApiFeedResponse,
  ApiVendorFeedItem,
  ApiVendorFeedResponse,
  ApiAskResponse,
  ApiProduct,
  FeedQueryParams,
} from '@/lib/api-types';

// ─── Shared hook state shape ──────────────────────────────────

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════
//  PUBLIC HOOKS (no auth required)
// ═══════════════════════════════════════════════════════════════

// ─── useTrendingProducts ──────────────────────────────────────
// Fetch trending products from the recommendation engine.
//
// Usage:
//   const { items, loading } = useTrendingProducts(10);

export interface UseTrendingReturn {
  items: ApiFeedItem[];
  requestId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrendingProducts(limit: number = 10): UseTrendingReturn {
  const [state, setState] = useState<UseAsyncState<ApiFeedResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTrending = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/recommends/trending', {
        params: { limit },
      });
      const payload: ApiFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch trending';
      setState({ data: null, loading: false, error: message });
    }
  }, [limit]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    items: state.data?.items ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchTrending,
  };
}

// ─── useNewArrivals ───────────────────────────────────────────
// Fetch new arrival products.
//
// Usage:
//   const { items, loading } = useNewArrivals(10, 30);

export function useNewArrivals(
  limit: number = 10,
  days: number = 30
): UseTrendingReturn {
  const [state, setState] = useState<UseAsyncState<ApiFeedResponse>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchNew = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/recommends/new', {
        params: { limit, days },
      });
      const payload: ApiFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch new arrivals';
      setState({ data: null, loading: false, error: message });
    }
  }, [limit, days]);

  useEffect(() => {
    fetchNew();
  }, [fetchNew]);

  return {
    items: state.data?.items ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchNew,
  };
}

// ═══════════════════════════════════════════════════════════════
//  AUTH-REQUIRED HOOKS (no-op when logged out)
// ═══════════════════════════════════════════════════════════════

// ─── usePersonalizedFeed ──────────────────────────────────────
// Fetch the personalized home feed for the logged-in user.
// Returns empty results when user is not authenticated.
//
// Usage:
//   const { items, loading, requestId } = usePersonalizedFeed({ limit: 20, gender: 'female' });

export interface UsePersonalizedFeedReturn {
  items: ApiFeedItem[];
  requestId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePersonalizedFeed(
  params: FeedQueryParams = {}
): UsePersonalizedFeedReturn {
  const { user } = useApp();
  const [state, setState] = useState<UseAsyncState<ApiFeedResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const paramsKey = JSON.stringify(params);

  const fetchFeed = useCallback(async () => {
    if (!user) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cleanParams: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      }

      const res = await api.get('/recommends/feed', { params: cleanParams });
      const payload: ApiFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch personalized feed';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, paramsKey]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    items: state.data?.items ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchFeed,
  };
}

// ─── useRecommendedVendors ────────────────────────────────────
// Fetch recommended vendors for the logged-in user.
//
// Usage:
//   const { vendors, loading } = useRecommendedVendors(5);

export interface UseRecommendedVendorsReturn {
  vendors: ApiVendorFeedItem[];
  requestId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecommendedVendors(
  limit: number = 10
): UseRecommendedVendorsReturn {
  const { user } = useApp();
  const [state, setState] = useState<UseAsyncState<ApiVendorFeedResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchVendors = useCallback(async () => {
    if (!user) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/recommends/vendors', {
        params: { limit },
      });
      const payload: ApiVendorFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch recommended vendors';
      setState({ data: null, loading: false, error: message });
    }
  }, [user?.id, limit]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors: state.data?.vendors ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchVendors,
  };
}

// ─── useBoughtTogether ────────────────────────────────────────
// "Frequently bought together" recommendations for a product.
//
// Usage:
//   const { items, loading } = useBoughtTogether('64abc123...');

export function useBoughtTogether(
  itemId: string | undefined,
  limit: number = 6
): UseTrendingReturn {
  const { user } = useApp();
  const [state, setState] = useState<UseAsyncState<ApiFeedResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchBT = useCallback(async () => {
    if (!user || !itemId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/recommends/bought-together', {
        params: { itemId, limit },
      });
      const payload: ApiFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch bought-together';
      setState({ data: null, loading: false, error: message });
    }
  }, [user?.id, itemId, limit]);

  useEffect(() => {
    fetchBT();
  }, [fetchBT]);

  return {
    items: state.data?.items ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchBT,
  };
}

// ─── useCompleteTheLook ───────────────────────────────────────
// "Complete the look" outfit suggestions based on selected items.
//
// Usage:
//   const { items, loading } = useCompleteTheLook(['prod_1', 'prod_2']);

export function useCompleteTheLook(
  itemIds: string[],
  limit: number = 6
): UseTrendingReturn {
  const { user } = useApp();
  const [state, setState] = useState<UseAsyncState<ApiFeedResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const idsKey = JSON.stringify(itemIds);

  const fetchCTL = useCallback(async () => {
    if (!user || itemIds.length === 0) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/recommends/complete-look', {
        params: { itemIds: itemIds.join(','), limit },
      });
      const payload: ApiFeedResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch complete-look';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, idsKey, limit]);

  useEffect(() => {
    fetchCTL();
  }, [fetchCTL]);

  return {
    items: state.data?.items ?? [],
    requestId: state.data?.requestId ?? null,
    loading: state.loading,
    error: state.error,
    refetch: fetchCTL,
  };
}

// ─── useAskFashion ────────────────────────────────────────────
// AI fashion assistant — returns a mutation function (not auto-fetching).
// Maintains conversation history for multi-turn chat.
//
// Usage:
//   const { ask, response, loading, error, history } = useAskFashion();
//   const result = await ask('Show me red dresses for a wedding under 50k');

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UseAskFashionReturn {
  /** Call this to send a query to the AI assistant */
  ask: (query: string, filters?: Record<string, unknown>) => Promise<ApiAskResponse | null>;
  response: ApiAskResponse | null;
  loading: boolean;
  error: string | null;
  /** Full conversation history */
  history: ChatMessage[];
  /** Reset state and conversation history */
  reset: () => void;
}

export function useAskFashion(): UseAskFashionReturn {
  const { user } = useApp();
  const [state, setState] = useState<UseAsyncState<ApiAskResponse>>({
    data: null,
    loading: false,
    error: null,
  });
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const ask = useCallback(
    async (
      query: string,
      filters?: Record<string, unknown>
    ): Promise<ApiAskResponse | null> => {
      if (!user) {
        setState({
          data: null,
          loading: false,
          error: 'You must be logged in to use AI search',
        });
        return null;
      }
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Show the user's message immediately (optimistic), before the request —
      // otherwise it only appears once the AI reply lands. `history` sent to the
      // backend is the closure value (prior turns), so context stays correct.
      setHistory((prev) => [...prev, { role: 'user' as const, content: query }]);

      try {
        const res = await api.post('/recommendations/ask', {
          query,
          history, // Send conversation history for context (prior turns)
          ...(filters ? { filters } : {}),
        });
        const payload: ApiAskResponse = res.data?.data ?? res.data;

        // Append only the assistant reply — the user turn is already shown.
        if (payload.reply) {
          setHistory((prev) => [
            ...prev,
            { role: 'assistant' as const, content: payload.reply },
          ]);
        }

        setState({ data: payload, loading: false, error: null });
        return payload;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'AI search failed';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [user?.id, history]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    setHistory([]);
  }, []);

  return {
    ask,
    response: state.data,
    loading: state.loading,
    error: state.error,
    history,
    reset,
  };
}
