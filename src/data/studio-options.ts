// ═══════════════════════════════════════════════════════════════
//  Studio / Customization Option Data
//  Single source of truth for all bespoke & product customization options.
// ═══════════════════════════════════════════════════════════════

// ── Interfaces ──────────────────────────────────────────────────

export interface StyleOption {
  id: string;
  label: string;
  emoji: string;
  extraCost?: number;
}

export interface FabricOption {
  id: string;
  name: string;
  image: string;
  extraCost?: number;
}

export interface AccessoryOption {
  id: string;
  name: string;
  emoji: string;
  extraCost?: number;
}

export interface FitOption {
  id: string;
  label: string;
  desc: string;
}

// ── Silhouettes ─────────────────────────────────────────────────

export const SILHOUETTES: StyleOption[] = [
  { id: 's1', label: 'Balanced & Timeless', emoji: '👗', extraCost: 0 },
  { id: 's2', label: 'A-Line Flare', emoji: '👘', extraCost: 2000 },
  { id: 's3', label: 'Bodycon Fitted', emoji: '🩱', extraCost: 3000 },
  { id: 's4', label: 'Empire Waist', emoji: '👚', extraCost: 2500 },
  { id: 's5', label: 'Draped Wrap', emoji: '🧣', extraCost: 5000 },
  { id: 's6', label: 'Peplum Shape', emoji: '👙', extraCost: 5000 },
];

// ── Necklines ───────────────────────────────────────────────────

export const NECKLINES: StyleOption[] = [
  { id: 'n1', label: 'V-Neck Classic', emoji: '👗', extraCost: 0 },
  { id: 'n2', label: 'Sweetheart', emoji: '💕', extraCost: 1500 },
  { id: 'n3', label: 'Off-Shoulder', emoji: '👘', extraCost: 3000 },
  { id: 'n4', label: 'High Neck', emoji: '🧣', extraCost: 1000 },
  { id: 'n5', label: 'Boat Neck', emoji: '⛵', extraCost: 2000 },
  { id: 'n6', label: 'Square Neck', emoji: '⬜', extraCost: 1500 },
];

// ── Sleeves ─────────────────────────────────────────────────────

export const SLEEVES: StyleOption[] = [
  { id: 'sl1', label: 'Puff Sleeve', emoji: '🎈', extraCost: 2000 },
  { id: 'sl2', label: 'Bell Sleeve', emoji: '🔔', extraCost: 2500 },
  { id: 'sl3', label: 'Cap Sleeve', emoji: '🧢', extraCost: 0 },
  { id: 'sl4', label: 'Long Fitted', emoji: '🧤', extraCost: 1500 },
  { id: 'sl5', label: 'Sleeveless', emoji: '💪', extraCost: 0 },
  { id: 'sl6', label: 'Bishop Sleeve', emoji: '✝️', extraCost: 3000 },
];

// ── Fabrics ─────────────────────────────────────────────────────

export const FABRICS: FabricOption[] = [
  { id: 'f1', name: 'Ankara Wax Print', image: '/image/fabric-swatch-1.jpg' },
  { id: 'f2', name: 'French Lace', image: '/image/fabric-swatch-2.jpg', extraCost: 8000 },
  { id: 'f3', name: 'Aso-Oke Weave', image: '/image/fabric-swatch-3.jpg', extraCost: 12000 },
  { id: 'f4', name: 'Cotton Poplin', image: '/image/cotton.jpeg' },
  { id: 'f5', name: 'Premium Silk', image: '/image/fabric-1.jpg', extraCost: 15000 },
  { id: 'f6', name: 'Leather Accent', image: '/image/leather.jpg', extraCost: 10000 },
];

export const FABRIC_COLORS = [
  '#1B2A4A', '#8B4513', '#2C1810', '#D4AF37',
  '#800020', '#F5F0E8', '#3B5998', '#228B22',
  '#FF6347', '#4B0082', '#E8D5B7', '#1A1A1A',
];

// ── Accessories ─────────────────────────────────────────────────

export const ACCESSORIES: AccessoryOption[] = [
  { id: 'a1', name: 'Gold Buttons', emoji: '🔘', extraCost: 2000 },
  { id: 'a2', name: 'Waist Belt', emoji: '🪢', extraCost: 3500 },
  { id: 'a3', name: 'Embroidery', emoji: '🧵', extraCost: 8000 },
  { id: 'a4', name: 'Beadwork', emoji: '📿', extraCost: 12000 },
  { id: 'a5', name: 'Sequin Detail', emoji: '✨', extraCost: 6000 },
  { id: 'a6', name: 'Lace Trim', emoji: '🎀', extraCost: 4000 },
];

// ── Fit Options ─────────────────────────────────────────────────

export const FIT_OPTIONS: FitOption[] = [
  { id: 'fit1', label: 'Regular', desc: 'Standard comfortable fit' },
  { id: 'fit2', label: 'Slim Fit', desc: 'Tailored close to body' },
  { id: 'fit3', label: 'Relaxed', desc: 'Easy, slightly oversized' },
  { id: 'fit4', label: 'Oversized', desc: 'Deliberately loose & roomy' },
];

// ── Generated Outfit Pool (Studio only) ─────────────────────────

export const OUTFIT_POOL = [
  '/image/bespoke-dress-1.png',
  '/image/bespoke-dress-2.png',
  '/image/bespoke-outfit-2.png',
  '/image/bespoke-ankara-1.png',
  '/image/bespoke-kaftan-brown-1.png',
  '/image/bespoke-kaftan-brown-2.png',
  '/image/bespoke-kaftan-milk-1.png',
  '/image/bespoke-kaftan-milk-2.png',
  '/image/orange-bespoke-1.png',
  '/image/blue-bespoke-1.png',
  '/image/red-bespoke-1.png',
  '/image/black-bespoke-1.png',
  '/image/custom-outfit-1.png',
];

export const GENERATION_COST = 42;

// ── Section Tabs ────────────────────────────────────────────────

export type SectionId = 'styles' | 'fabric' | 'accessories' | 'fit' | 'details' | 'reference' | 'addons';

export interface SectionTab {
  id: SectionId;
  label: string;
}

export const STUDIO_TABS: SectionTab[] = [
  { id: 'styles', label: 'STYLE' },
  { id: 'fabric', label: 'FABRIC' },
  { id: 'accessories', label: 'ACCESSORIES' },
  { id: 'fit', label: 'FIT' },
  { id: 'details', label: 'DETAILS' },
  { id: 'reference', label: 'PHOTO' },
];

export const PRODUCT_TABS: SectionTab[] = [
  { id: 'styles', label: 'STYLE' },
  { id: 'fabric', label: 'FABRIC' },
  { id: 'accessories', label: 'ACCESSORIES' },
  { id: 'fit', label: 'FIT' },
  { id: 'addons', label: 'ADD-ONS' },
];
