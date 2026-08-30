'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// ─── Types ───────────────────────────────────────────────────
export type DesignStatus = 'draft' | 'quoting' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface BespokeDesign {
  _id: string;
  reference: string;
  name: string;
  category: string;
  gender: 'men' | 'women';
  design_images: string[];
  reference_images: string[];
  fabric_id?: string;
  description?: string;
  measurement_id?: string;
  status: DesignStatus;
  quotes: BespokeQuote[];
  createdAt: string;
  updatedAt: string;
  // Allow snake_case fallback
  created_at?: string;
  updated_at?: string;
}

export interface BespokeQuote {
  _id: string;
  reference: string;
  vendor: {
    _id: string;
    business_name: string;
    logo_url?: string;
  };
  status: 'pending' | 'draft' | 'submitted' | 'accepted' | 'rejected' | 'expired' | 'revision_requested';
  total_amount?: number;
  currency?: string;
  line_items?: QuoteLineItem[];
  notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Shape returned by POST /bespoke/quotes/{id}/accept
export interface AcceptQuoteResult {
  order?: { _id?: string; reference?: string; total?: number };
  transaction?: { reference?: string; amount?: number; status?: string };
  payment?: {
    authorization_url?: string;
    paymentUrl?: string;
    access_code?: string;
    reference?: string;
  };
}

export interface CreateDesignPayload {
  name: string;
  category: string;
  gender: 'men' | 'women';
  design_images: string[];
  reference_images?: string[];
  fabric_id?: string;
  description?: string;
  measurement_id?: string;
}

// The backend service returns { message, data: design } and the global
// response interceptor wraps that AGAIN, so the design object actually
// arrives at res.data.data.data. Walk down the `data` envelopes until we
// reach the object that carries an _id (bounded, in case shapes change).
const unwrapDesign = (body: any): any => {
  let cur = body;
  for (let i = 0; i < 4; i++) {
    if (!cur || typeof cur !== 'object' || cur._id || !('data' in cur)) break;
    cur = cur.data;
  }
  return cur;
};

// ─── Hook ────────────────────────────────────────────────────
export function useBespokeDesigns() {
  const { isInitialized, user } = useApp();
  const [designs, setDesigns] = useState<BespokeDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Fetch designs ────────────────────────────────────────
  const fetchDesigns = useCallback(async (pageNum = 1, status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pageNum), size: '20' });
      if (status && status !== 'all') params.set('status', status);

      const res = await api.get(`/bespoke/designs?${params}`);
      // Backend returns getPagingData format: { total_items, data: [...], total_pages, current_page }
      // NestJS may also wrap in { data: { ... } }
      const body = res?.data;
      console.log('[BespokeDesigns] raw response:', JSON.stringify(body));

      // Handle both: body = paginated directly, or body.data = paginated
      const paginated = body?.total_items !== undefined ? body : body?.data;

      if (paginated && Array.isArray(paginated.data)) {
        setDesigns(paginated.data);
        setPage(paginated.current_page || pageNum);
        setTotalPages(paginated.total_pages || 1);
      } else if (Array.isArray(body?.data)) {
        // Flat array response
        setDesigns(body.data);
      } else if (Array.isArray(body)) {
        setDesigns(body);
      } else {
        console.warn('[BespokeDesigns] Unexpected response shape:', body);
        setDesigns([]);
      }
    } catch (err: any) {
      console.error('[BespokeDesigns] fetch error:', err);
      setError(err?.response?.data?.message || 'Failed to load designs');
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load when initialized and user is present
  useEffect(() => {
    if (isInitialized) {
      if (user) {
        fetchDesigns();
      } else {
        setDesigns([]);
        setIsLoading(false);
      }
    }
  }, [fetchDesigns, isInitialized, user]);

  // ─── Create design ────────────────────────────────────────
  const createDesign = useCallback(async (payload: CreateDesignPayload): Promise<BespokeDesign | null> => {
    try {
      const res = await api.post('/bespoke/designs', payload);
      const created = unwrapDesign(res?.data);
      // Refresh list
      await fetchDesigns();
      return created;
    } catch (err: any) {
      console.error('[BespokeDesigns] create error:', err);
      setError(err?.response?.data?.message || 'Failed to save design');
      return null;
    }
  }, [fetchDesigns]);

  // ─── Update existing design ────────────────────────────────
  const updateDesign = useCallback(async (id: string, payload: Partial<CreateDesignPayload>): Promise<BespokeDesign | null> => {
    try {
      const res = await api.put(`/bespoke/designs/${id}`, payload);
      const updated = unwrapDesign(res?.data);
      await fetchDesigns();
      return updated;
    } catch (err: any) {
      console.error('[BespokeDesigns] update error:', err);
      // If backend doesn't support PUT, fall back to create
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        console.warn('[BespokeDesigns] Update not supported, creating new design');
        return createDesign(payload as CreateDesignPayload);
      }
      setError(err?.response?.data?.message || 'Failed to update design');
      return null;
    }
  }, [fetchDesigns, createDesign]);

  // ─── Save (create or update) ───────────────────────────────
  const saveDesign = useCallback(async (payload: CreateDesignPayload, existingId?: string | null): Promise<BespokeDesign | null> => {
    if (existingId) {
      return updateDesign(existingId, payload);
    }
    return createDesign(payload);
  }, [createDesign, updateDesign]);

  // ─── Get design detail with quotes ────────────────────────
  const getDesignDetail = useCallback(async (id: string): Promise<BespokeDesign | null> => {
    try {
      const res = await api.get(`/bespoke/designs/${id}`);
      return res?.data?.data || res?.data;
    } catch (err: any) {
      console.error('[BespokeDesigns] detail error:', err);
      return null;
    }
  }, []);

  // ─── Cancel design ────────────────────────────────────────
  const cancelDesign = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/bespoke/designs/${id}/cancel`);
      // Update local state
      setDesigns(prev => prev.map(d =>
        d._id === id ? { ...d, status: 'cancelled' as DesignStatus } : d
      ));
      return true;
    } catch (err: any) {
      console.error('[BespokeDesigns] cancel error:', err);
      setError(err?.response?.data?.message || 'Failed to cancel design');
      return false;
    }
  }, []);

  // ─── Request quotes from vendors ──────────────────────────
  const requestQuotes = useCallback(async (designId: string, vendorIds: string[]): Promise<boolean> => {
    try {
      await api.post(`/bespoke/designs/${designId}/request-quotes`, {
        vendor_ids: vendorIds,
      });
      await fetchDesigns();
      return true;
    } catch (err: any) {
      console.error('[BespokeDesigns] requestQuotes error:', err);
      setError(err?.response?.data?.message || 'Failed to request quotes');
      return false;
    }
  }, [fetchDesigns]);

  // ─── Accept a quote ───────────────────────────────────────
  // Returns the accept payload (order + payment) so the caller can redirect to
  // Paystack, or null on failure.
  const acceptQuote = useCallback(async (
    quoteId: string,
    paymentMethod: 'wallet' | 'paystack' = 'paystack',
    addressId?: string,
  ): Promise<AcceptQuoteResult | null> => {
    try {
      const res = await api.post(`/bespoke/quotes/${quoteId}/accept`, {
        payment_method: paymentMethod,
        ...(addressId ? { address_id: addressId } : {}),
      });
      const payload = res?.data?.data ?? res?.data;
      await fetchDesigns();
      return payload as AcceptQuoteResult;
    } catch (err: any) {
      console.error('[BespokeDesigns] acceptQuote error:', err);
      // Surface the backend message (e.g. insufficient wallet balance).
      throw new Error(err?.response?.data?.message || 'Failed to accept quote');
    }
  }, [fetchDesigns]);

  return {
    designs,
    isLoading,
    error,
    page,
    totalPages,
    fetchDesigns,
    createDesign,
    updateDesign,
    saveDesign,
    getDesignDetail,
    cancelDesign,
    requestQuotes,
    acceptQuote,
  };
}
