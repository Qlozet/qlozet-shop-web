'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  ApiBusinessPublic,
  ApiBusinessPublicDetail,
  ApiBusinessPaginated,
  ApiProductPaginated,
  ApiProduct,
  ApiVendorReviewsResponse,
  VendorQueryParams,
} from '@/lib/api-types';

// ─── Shared hook state shape ──────────────────────────────────

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ─── useVendors ───────────────────────────────────────────────
// Paginated vendor listing (public endpoint).
//
// Usage:
//   const { vendors, loading, error } = useVendors({ page: 1, limit: 20 });

export interface UseVendorsReturn {
  data: ApiBusinessPaginated | null;
  vendors: ApiBusinessPublic[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  refetch: () => void;
}

export function useVendors(params: VendorQueryParams = {}): UseVendorsReturn {
  const [state, setState] = useState<UseAsyncState<ApiBusinessPaginated>>({
    data: null,
    loading: true,
    error: null,
  });

  const paramsKey = JSON.stringify(params);

  const fetchVendors = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cleanParams: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      }

      const res = await api.get('/business/public', { params: cleanParams });
      const payload: ApiBusinessPaginated = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch vendors';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const { data } = state;

  return {
    data,
    vendors: data?.data ?? [],
    loading: state.loading,
    error: state.error,
    pagination: {
      currentPage: data?.page ?? 1,
      totalPages: data?.pages ?? 1,
      total: data?.total ?? 0,
    },
    refetch: fetchVendors,
  };
}

// ─── useVendor ────────────────────────────────────────────────
// Fetch a single vendor profile by ID (public detail endpoint).
//
// Usage:
//   const { vendor, loading, error } = useVendor('64abc123...');

export interface UseVendorReturn {
  vendor: ApiBusinessPublicDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendor(id: string | undefined): UseVendorReturn {
  const [state, setState] = useState<UseAsyncState<ApiBusinessPublicDetail>>({
    data: null,
    loading: !!id,
    error: null,
  });

  const fetchVendor = useCallback(async () => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get(`/business/public/${id}`);
      const vendor: ApiBusinessPublicDetail = res.data?.data ?? res.data;
      setState({ data: vendor, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch vendor';
      setState({ data: null, loading: false, error: message });
    }
  }, [id]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  return {
    vendor: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchVendor,
  };
}

// ─── useVendorProducts ────────────────────────────────────────
// Fetch a vendor's products using the products endpoint with business_id filter.
//
// Usage:
//   const { products, loading, pagination } = useVendorProducts('64abc123...', { page: 1, size: 20 });

export interface UseVendorProductsReturn {
  products: ApiProduct[];
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

export function useVendorProducts(
  vendorId: string | undefined,
  params: { page?: number; size?: number; kind?: string; sortBy?: string; order?: string } = {}
): UseVendorProductsReturn {
  const [state, setState] = useState<UseAsyncState<ApiProductPaginated>>({
    data: null,
    loading: !!vendorId,
    error: null,
  });

  const paramsKey = JSON.stringify({ vendorId, ...params });

  const fetchProducts = useCallback(async () => {
    if (!vendorId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const cleanParams: Record<string, string | number> = {
        business_id: vendorId,
      };
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = value;
        }
      }

      const res = await api.get('/products', { params: cleanParams });
      const payload: ApiProductPaginated = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch vendor products';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { data } = state;

  return {
    products: data?.data ?? [],
    loading: state.loading,
    error: state.error,
    pagination: {
      currentPage: data?.current_page ?? 1,
      totalPages: data?.total_pages ?? 1,
      totalItems: data?.total_items ?? 0,
      hasNext: data?.has_next_page ?? false,
      hasPrevious: data?.has_previous_page ?? false,
    },
    refetch: fetchProducts,
  };
}

// ─── useVendorReviews ─────────────────────────────────────────
// Fetch reviews across all products for a vendor.
//
// Usage:
//   const { reviews, loading } = useVendorReviews('64abc123...', { page: 1, size: 20 });

export interface UseVendorReviewsReturn {
  data: ApiVendorReviewsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendorReviews(
  businessId: string | undefined,
  params: { page?: number; size?: number; sort?: string } = {}
): UseVendorReviewsReturn {
  const [state, setState] = useState<UseAsyncState<ApiVendorReviewsResponse>>({
    data: null,
    loading: !!businessId,
    error: null,
  });

  const paramsKey = JSON.stringify({ businessId, ...params });

  const fetchReviews = useCallback(async () => {
    if (!businessId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const queryParams: Record<string, string | number> = {
        business_id: businessId,
      };
      if (params.page) queryParams.page = params.page;
      if (params.size) queryParams.size = params.size;
      if (params.sort) queryParams.sort = params.sort;

      const res = await api.get('/products/ratings/vendor', { params: queryParams });
      const payload: ApiVendorReviewsResponse = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch vendor reviews';
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch: fetchReviews,
  };
}

// ─── useVendorDiscountedProducts ──────────────────────────────
// Fetch products with active discounts for a vendor (public endpoint).
//
// Usage:
//   const { products, loading } = useVendorDiscountedProducts('64abc123...');

export interface UseVendorDiscountedProductsReturn {
  products: ApiProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendorDiscountedProducts(
  businessId: string | undefined
): UseVendorDiscountedProductsReturn {
  const [state, setState] = useState<UseAsyncState<ApiProduct[]>>({
    data: null,
    loading: !!businessId,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    if (!businessId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get(`/discounts/public/${businessId}/products`);
      // The endpoint returns a paginated { data: rows, ... } which the global
      // response wrapper nests again, so the rows live at res.data.data.data.
      // Fall back through the shallower shapes for safety.
      const nested = res.data?.data?.data;
      const mid = res.data?.data;
      const payload: ApiProduct[] = Array.isArray(nested)
        ? nested
        : Array.isArray(mid)
          ? mid
          : Array.isArray(res.data)
            ? res.data
            : [];
      setState({ data: payload, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch discounted products';
      setState({ data: null, loading: false, error: message });
    }
  }, [businessId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: state.data ?? [],
    loading: state.loading,
    error: state.error,
    refetch: fetchProducts,
  };
}
