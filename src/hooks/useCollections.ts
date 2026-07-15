'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiCollection } from '@/lib/api-types';

// ─── Shared hook state shape ──────────────────────────────────

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─── usePlatformCollections ───────────────────────────────────
// Fetch featured platform collections for the homepage.
//
// Usage:
//   const { collections, loading } = usePlatformCollections();

export interface UsePlatformCollectionsReturn {
  collections: ApiCollection[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlatformCollections(): UsePlatformCollectionsReturn {
  const [state, setState] = useState<UseAsyncState<ApiCollection[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCollections = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get('/collections/platform');
      // Backend may wrap in { data: [...] } or return array directly
      const payload: ApiCollection[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch collections';
      setState({ data: null, loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refetch: fetchCollections,
  };
}

// ─── useCollection ────────────────────────────────────────────
// Fetch a single collection by ID or slug, including its products.
//
// Usage:
//   const { collection, loading } = useCollection('traditional-wear');

export interface UseCollectionReturn {
  collection: ApiCollection | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCollection(
  idOrSlug: string | undefined
): UseCollectionReturn {
  const [state, setState] = useState<UseAsyncState<ApiCollection>>({
    data: null,
    loading: !!idOrSlug,
    error: null,
  });

  const fetchCollection = useCallback(async () => {
    if (!idOrSlug) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get(`/collections/platform/${idOrSlug}`);
      const collection: ApiCollection = res.data?.data ?? res.data;
      setState({ data: collection, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch collection';
      setState({ data: null, loading: false, error: message });
    }
  }, [idOrSlug]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    collection: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchCollection,
  };
}

// ─── useVendorCollections ─────────────────────────────────────
// Fetch collections for a specific vendor (public endpoint).
//
// Usage:
//   const { collections, loading } = useVendorCollections('64abc123...');

export interface UseVendorCollectionsReturn {
  collections: ApiCollection[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  refetch: () => void;
}

export function useVendorCollections(
  businessId: string | undefined,
  params: { page?: number; size?: number } = {}
): UseVendorCollectionsReturn {
  const [state, setState] = useState<UseAsyncState<{
    data: ApiCollection[];
    total_items: number;
    total_pages: number;
    current_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
    page_size: number;
  }>>({
    data: null,
    loading: !!businessId,
    error: null,
  });

  const paramsKey = JSON.stringify({ businessId, ...params });

  const fetchCollections = useCallback(async () => {
    if (!businessId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cleanParams: Record<string, string | number> = {};
      if (params.page) cleanParams.page = params.page;
      if (params.size) cleanParams.size = params.size;

      const res = await api.get(`/collections/vendor/${businessId}/public`, { params: cleanParams });
      const payload = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch vendor collections';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const { data } = state;

  return {
    collections: data?.data ?? [],
    loading: state.loading,
    error: state.error,
    pagination: {
      currentPage: data?.current_page ?? 1,
      totalPages: data?.total_pages ?? 1,
      totalItems: data?.total_items ?? 0,
      hasNext: data?.has_next_page ?? false,
      hasPrevious: data?.has_previous_page ?? false,
    },
    refetch: fetchCollections,
  };
}
