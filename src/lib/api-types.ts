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
  color_name: string;
  hex_code: string;
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
}

export interface ApiStyle {
  name: string;
  description?: string;
  images?: ApiProductImage[];
  hotspots?: ApiStyleHotspot[];
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
}

export interface ApiFabricSubDoc {
  name: string;
  description?: string;
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
      name: cv.color_name,
      hex: cv.hex_code,
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
