'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  ApiCustomerOrder,
  ApiCustomerOrdersPaginated,
  ApiOrderItem,
  ApiOrderProduct,
  ApiOrderStatus,
} from '@/lib/api-types';
import type { Order, OrderItem, OrderStatus, ProductType } from './types';

// ─── Status mapping ───────────────────────────────────────────
// Collapse the backend's seven order statuses onto the profile UI states.
// `pending` = not yet paid; once paid (in_review) or the vendor has confirmed
// (processing) it's "Processing" — so a confirmed order no longer reads as
// "Pending". `in_transit` = shipped (the vendor fulfilled or the courier picked
// it up).
function mapStatus(status: ApiOrderStatus): OrderStatus {
  switch (status) {
    case 'completed':
      return 'Delivered';
    case 'in_transit':
      return 'Shipped';
    case 'in_review':
    case 'processing':
      return 'Processing';
    case 'cancelled':
    case 'returned':
      return 'Refused';
    case 'pending':
    default:
      return 'Pending';
  }
}

// ─── Product-type inference ───────────────────────────────────
function resolveProductType(
  product: ApiOrderProduct | string | null,
  orderType?: string,
): ProductType {
  if (orderType === 'bespoke') return 'bespoke';
  if (!product || typeof product === 'string') return 'ready-to-wear';
  if (product.kind === 'fabric') return 'fabric';
  if (product.kind === 'accessory') return 'accessories';
  if (product.kind === 'clothing') {
    return product.clothing?.type === 'customize' ? 'custom' : 'ready-to-wear';
  }
  return 'ready-to-wear';
}

function resolveName(product: ApiOrderProduct | string | null): string {
  if (!product || typeof product === 'string') return 'Product';
  return (
    product.clothing?.name ||
    product.accessory?.name ||
    product.fabric?.name ||
    'Product'
  );
}

function resolveImage(product: ApiOrderProduct | string | null): string {
  if (!product || typeof product === 'string') return '';
  const imgs =
    product.clothing?.images ||
    product.accessory?.images ||
    product.fabric?.images ||
    [];
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  return primary?.url || '';
}

function resolveSize(item: ApiOrderItem): string {
  const cv = item.color_variant_selections?.[0]?.size;
  if (cv) return cv;
  const fabYards = item.fabric_selections?.[0]?.yardage;
  if (fabYards) return `${fabYards} yd`;
  return '—';
}

function resolveQty(item: ApiOrderItem): number {
  const groups = [
    item.color_variant_selections,
    item.fabric_selections,
    item.accessory_selections,
  ];
  let qty = 0;
  for (const g of groups) {
    for (const s of g ?? []) qty += s.quantity ?? 0;
  }
  return qty > 0 ? qty : 1;
}

function mapItem(
  item: ApiOrderItem,
  orderType?: string,
  design?: { name?: string; design_images?: string[] },
): OrderItem {
  const vendor =
    item.business && typeof item.business === 'object'
      ? item.business
      : undefined;
  const isBespoke = orderType === 'bespoke';
  // Bespoke items have no catalog product — the name/image come from the design.
  const name = isBespoke
    ? design?.name || 'Custom outfit'
    : resolveName(item.product);
  const image = isBespoke
    ? design?.design_images?.[0] || resolveImage(item.product)
    : resolveImage(item.product);
  return {
    name,
    image,
    // No stored colour on the order — use a neutral swatch placeholder.
    fabric: '#EAEAEA',
    size: resolveSize(item),
    qty: resolveQty(item),
    price: item.total_price ?? item.pricing?.final ?? 0,
    productType: resolveProductType(item.product, orderType),
    vendor: vendor?.business_name,
    vendorLogo: vendor?.business_logo_url,
    pricing: item.pricing,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Map a backend order to the profile display shape. */
export function mapApiOrder(o: ApiCustomerOrder): Order {
  const design =
    o.bespoke_design && typeof o.bespoke_design === 'object'
      ? o.bespoke_design
      : undefined;
  const items = (o.items ?? []).map((it) => mapItem(it, o.type, design));
  const activeShipment =
    o.shipments?.find((s) => s.tracking_number) ?? o.shipments?.[0];
  const designImages = (design?.design_images ?? []).filter(Boolean);
  return {
    id: o._id,
    orderNumber: o.reference || `#${o._id.slice(-8).toUpperCase()}`,
    date: formatDate(o.createdAt),
    total: o.total ?? 0,
    status: mapStatus(o.status),
    images:
      o.type === 'bespoke' && designImages.length
        ? designImages.slice(0, 3)
        : items.map((i) => i.image).filter(Boolean).slice(0, 3),
    items,
    subtotal: o.subtotal,
    shippingFee: o.shipping_fee,
    tracking: activeShipment?.tracking_number,
    courier: activeShipment?.courier_name,
    paymentStatus: o.payment_status,
    refundStatus: o.refund_status,
    bespoke: design
      ? {
          name: design.name,
          description: design.description,
          category: design.category,
          gender: design.gender,
          images: designImages,
        }
      : undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────

export interface UseCustomerOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCustomerOrders(params: { size?: number } = {}): UseCustomerOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = params.size ?? 50;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders/customer', { params: { page: 1, size } });
      // API wrapper may nest the paginated payload under data.
      const payload: ApiCustomerOrdersPaginated =
        res.data?.data ?? res.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setOrders(list.map(mapApiOrder));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
