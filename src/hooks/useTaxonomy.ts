'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiTaxonomyNode } from '@/lib/api-types';

// ─── Shared hook state shape ──────────────────────────────────

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─── useTaxonomyTree ──────────────────────────────────────────
// Fetch the full category tree (optionally filtered by kind).
//
// Usage:
//   const { tree, loading } = useTaxonomyTree();
//   const { tree, loading } = useTaxonomyTree('clothing');

export interface UseTaxonomyTreeReturn {
  tree: ApiTaxonomyNode[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTaxonomyTree(kind?: string): UseTaxonomyTreeReturn {
  const [state, setState] = useState<UseAsyncState<ApiTaxonomyNode[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTree = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, string> = {};
      if (kind) params.kind = kind;

      const res = await api.get('/taxonomy/tree', { params });
      const payload: ApiTaxonomyNode[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch taxonomy tree';
      setState({ data: null, loading: false, error: message });
    }
  }, [kind]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    tree: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refetch: fetchTree,
  };
}

// ─── useProductTypes ──────────────────────────────────────────
// Fetch available product types, optionally filtered by kind.
// Returns flat list of product type strings (e.g. ["Dresses", "Tops", "Skirts"]).
//
// Usage:
//   const { productTypes, loading } = useProductTypes('clothing');

export interface UseProductTypesReturn {
  productTypes: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductTypes(kind?: string): UseProductTypesReturn {
  const [state, setState] = useState<UseAsyncState<string[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchTypes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: Record<string, string> = {};
      if (kind) params.kind = kind;

      const res = await api.get('/taxonomy/product-types', { params });
      // Response could be an array of strings or an array of objects with a name field
      const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const types: string[] = raw.map((item: string | { name: string }) =>
        typeof item === 'string' ? item : item.name
      );
      setState({ data: types, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch product types';
      setState({ data: null, loading: false, error: message });
    }
  }, [kind]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    productTypes: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refetch: fetchTypes,
  };
}
