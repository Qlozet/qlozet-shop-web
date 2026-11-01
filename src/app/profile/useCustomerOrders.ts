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
import type { DesignChoice, Order, OrderItem, OrderStatus, Parcel, ProductType } from './types';

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
  // Check the item's own product FIRST: a bespoke order can carry a real
  // catalog product (the attached fabric), which must present as itself —
  // only the productless design line falls back to the order type.
  if (product && typeof product !== 'string') {
    if (product.kind === 'fabric') return 'fabric';
    if (product.kind === 'accessory') return 'accessories';
    if (product.kind === 'clothing') {
      return product.clothing?.type === 'customize'
        ? 'custom'
        : 'ready-to-wear';
    }
  }
  if (orderType === 'bespoke') return 'bespoke';
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

  // Fabric applied from the marketplace. It is NOT one of the garment's own
  // fabric options, so it never appeared among the loops above — the customer
  // chose a fabric and then could not see it anywhere on their order.
  const applied = item.applied_fabric;
  if (applied && typeof applied === 'object') {
    const name = applied.fabric?.name;
    if (name) {
      const vendor =
        applied.business && typeof applied.business === 'object'
          ? applied.business.business_name
          : undefined;
      const yards = item.applied_fabric_yards;
      out.push({
        kind: 'fabric',
        label: vendor ? `Fabric from ${vendor}` : 'Fabric',
        name: yards ? `${name} — ${yards} yd` : name,
        image: pickImg(applied.fabric?.images),
      });
    }
  }

  return out;
}

/**
 * Is this the tailor's line of a bespoke order (the garment itself)? The
 * backend always puts it first. It has no product when the fabric came from
 * another vendor or the tailor buys it, but carries the FABRIC as its product
 * when the tailor uses fabric from their own shop, so "no product" alone
 * misses that case and the order showed the fabric instead of the design.
 * Another vendor's fabric is a separate, later line and shows as itself.
 */
function isBespokeDesignLine(
  item: ApiOrderItem,
  index: number,
  orderType?: string,
): boolean {
  if (orderType !== 'bespoke') return false;
  return index === 0 || resolveName(item.product) === 'Product';
}

// The tailor's own fabric on the design line: a material of the garment.
function tailorFabricChoice(item: ApiOrderItem): DesignChoice | null {
  const product = item.product;
  if (!product || typeof product === 'string' || product.kind !== 'fabric') return null;
  const name = product.fabric?.name;
  if (!name) return null;
  const yards = item.fabric_selections?.[0]?.yardage;
  return {
    kind: 'fabric',
    label: "Fabric from the tailor's shop",
    name: yards ? `${name} — ${yards} yd` : name,
    image: pickImg(product.fabric?.images),
  };
}

function mapItem(
  item: ApiOrderItem,
  orderType?: string,
  design?: { name?: string; design_images?: string[] },
  index = 0,
): OrderItem {
  const vendor =
    item.business && typeof item.business === 'object'
      ? item.business
      : undefined;
  // The DESIGN line of a bespoke order takes the design's identity; its
  // fabric (the tailor's own, or another vendor's applied to it) is listed
  // as a material of the design. Another vendor's fabric line is its own
  // catalog product and shows as itself.
  const isDesignItem = isBespokeDesignLine(item, index, orderType);
  const productType = isDesignItem
    ? 'bespoke'
    : resolveProductType(item.product, orderType);
  const name = isDesignItem ? design?.name || 'Custom outfit' : resolveName(item.product);
  const image = isDesignItem
    ? design?.design_images?.[0] || resolveImage(item.product)
    : resolveImage(item.product);
  const designMaterials = isDesignItem
    ? [tailorFabricChoice(item), ...itemChoices(item).filter((c) => c.kind === 'fabric')].filter(
        (c): c is DesignChoice => !!c,
      )
    : undefined;
  return {
    name,
    image,
    // No stored colour on the order — use a neutral swatch placeholder.
    fabric: '#EAEAEA',
    // The design line is one garment; its fabric yards are a material, not a size.
    size: isDesignItem ? '—' : resolveSize(item),
    qty: isDesignItem ? 1 : resolveQty(item),
    price: item.total_price ?? item.pricing?.final ?? 0,
    productType,
    vendor: vendor?.business_name,
    vendorLogo: vendor?.business_logo_url,
    pricing: item.pricing,
    choices: isDesignItem
      ? designMaterials
      : productType === 'custom'
        ? itemChoices(item)
        : undefined,
    // The order-time measurement snapshot's set name ("Dad", "Mum"…) — shown
    // so the customer can confirm WHO each garment is being sewn for.
    measurementSetName: (item as any).body_profile?.set_name ?? undefined,
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

/**
 * The deliveries coming to the customer: one per vendor, each with its own
 * courier, tracking and timeline. Fabric sent to a tailor is not a parcel the
 * customer receives, and a declined vendor sends nothing.
 */
function mapParcels(o: ApiCustomerOrder, items: OrderItem[]): Parcel[] {
  return (o.shipments ?? [])
    .filter((s) => s.shipment_type !== 'fabric_transfer' && !s.rejected)
    .map((s, i) => {
      const businessId =
        typeof s.business === 'object' ? s.business?._id : s.business;
      const vendor =
        (typeof s.business === 'object' ? s.business?.business_name : undefined) ??
        items.find((it) => businessId && it.businessId === businessId)?.vendor;
      return {
        id: s._id ?? `${o._id}-${i}`,
        businessId: businessId ? String(businessId) : undefined,
        vendor,
        courier: s.courier_name,
        trackingNumber: s.tracking_number,
        trackingUrl: s.tracking_url ?? undefined,
        status: s.status,
        events: (s.tracking_events ?? []).filter((e) => e?.status && e?.at),
      };
    });
}

/** Map a backend order to the profile display shape. */
export function mapApiOrder(o: ApiCustomerOrder): Order {
  const design =
    o.bespoke_design && typeof o.bespoke_design === 'object'
      ? o.bespoke_design
      : undefined;
  const items = (o.items ?? []).map((it, i) => mapItem(it, o.type, design, i));
  const activeShipment =
    o.shipments?.find((s) => s.tracking_number) ?? o.shipments?.[0];
  const designImages = (design?.design_images ?? []).filter(Boolean);
  const parsedDesign = parseDesign(design?.description);
  return {
    id: o._id,
    type: o.type,
    preship: (o as any).preship ?? null,
    paymentPlan: (o as any).payment_plan ?? null,
    fitFeedback: (o as any).fit_feedback ?? null,
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
    parcels: mapParcels(o, items),
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

/**
 * One of the customer's orders by its reference, for a link that opens it
 * (a notification) when it isn't on the first page of the list.
 */
export async function fetchCustomerOrder(reference: string): Promise<Order | null> {
  try {
    const res = await api.get('/orders/customer', { params: { reference, page: 1, size: 1 } });
    const payload: ApiCustomerOrdersPaginated = res.data?.data ?? res.data;
    const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
    return first && first.reference === reference ? mapApiOrder(first) : null;
  } catch {
    return null;
  }
}

export interface UseCustomerOrdersReturn {
  orders: Order[];
  loading: boolean;
  /** True while an additional page is being appended. */
  loadingMore: boolean;
  error: string | null;
  /** Total order count on the server (all pages). */
  totalItems: number;
  /** Whether another page exists beyond what's loaded. */
  hasMore: boolean;
  /** Append the next page to the list. */
  loadMore: () => void;
  /** Reload from page 1 (after cancel/return/etc.). */
  refetch: () => void;
}

export function useCustomerOrders(params: { size?: number } = {}): UseCustomerOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const size = params.size ?? 15;

  const fetchPage = useCallback(async (pageToLoad: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else { setLoading(true); setError(null); }
    try {
      const res = await api.get('/orders/customer', { params: { page: pageToLoad, size } });
      // API wrapper may nest the paginated payload under data.
      const payload: ApiCustomerOrdersPaginated =
        res.data?.data ?? res.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const mapped = list.map(mapApiOrder);
      setOrders((prev) => (append ? [...prev, ...mapped] : mapped));
      setPage(pageToLoad);
      const meta: any = payload;
      setTotalItems(meta?.total_items ?? (append ? undefined : mapped.length) ?? 0);
      setHasMore(
        typeof meta?.has_next_page === 'boolean'
          ? meta.has_next_page
          : mapped.length === size // fallback when meta is absent
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load orders';
      if (!append) { setError(message); setOrders([]); }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [size]);

  const refetch = useCallback(() => { fetchPage(1, false); }, [fetchPage]);
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) fetchPage(page + 1, true);
  }, [fetchPage, page, loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  return { orders, loading, loadingMore, error, totalItems, hasMore, loadMore, refetch };
}
