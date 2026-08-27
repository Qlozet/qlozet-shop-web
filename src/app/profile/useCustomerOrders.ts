'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type {
  ApiCustomerOrder,
  ApiCustomerOrdersPaginated,
  ApiOrderEmbeddedOption,
  ApiOrderItem,
  ApiOrderProduct,
  ApiOrderStatus,
  ApiProductImage,
} from '@/lib/api-types';
import type { DesignChoice, Order, OrderItem, OrderStatus, ProductType } from './types';

// ─── Bespoke design payload ───────────────────────────────────
// A design's `description` is a JSON string: { notes, selections: {...} } where
// each selection is either a resolved { name, image, emoji } or a raw value.
const KIND_LABEL: Record<string, string> = {
  silhouette: 'Silhouette', neckline: 'Neckline', sleeve: 'Sleeve', collar: 'Collar',
  fit: 'Fit', fabric: 'Fabric', color: 'Colour', accessories: 'Accessories', style: 'Style',
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function parseDesign(desc?: string): { notes?: string; choices: DesignChoice[] } {
  if (!desc || typeof desc !== 'string') return { choices: [] };
  let parsed: any;
  try {
    parsed = JSON.parse(desc);
  } catch {
    const s = desc.trim();
    return { notes: s || undefined, choices: [] };
  }
  const sel = parsed?.selections ?? {};
  const notes =
    typeof parsed?.notes === 'string' && parsed.notes.trim()
      ? parsed.notes.trim()
      : undefined;
  const choices: DesignChoice[] = [];
  const add = (kind: string, v: any) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach((x) => add(kind, x));
    const label = KIND_LABEL[kind] ?? cap(kind);
    if (typeof v === 'object') {
      const name = v.name ?? v.label;
      if (name) choices.push({ kind, label, name, image: v.image ?? v.imageUrl, emoji: v.emoji });
      return;
    }
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s || kind === 'userPrompt') return;
      if (/^[0-9a-fA-F]{24}$/.test(s)) return; // unresolved id — skip
      if (kind === 'color') {
        const hex = /^#?[0-9a-fA-F]{3,8}$/.test(s) ? (s.startsWith('#') ? s : `#${s}`) : undefined;
        choices.push({ kind, label, name: hex ?? s, swatch: hex });
        return;
      }
      choices.push({ kind, label, name: s });
    }
  };
  for (const [k, v] of Object.entries(sel)) add(k, v);
  return { notes, choices };
}

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
    case 'returned':
      return 'Returned';
    case 'cancelled':
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

function pickImg(imgs?: ApiProductImage[]): string | undefined {
  if (!imgs?.length) return undefined;
  return (imgs.find((i) => i.is_primary) ?? imgs[0])?.url || undefined;
}

// Resolve a selection id against an embedded option catalog → design choice.
function optionChoice(
  kind: string,
  label: string,
  id: string | undefined,
  catalog: ApiOrderEmbeddedOption[] | undefined,
  suffix?: string,
): DesignChoice | null {
  if (!id) return null;
  const opt = (catalog ?? []).find((o) => String(o._id) === String(id));
  if (!opt?.name) return null;
  return {
    kind,
    label,
    name: suffix ? `${opt.name} · ${suffix}` : opt.name,
    image: pickImg(opt.images),
  };
}

// Custom (customize) item design choices. The selection ids point INTO the
// product's own embedded clothing.styles / .fabrics / .accessories arrays, so
// we resolve each id against those to get the real name + image.
function itemChoices(item: ApiOrderItem): DesignChoice[] {
  const out: DesignChoice[] = [];
  const clothing =
    item.product && typeof item.product === 'object'
      ? item.product.clothing
      : undefined;

  const cv = item.color_variant_selections?.[0];
  if (cv?.size) out.push({ kind: 'size', label: 'Size', name: cv.size });

  for (const s of item.style_selections ?? []) {
    const c = optionChoice('style', 'Style', s.style_id, clothing?.styles);
    if (c) out.push(c);
  }
  for (const f of item.fabric_selections ?? []) {
    const c = optionChoice(
      'fabric', 'Fabric', f.fabric_id, clothing?.fabrics,
      f.yardage ? `${f.yardage} yd` : undefined,
    );
    if (c) out.push(c);
  }
  for (const a of item.accessory_selections ?? []) {
    const c = optionChoice('accessories', 'Accessory', a.accessory_id, clothing?.accessories);
    if (c) out.push(c);
  }
  return out;
}

function mapItem(
  item: ApiOrderItem,
  orderType?: string,
  design?: { name?: string; design_images?: string[] },
): OrderItem {
  const productType = resolveProductType(item.product, orderType);
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
    productType,
    vendor: vendor?.business_name,
    vendorLogo: vendor?.business_logo_url,
    pricing: item.pricing,
    choices: productType === 'custom' ? itemChoices(item) : undefined,
    productId:
      item.product && typeof item.product === 'object'
        ? item.product._id
        : typeof item.product === 'string'
          ? item.product
          : undefined,
    businessId:
      item.business && typeof item.business === 'object'
        ? item.business._id
        : typeof item.business === 'string'
          ? item.business
          : undefined,
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
  const parsedDesign = parseDesign(design?.description);
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
          notes: parsedDesign.notes,
          category: design.category,
          gender: design.gender,
          images: designImages,
          referenceImages: (design.reference_images ?? []).filter(Boolean),
          choices: parsedDesign.choices,
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
