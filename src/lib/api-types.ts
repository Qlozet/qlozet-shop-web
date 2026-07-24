// ═══════════════════════════════════════════════════════════════
//  Qlozet Shop — Backend API Type Definitions
//  Mirrors the exact shapes returned by qlozet-backend endpoints.
// ═══════════════════════════════════════════════════════════════

// ─── Shared / Primitive Types ─────────────────────────────────

export interface ApiProductImage {
  url: string;
  public_id?: string;
  alt?: string;
  width?: number;
  height?: number;
  is_primary?: boolean;
  hotspots?: ApiStyleHotspot[];
}

export interface ApiVariant {
  name?: string;
  size?: string;
  sku?: string;
  price: number;
  stock: number;
  yard_per_order?: number;
  images?: ApiProductImage[];
  _id?: string;
}

export interface ApiColorVariant {
  _id?: string;
  name?: string;
  color_name?: string;
  hex?: string;
  hex_code?: string;
  images?: ApiProductImage[];
  variants?: ApiVariant[];
}

export interface ApiTaxonomy {
  product_type?: string;
  categories?: string[];
  audience?: string;
  attributes?: string[];
}

export interface ApiTag {
  name: string;
  slug: string;
  type: 'system' | 'custom';
}

export interface ApiRating {
  user: string;
  value: number;
  comment?: string;
}

// ─── Kind-Specific Sub-Documents ──────────────────────────────

export interface ApiStyleHotspot {
  x: number;
  y: number;
  label: string;
  description?: string;
  field_key?: string;
  anchor?: string;
  zIndex?: number;
}

export interface ApiStyle {
  _id?: string;
  name: string;
  description?: string;
  images?: ApiProductImage[];
  hotspots?: ApiStyleHotspot[];
  categories?: string[];
  attributes?: string[];
  type?: string;
  style_code?: string;
  price?: number;
  min_width_cm?: number;
}

export interface ApiClothing {
  type: 'customize' | 'non_customize';
  name: string;
  description?: string;
  turnaround_days: number;
  taxonomy: ApiTaxonomy;
  status?: string;
  images?: ApiProductImage[];
  styles?: ApiStyle[];
  accessories?: ApiAccessorySubDoc[];
  color_variants?: ApiColorVariant[];
  fabrics?: ApiFabricSubDoc[];
  addons?: ApiAddon[];
  accepts_external_fabric?: boolean;
}

export interface ApiAddonVariant {
  _id?: string;
  name: string;
  price: number;
  color_hex?: string;
  image_url?: string;
}

export interface ApiAddon {
  _id?: string;
  name: string;
  display_type: 'colour' | 'picture';
  variants: ApiAddonVariant[];
}

export interface ApiFabricSubDoc {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  product_type?: string;
  price_per_yard?: number;
  yard_length?: number;
  width?: number;
  pattern?: string;
  colors?: { name: string; hex: string }[];
  min_cut?: number;
  images?: ApiProductImage[];
  variants?: ApiVariant[];
  taxonomy?: ApiTaxonomy;
}

export interface ApiAccessorySubDoc {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  in_stock?: boolean;
  images?: ApiProductImage[];
  variants?: ApiVariant[];
  taxonomy?: ApiTaxonomy;
}

// ─── Populated Business Reference ─────────────────────────────
// Embedded in ApiProduct when the backend populates the business field.

export interface ApiBusinessRef {
  _id: string;
  business_name: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  cover_image_url?: string;
  theme_color?: string;
  description?: string;
}

// ─── Top-Level Product Document ───────────────────────────────
// Returned by GET /products and GET /products/:id

export interface ApiProduct {
  _id: string;
  kind: 'clothing' | 'fabric' | 'accessory';
  base_price: number;
  status: 'active' | 'draft' | 'archived';
  business: ApiBusinessRef; // Populated vendor info
  average_rating: number;
  total_ratings?: number;
  tags: ApiTag[];
  collections: string[];
  ratings: ApiRating[];
  size_guide?: string;
  applied_discount?: string;
  discounted_price?: number;
  discount_percentage?: number;
  scheduled_activation_date?: string;
  seo?: Record<string, unknown>;
  metafields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Kind-specific — only one is non-null per product
  clothing?: ApiClothing;
  fabric?: ApiFabricSubDoc;
  accessory?: ApiAccessorySubDoc;
}

// ─── Pagination Wrappers ──────────────────────────────────────

/** Products pagination (GET /products) */
export interface ApiProductPaginated {
  total_items: number;
  data: ApiProduct[];
  total_pages: number;
  current_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  page_size: number;
}

/** Business pagination (GET /business/public) — different shape! */
export interface ApiBusinessPaginated {
  data: ApiBusinessPublic[];
  total: number;
  page: number;
  pages: number;
}

// ─── Business / Vendor Types ──────────────────────────────────

export interface ApiSocialLinks {
  instagram?: string;
  twitter?: string;
  pinterest?: string;
  youtube?: string;
  tiktok?: string;
}

/** Returned by GET /business/public (trimmed projection) */
export interface ApiSocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  pinterest?: string;
  tiktok?: string;
  website?: string;
  email?: string;
}

export interface ApiBusinessPublic {
  _id: string;
  business_name: string;
  business_logo_url?: string;
  business_logo_svg_url?: string;
  cover_image_url?: string;
  theme_color?: string;
  description?: string;
  business_category?: string;
  business_address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  social_links?: ApiSocialLinks;
  average_rating?: number;
  total_ratings?: number;
  total_items_sold?: number;
  success_rate?: number;
  is_featured?: boolean;
  year_founded?: string;
  createdAt: string;
}

/** Returned by GET /business/public/:id (adds computed fields) */
export interface ApiBusinessPublicDetail extends ApiBusinessPublic {
  total_products: number;
  followers_count: number;
  successful_deliveries?: number;
}

// ─── Ratings / Reviews ────────────────────────────────────────

export interface ApiProductRatingsResponse {
  average_rating: number;
  total_ratings: number;
  distribution: Record<string, number>;
  reviews: ApiRating[];
}

export interface ApiVendorReview {
  product_id: string;
  product_name: string;
  user: { _id: string; full_name: string };
  value: number;
  comment?: string;
}

export interface ApiVendorReviewsResponse {
  reviews: ApiVendorReview[];
  total: number;
  page: number;
  pages: number;
}

// ─── Collections ──────────────────────────────────────────────

export interface ApiCollection {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: ApiProductImage;
  cover_image?: string;
  is_active?: boolean;
  products?: ApiProduct[];
  product_count?: number;
  is_featured?: boolean;
  createdAt?: string;
}

// ─── Taxonomy ─────────────────────────────────────────────────

export interface ApiTaxonomyNode {
  _id: string;
  name: string;
  slug: string;
  kind?: string;
  parent?: string;
  children?: ApiTaxonomyNode[];
}

// ─── Recommendations ──────────────────────────────────────────

export type ReasonCode =
  | 'STYLE_MATCH'
  | 'AESTHETIC_MATCH'
  | 'TRUSTED_VENDOR'
  | 'FAST_ETA'
  | 'PRICE_FIT'
  | 'FIT_COMPATIBLE'
  | 'TRENDING';

export interface ApiFeedItem {
  itemId: string;
  position: number;
  stream: string;
  reasonCodes: ReasonCode[];
  explanations: string[];
  name: string;
  price: number;
  vendor: string;
  /** Full populated product object (hydrated by backend) */
  product?: ApiProduct;
}

export interface ApiVendorFeedItem {
  vendorId: string;
  vendorName: string;
  vendorScore: number;
  reasonCodes: string[];
  explanations: string[];
  products: ApiFeedItem[];
  successRate?: number;
  isFeatured?: boolean;
}

export interface ApiFeedResponse {
  requestId: string;
  items: ApiFeedItem[];
  stream?: string;
}

export interface ApiVendorFeedResponse {
  requestId: string;
  vendors: ApiVendorFeedItem[];
}

export interface ApiAskResponse {
  reply: string;
  products: ApiProduct[];
  tokensUsed: number;
}

// ─── Query Parameter Types ────────────────────────────────────

export interface ProductQueryParams {
  page?: number;
  size?: number;
  kind?: 'clothing' | 'fabric' | 'accessory';
  search?: string;
  status?: 'active' | 'draft' | 'archived';
  business_id?: string;
  product_type?: string;
  category?: string;
  audience?: string;
  sortBy?: 'rating' | 'date' | 'relevance';
  order?: 'asc' | 'desc';
}

export interface VendorQueryParams {
  page?: number;
  limit?: number;
}

// ─── Vendor Collection Pagination ─────────────────────────────

export interface ApiCollectionPaginated {
  total_items: number;
  data: ApiCollection[];
  total_pages: number;
  current_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  page_size: number;
}

// ─── Vendor Discounts ─────────────────────────────────────────

export type DiscountType =
  | 'percentage'
  | 'fixed'
  | 'store_wide'
  | 'flash_percentage'
  | 'flash_fixed'
  | 'category_specific';

export interface ApiDiscount {
  _id: string;
  type: DiscountType;
  value: number;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface FeedQueryParams {
  limit?: number;
  budgetMax?: number;
  deadlineDays?: number;
  category?: string;
  gender?: string;
}

export interface ApiSizeMeasurement {
  body_part: string;
  min: number;
  max: number;
}

export interface ApiSizeDefinition {
  label: string;
  sort_order: number;
  measurements: ApiSizeMeasurement[];
}

export interface ApiFitAllowance {
  body_part: string;
  value: number;
}

export interface ApiFitType {
  name: string;
  label: string;
  description: string;
  allowances: ApiFitAllowance[];
}

export interface ApiSizeGuide {
  _id: string;
  title: string;
  description?: string;
  unit: string;
  body_parts: string[];
  sizes: ApiSizeDefinition[];
  fit_types?: ApiFitType[];
}

export interface ApiSizeBreakdown {
  body_part: string;
  customer_value: number;
  range: string;
  fits: boolean;
  note: string | null;
}

export interface ApiGarmentMeasurement {
  body_part: string;
  body_range: string;
  garment_range: string;
  ease: number;
  fit_label: string;
}

export interface ApiSizeRecommendation {
  recommended_size: string;
  confidence: number;
  unit: string;
  breakdown: ApiSizeBreakdown[];
  garment_measurements?: ApiGarmentMeasurement[];
}

// ═══════════════════════════════════════════════════════════════
//  Helper Extractors
//  Pure functions to pull common display values from backend
//  shapes. Not normalizers — just convenience getters.
// ═══════════════════════════════════════════════════════════════

/** Get the display name for any product kind */
export function getProductName(p: ApiProduct): string {
  if (p.kind === 'clothing' && p.clothing) return p.clothing.name;
  if (p.kind === 'fabric' && p.fabric) return p.fabric.name;
  if (p.kind === 'accessory' && p.accessory) return p.accessory.name;
  return 'Untitled Product';
}

/** Get the display price (base_price, or discounted_price if available) */
export function getProductPrice(p: ApiProduct): number {
  if (p.discounted_price != null && p.discounted_price > 0) return p.discounted_price;
  return p.base_price;
}

/** Get the original price (before discount). Returns base_price. */
export function getProductOriginalPrice(p: ApiProduct): number {
  return p.base_price;
}

/** Check if product has an active discount */
export function hasDiscount(p: ApiProduct): boolean {
  return (
    p.discounted_price != null &&
    p.discounted_price > 0 &&
    p.discounted_price < p.base_price
  );
}

/** Get the first image URL for any product kind */
export function getProductImage(p: ApiProduct): string {
  const images = getProductImages(p);
  return images[0] ?? '';
}

/** Get all image URLs for any product kind */
export function getProductImages(p: ApiProduct): string[] {
  let imgs: ApiProductImage[] = [];
  if (p.kind === 'clothing' && p.clothing?.images) {
    imgs = p.clothing.images;
  } else if (p.kind === 'fabric' && p.fabric?.images) {
    imgs = p.fabric.images;
  } else if (p.kind === 'accessory' && p.accessory?.images) {
    imgs = p.accessory.images;
  }
  return imgs.map((img) => img.url).filter(Boolean);
}

/** Get the product description */
export function getProductDescription(p: ApiProduct): string {
  if (p.kind === 'clothing') return p.clothing?.description ?? '';
  if (p.kind === 'fabric') return p.fabric?.description ?? '';
  if (p.kind === 'accessory') return p.accessory?.description ?? '';
  return '';
}

/** Get the taxonomy (categories, product_type, audience, attributes) */
export function getProductTaxonomy(p: ApiProduct): ApiTaxonomy | null {
  if (p.kind === 'clothing') return p.clothing?.taxonomy ?? null;
  if (p.kind === 'fabric') return p.fabric?.taxonomy ?? null;
  if (p.kind === 'accessory') return p.accessory?.taxonomy ?? null;
  return null;
}

/** Get available colors as { name, hex } pairs */
export function getProductColors(p: ApiProduct): { name: string; hex: string }[] {
  if (p.kind === 'clothing' && p.clothing?.color_variants) {
    return p.clothing.color_variants.map((cv) => ({
      name: cv.name || cv.color_name || '',
      hex: cv.hex || cv.hex_code || '',
    }));
  }
  if (p.kind === 'fabric' && p.fabric?.colors) {
    return p.fabric.colors;
  }
  return [];
}

/** Get available sizes */
export function getProductSizes(p: ApiProduct): string[] {
  if (p.kind === 'clothing' && p.clothing?.color_variants) {
    const sizes = new Set<string>();
    for (const cv of p.clothing.color_variants) {
      for (const v of cv.variants ?? []) {
        if (v.size) sizes.add(v.size);
      }
    }
    return Array.from(sizes);
  }
  if (p.kind === 'fabric' && p.fabric?.variants) {
    return p.fabric.variants.map((v) => v.size).filter(Boolean) as string[];
  }
  if (p.kind === 'accessory' && p.accessory?.variants) {
    return p.accessory.variants.map((v) => v.name).filter(Boolean) as string[];
  }
  return [];
}

/** Get the product type label (e.g. "CUSTOMIZABLE", "FABRIC YARD", "ACCESSORY") */
export function getProductTag(p: ApiProduct): string {
  if (p.kind === 'clothing' && p.clothing?.type === 'customize') return 'CUSTOMIZABLE';
  if (p.kind === 'fabric') return 'FABRIC YARD';
  if (p.kind === 'accessory') return 'ACCESSORY';
  if (p.tags?.length > 0 && p.tags[0]?.name) return p.tags[0].name.toUpperCase();
  return '';
}

/** Get turnaround days (clothing only) */
export function getTurnaroundDays(p: ApiProduct): number | null {
  if (p.kind === 'clothing' && p.clothing) return p.clothing.turnaround_days;
  return null;
}

/** Get fabric price per yard (fabric only) */
export function getFabricPricePerYard(p: ApiProduct): number | null {
  if (p.kind === 'fabric' && p.fabric?.price_per_yard != null) {
    return p.fabric.price_per_yard;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  Cart Selections
//  Mirrors backend OrderItemSelectionsDto for add-to-cart
// ═══════════════════════════════════════════════════════════════

export interface CartColorVariantSelection {
  color_variant_id: string;
  size?: string;
  quantity?: number;
}

export interface CartFabricSelection {
  fabric_id: string;
  yardage?: number;
  size?: string;
  quantity?: number;
}

export interface CartStyleSelection {
  style_id: string;
}

export interface CartAccessorySelection {
  accessory_id: string;
  // Optional: the variant only pins stock. Accessories are priced at their base
  // price, so an accessory without a variant is still a valid selection.
  variant_id?: string;
  quantity?: number;
}

export interface CartAddonSelection {
  addon_id: string;
  variant_id: string;
  quantity?: number;
}

export interface CartSelections {
  color_variant_selections?: CartColorVariantSelection[];
  fabric_selections?: CartFabricSelection[];
  style_selections?: CartStyleSelection[];
  accessory_selections?: CartAccessorySelection[];
  addon_selections?: CartAddonSelection[];
}

// ═══════════════════════════════════════════════════════════════
//  Checkout Preview
//  Response from POST /orders/checkout-preview
// ═══════════════════════════════════════════════════════════════

export interface CourierRate {
  courier_id: string | number;
  courier_name: string;
  courier_image: string;
  service_code: string;
  rate_amount: number;
  delivery_eta: string;
  delivery_eta_time: string;
  insurance_fee: number;
  insurance_code: string;
}

export interface VendorShippingRate {
  business_id: string;
  business_name: string;
  items: { product_id: string; product_name: string }[];
  request_token: string;
  rates: CourierRate[];
  cheapest_rate: number;
  fastest_rate: number;
}

export interface FabricTransferRate {
  fabric_vendor_id: string;
  fabric_vendor_name: string;
  tailor_vendor_id: string;
  tailor_vendor_name: string;
  fabric_product_id: string;
  fabric_name: string;
  fabric_yards: number;
  request_token: string;
  rates: CourierRate[];
  cheapest_rate: number;
  fastest_rate: number;
}

export interface CheckoutPreviewResponse {
  vendor_shipping: VendorShippingRate[];
  fabric_transfers: FabricTransferRate[];
  total_shipping_fee: number;
  subtotal: number;
  total: number;
}

// ═══════════════════════════════════════════════════════════════
//  Create Order
//  Payload for POST /orders
// ═══════════════════════════════════════════════════════════════

export interface OrderItemPayload {
  product_id: string;
  note?: string;
  quantity?: number;
  selections: CartSelections;
}

export interface SelectedShipping {
  business_id: string;
  request_token: string;
  courier_id: string;
  service_code: string;
  courier_name: string;
  shipping_fee: number;
}

export interface SelectedFabricTransfer {
  fabric_vendor_id: string;
  tailor_vendor_id: string;
  fabric_product_id: string;
  fabric_yards: number;
  request_token: string;
  courier_id: string;
  service_code: string;
  courier_name: string;
  shipping_fee: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  selected_shipping?: SelectedShipping[];
  selected_fabric_transfers?: SelectedFabricTransfer[];
  address_id?: string;
  payment_method?: 'paystack' | 'wallet';
}

// ═══════════════════════════════════════════════════════════════
//  Order Response
//  Returned from POST /orders
// ═══════════════════════════════════════════════════════════════

export interface OrderResponse {
  _id: string;
  reference: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  authorization_url?: string; // Paystack redirect URL
  access_code?: string;
}
