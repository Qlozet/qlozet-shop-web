'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useRemembered } from '@/lib/remembered';
import { trackEventDirect } from '@/hooks/useTrackEvent';

// ─── Order again ───────────────────────────────────────────────
// POST /orders/:reference/reorder puts a past order (or one item) back in the
// cart with the same size, styles, fabric and measurement set, at today's
// prices. Pieces that can't be bought any more come back in `skipped` with
// the reason, so the customer hears it here and not at checkout.

interface ReorderAnswer {
  message?: string;
  added: { item_id: string; product_id: string; name: string | null }[];
  skipped: { item_id: string; product_id: string | null; name?: string | null; reason: string }[];
}

type Wrapped = { data?: unknown; added?: unknown } | null | undefined;

/** The server wraps answers once or twice; find the object that has `added`. */
function reorderAnswer(raw: unknown): ReorderAnswer {
  let cur = raw as Wrapped;
  for (let i = 0; i < 4 && cur; i++) {
    if (Array.isArray(cur.added)) return cur as unknown as ReorderAnswer;
    cur = cur.data as Wrapped;
  }
  return { added: [], skipped: [] };
}

export function useOrderAgain() {
  const { reloadCart, user } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const orderAgain = async (reference: string, itemId?: string) => {
      const key = `${reference}:${itemId ?? ''}`;
      setBusy(key);
      try {
        const res = await api.post(`/orders/${encodeURIComponent(reference)}/reorder`, itemId ? { item_id: itemId } : {});
        const answer = reorderAnswer(res.data);
        await reloadCart();
        if (user?.id) {
          for (const a of answer.added) {
            trackEventDirect(user.id, {
              eventType: 'add_to_cart',
              properties: { itemId: a.product_id },
              context: { surface: 'order_again' },
            });
          }
        }
        const left = answer.skipped
          .map((s) => (s.name ? `${s.name}: ${s.reason}` : s.reason))
          .join(' ');
        if (!answer.added.length) {
          toast.error(left || 'Nothing from this order can be bought again right now.');
          return answer;
        }
        const added =
          answer.added.length === 1
            ? `${answer.added[0].name ?? 'It'} is in your cart at today’s price.`
            : `${answer.added.length} pieces are in your cart at today’s prices.`;
        toast.success(added, {
          description: left || undefined,
          action: { label: 'View cart', onClick: () => router.push('/cart') },
        });
        return answer;
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg || 'Could not add this order to your cart.');
        return null;
      } finally {
        setBusy(null);
      }
  };

  return { orderAgain, busy };
}

// ─── Your tailors ──────────────────────────────────────────────
// GET /orders/customer/makers: stores this customer has bought from, newest
// first, only stores still selling.

export interface MyMaker {
  business_id: string;
  business_name: string;
  slug: string | null;
  business_logo_url: string | null;
  verified: boolean;
  accepts_bespoke: boolean;
  orders_count: number;
  last_ordered_at: string;
  made_to_measure: boolean;
  bespoke: boolean;
  /** Newest order from this store that has a listing to put back in the cart. */
  reorder_reference: string | null;
}

function makersFrom(raw: unknown): MyMaker[] {
  let cur = raw as Wrapped | unknown[];
  for (let i = 0; i < 4 && cur; i++) {
    if (Array.isArray(cur)) return cur as MyMaker[];
    cur = (cur as { data?: unknown }).data as Wrapped | unknown[];
  }
  return [];
}

export function useMyMakers(enabled: boolean) {
  const [state, setState] = useRemembered<{ data: MyMaker[] | null; loading: boolean }>('my-makers', {
    data: null,
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: !prev.data }));
    api
      .get('/orders/customer/makers', { params: { limit: 12 } })
      .then((res) => {
        if (!cancelled) setState({ data: makersFrom(res.data), loading: false });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ data: prev.data ?? [], loading: false }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { makers: enabled ? state.data ?? [] : [], loading: enabled && state.loading };
}
