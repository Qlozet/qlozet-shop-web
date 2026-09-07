// ─── Profile Page Types ──────────────────────────────────────
export type ActiveSection =
  | 'welcome'
  | 'personal-info'
  | 'address-book'
  | 'add-address'
  | 'wallet'
  | 'wallet-detail'
  | 'fund-wallet'
  | 'fund-wallet-success'
  | 'buy-tokens'
  | 'confirm-token-purchase'
  | 'token-purchase-success'
  | 'orders'
  | 'order-detail'
  | 'order-item-detail'
  | 'return-order'
  | 'track-order'
  | 'track-return'
  | 'measurements'
  | 'measurement-detail'
  | 'add-measurement'
  | 'measurement-form'
  | 'measurement-results'
  | 'account-security'
  | 'change-password'
  | 'notifications'
  | 'payment-information'
  | 'add-card'
  | 'following'
  | 'reserved-fabric';

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Returned'
  | 'Refused';

// ─── Measurement Types (aligned with backend MeasurementInputDto) ──
export interface MeasurementValues {
  chest: number;
  waist: number;
  hip: number;
  shoulder_breadth: number;
  arm_length: number;
  leg_length: number;
  bicep: number;
  forearm: number;
  thigh: number;
  calf: number;
  wrist: number;
  ankle: number;
  height: number;
  shoulder_to_crotch: number;
}

export const MEASUREMENT_LABELS: Record<keyof MeasurementValues, string> = {
  chest: 'Chest',
  waist: 'Waist',
  hip: 'Hips',
  shoulder_breadth: 'Shoulder Width',
  arm_length: 'Arm Length',
  leg_length: 'Leg Length',
  bicep: 'Bicep',
  forearm: 'Forearm',
  thigh: 'Thigh',
  calf: 'Calf',
  wrist: 'Wrist',
  ankle: 'Ankle',
  height: 'Height',
  shoulder_to_crotch: 'Torso Length',
};

export const EMPTY_MEASUREMENTS: MeasurementValues = {
  chest: 0, waist: 0, hip: 0, shoulder_breadth: 0,
  arm_length: 0, leg_length: 0, bicep: 0, forearm: 0,
  thigh: 0, calf: 0, wrist: 0, ankle: 0,
  height: 0, shoulder_to_crotch: 0,
};

// ── Tailoring measurements ──────────────────────────────────────
// Derived by the AI prediction alongside the 14 body points: the numbers a
// tailor actually cuts from (inseam, sleeve length, nape-to-waist…). Each
// carries a confidence tier the UI surfaces as a chip.
export type TailoringTier =
  | 'input'
  | 'predicted'
  | 'measured'
  | 'estimated'
  | 'rough';

export interface TailoringMeasurement {
  name: string;
  label: string;
  value_cm: number;
  tier: TailoringTier;
  /** Expected absolute error in cm (per the model's held-out set), if known. */
  mae_cm?: number | null;
  method?: string;
}

/** Per-measurement provenance, keyed by name — persisted with the set. */
export type TailoringMeta = Record<
  string,
  { tier?: TailoringTier; mae_cm?: number | null; method?: string }
>;

/** Display labels; unknown keys fall back to a humanized name. */
export const TAILORING_LABELS: Record<string, string> = {
  inseam: 'Inside Leg (Inseam)',
  outseam: 'Outside Leg (Outseam)',
  sleeve_length: 'Sleeve Length',
  nape_to_waist: 'Back Length (Nape–Waist)',
  neck: 'Neck',
  neck_base: 'Neck Base',
  knee: 'Knee',
  mid_thigh: 'Mid Thigh',
  lower_thigh: 'Lower Thigh',
  belly_waist: 'Belly Waist',
  top_hip: 'High Hip',
  under_bust: 'Under Bust',
  waist_height: 'Waist Height',
  ankle_height: 'Ankle Height',
  neck_height: 'Neck Height',
};

export const tailoringLabel = (key: string): string =>
  TAILORING_LABELS[key] ??
  key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Tier → chip copy + colors. Keep the science in tooltips, not on screen. */
export const TIER_META: Record<TailoringTier, { label: string; color: string; bg: string }> = {
  input: { label: 'Entered', color: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)' },
  predicted: { label: 'Predicted', color: '#166534', bg: 'rgba(34,197,94,0.12)' },
  measured: { label: 'Measured', color: '#166534', bg: 'rgba(34,197,94,0.12)' },
  estimated: { label: 'Calculated', color: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)' },
  rough: { label: 'Verify', color: '#92400E', bg: 'rgba(245,158,11,0.15)' },
};

export interface MeasurementProfile {
  id: string;
  name: string;
  isDefault: boolean;
  unit: 'cm' | 'inch';
  values: MeasurementValues;
  /** Extra tailoring keys stored on the set beyond the core 14 (cm). */
  tailoring?: Record<string, number>;
  /** Per-measurement { tier, mae_cm, method } persisted with the set. */
  tailoringMeta?: TailoringMeta;
  /** Prediction inputs (height/weight_kg/gender/variant…) for audit. */
  inputs?: Record<string, unknown>;
}

export type ProductType = 'custom' | 'ready-to-wear' | 'fabric' | 'accessories' | 'bespoke';

export interface OrderItemPricing {
  base: number;
  styles_total: number;
  fabric_total: number;
  variant_total: number;
  accessories_total: number;
  addons_total: number;
  before_discount: number;
  discount: number;
  final: number;
}

export interface OrderItem {
  name: string;
  image: string;
  fabric: string;
  size: string;
  qty: number;
  price: number;
  productType: ProductType;
  vendor?: string;
  vendorLogo?: string;
  vendorRating?: string;
  /** Frozen itemized pricing snapshot from the backend (real numbers). */
  pricing?: OrderItemPricing;
  /** Custom (customize) item's design choices — populated styles/fabric/etc. */
  choices?: DesignChoice[];
  /** Name of the measurement set this garment was locked to at order time
   *  (e.g. "Dad") — from the per-item body_profile snapshot. */
  measurementSetName?: string;
  /** Catalog product id — used to review the item after delivery. */
  productId?: string;
  /** Vendor business id — used to scope a return request to the right vendor. */
  businessId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  images: string[];
  items: OrderItem[];
  /** Real order-level figures (present for API-backed orders). */
  subtotal?: number;
  shippingFee?: number;
  tracking?: string;
  courier?: string;
  paymentStatus?: 'unpaid' | 'paid';
  refundStatus?: 'none' | 'partial' | 'refunded';
  /** Bespoke design attached to a custom outfit order (real data). */
  bespoke?: {
    name?: string;
    /** Free-text note the customer left (parsed out of the design payload). */
    notes?: string;
    category?: string;
    gender?: string;
    images: string[];
    referenceImages: string[];
    /** Structured design selections (styles, fabric, colour…) with name/image. */
    choices: DesignChoice[];
  };
}

export interface DesignChoice {
  kind: string;
  label: string;
  name: string;
  image?: string;
  emoji?: string;
  swatch?: string;
}

export interface Transaction {
  id: string;
  type: 'points-earned' | 'points-spent' | 'ngn-deposit' | 'ngn-spent';
  description: string;
  date: string;
  amount: string;
  isPositive: boolean;
  detail?: {
    title: string;
    subtitle: string;
    image?: string;
    rewardPts: string;
    brands?: string[];
    usedBy?: string;
  };
}

export interface AddressEntry {
  id: string;
  name: string;
  lines: string[];
  isDefault: boolean;
}
