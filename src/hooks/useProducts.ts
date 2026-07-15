'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import type {
  ApiProduct,
  ApiProductPaginated,
  ApiProductRatingsResponse,
  ProductQueryParams,
} from '@/lib/api-types';

// ─── Shared hook state shape ──────────────────────────────────

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─── useProducts ──────────────────────────────────────────────
// Paginated product listing.
//
// Usage:
//   const { products, pagination, loading, error, refetch } = useProducts({ kind: 'clothing', page: 1 });

export interface UseProductsReturn {
  /** Raw paginated response */
  data: ApiProductPaginated | null;
  /** Shortcut to data.data */
  products: ApiProduct[];
  loading: boolean;
  error: string | null;
  /** Pagination metadata */
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  /** Re-fetch with current params */
  refetch: () => void;
}

export function useProducts(params: ProductQueryParams = {}): UseProductsReturn {
  const [state, setState] = useState<UseAsyncState<ApiProductPaginated>>({
    data: null,
    loading: true,
    error: null,
  });

  // Serialize params to a stable string to use as a dependency
  const paramsKey = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Strip undefined values from params so axios doesn't send `?kind=undefined`
      const cleanParams: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      }

      const res = await api.get('/products', { params: cleanParams });
      // Backend wraps response in { data: { ... } } via BaseResponseDto
      const payload: ApiProductPaginated = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch products';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { data } = state;

  return {
    data,
    products: data?.data ?? [],
    loading: state.loading,
    error: state.error,
    pagination: {
      currentPage: data?.current_page ?? 1,
      totalPages: data?.total_pages ?? 1,
      totalItems: data?.total_items ?? 0,
      pageSize: data?.page_size ?? 10,
      hasNext: data?.has_next_page ?? false,
      hasPrevious: data?.has_previous_page ?? false,
    },
    refetch: fetchProducts,
  };
}

// ─── useProduct ───────────────────────────────────────────────
// Fetch a single product by ID.
//
// Usage:
//   const { product, loading, error } = useProduct('64abc123...');

export interface UseProductReturn {
  product: ApiProduct | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProduct(id: string | undefined): UseProductReturn {
  const [state, setState] = useState<UseAsyncState<ApiProduct>>({
    data: null,
    loading: !!id,
    error: null,
  });

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get(`/products/${id}`);
      const product: ApiProduct = res.data?.data ?? res.data;
      setState({ data: product, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch product';
      setState({ data: null, loading: false, error: message });
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchProduct,
  };
}

// ─── useSearchProducts ────────────────────────────────────────
// Convenience wrapper around useProducts for search queries.
// Includes debounce to avoid hammering the API on every keystroke.
//
// Usage:
//   const { products, loading } = useSearchProducts('red agbada', { kind: 'clothing' });

export function useSearchProducts(
  query: string,
  extraParams: Omit<ProductQueryParams, 'search'> = {},
  debounceMs: number = 300
): UseProductsReturn {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return useProducts({
    ...extraParams,
    search: debouncedQuery || undefined,
  });
}

// ─── useProductRatings ────────────────────────────────────────
// Fetch ratings/reviews for a specific product.
//
// Usage:
//   const { ratings, loading } = useProductRatings('64abc123...');

export interface UseProductRatingsReturn {
  ratings: ApiProductRatingsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductRatings(
  productId: string | undefined
): UseProductRatingsReturn {
  const [state, setState] = useState<UseAsyncState<ApiProductRatingsResponse>>({
    data: null,
    loading: !!productId,
    error: null,
  });

  const fetchRatings = useCallback(async () => {
    if (!productId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get(`/products/${productId}/ratings`);
      const payload: ApiProductRatingsResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch ratings';
      setState({ data: null, loading: false, error: message });
    }
  }, [productId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return {
    ratings: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchRatings,
  };
}
