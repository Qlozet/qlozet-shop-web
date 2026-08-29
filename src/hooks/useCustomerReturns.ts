'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// A customer's return request as the backend stores it (GET /returns/my).
export interface CustomerReturn {
  _id: string;
  order_reference: string;
  business:
    | string
    | { _id: string; business_name?: string; logo?: string }
    | null;
  /** PRODUCT ids of the returned items. */
  items: string[];
  reason: string;
  status:
    | 'requested'
    | 'vendor_approved'
    | 'vendor_rejected'
    | 'return_shipped'
    | 'received'
    | 'refund_processed'
    | 'closed';
  refund_amount?: number;
  vendor_rejection_reason?: string | null;
  createdAt?: string;
  refunded_at?: string | null;
}

/**
 * The customer's return requests — powers the return-status banner on the
 * order item view and the Track Return timeline.
 */
export function useCustomerReturns(enabled = true) {
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns/my');
      const body = res.data?.data ?? res.data;
      setReturns(Array.isArray(body) ? body : []);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchReturns();
  }, [enabled, fetchReturns]);

  return { returns, loading, refetch: fetchReturns };
}

/** Find the most relevant return for an order (optionally a specific product). */
export function findReturnFor(
  returns: CustomerReturn[],
  orderReference: string,
  productId?: string
): CustomerReturn | undefined {
  const matches = returns.filter(
    (r) =>
      r.order_reference === orderReference &&
      (!productId || (r.items || []).includes(productId))
  );
  // Newest first — createdAt descending.
  return matches.sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '')
  )[0];
}

export const RETURN_STATUS_LABELS: Record<string, string> = {
  requested: 'Return requested — awaiting vendor review',
  vendor_approved: 'Return approved — ship the items back',
  vendor_rejected: 'Return rejected by the vendor',
  return_shipped: 'Return in transit to the vendor',
  received: 'Items received — refund processing',
  refund_processed: 'Refund processed',
  closed: 'Return closed',
};
