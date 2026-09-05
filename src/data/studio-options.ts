// ═══════════════════════════════════════════════════════════════
//  Studio / Customization Option Data
//  Single source of truth for all bespoke & product customization options.
// ═══════════════════════════════════════════════════════════════

// ── Interfaces ──────────────────────────────────────────────────

export interface StyleOption {
  id: string;
  label: string;
  emoji: string;
  imageUrl?: string;       // AI-generated image from API
  description?: string;    // Style description for tooltip
  tags?: string[];         // Attribute tags (e.g., "classic", "casual")
  styleCode?: string;      // Backend style_code for order submission
  extraCost?: number;
}

// ── Clothing Types ──────────────────────────────────────────────
export type ClothingType = 'top' | 'bottom' | 'full_body';
export type DesignGender = 'male' | 'female' | 'unisex';

export interface ClothingTypeOption {
  id: ClothingType;
  label: string;
  description: string;
  emoji: string;
}

export const CLOTHING_TYPES: ClothingTypeOption[] = [
  { id: 'top', label: 'Top', description: 'Blouse, Shirt, Crop Top', emoji: '👕' },
  { id: 'bottom', label: 'Bottom', description: 'Skirt, Trouser, Pants', emoji: '👖' },
  { id: 'full_body', label: 'Full Body', description: 'Dress, Kaftan, Agbada, Jumpsuit', emoji: '👗' },
];


export interface FabricOption {
  id: string;
  name: string;
  image: string;
  extraCost?: number;
  /** Colours this fabric comes in — used to filter/sort the picker. */
  colors?: { name?: string; hex?: string }[];
}

export interface AccessoryOption {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  description?: string;
  extraCost?: number;
  /** Garment types this embellishment makes sense on. Absent → all types. */
  appliesTo?: ClothingType[];
  /** Genders this embellishment is offered to. Absent → everyone. */
  genders?: DesignGender[];
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

// ── Embellishments ──────────────────────────────────────────────
// Finishing work the TAILOR applies to the garment (not standalone accessory
// products — those are shopped normally). Selections ride on the design so the
// tailor sees exactly what was requested and prices it in their quote — which
// is why these carry no fixed extraCost.

export const ACCESSORIES: AccessoryOption[] = [
  {
    id: 'a3', name: 'Embroidery', emoji: '🧵',
    description: 'Handcrafted embroidery patterns that bring intricate detail and cultural richness to the garment.',
  },
  {
    id: 'a4', name: 'Beadwork', emoji: '📿',
    description: 'Hand-sewn beadwork accents that add texture, color, and a premium artisanal feel.',
  },
  {
    id: 'a7', name: 'Aso-Oke Trim', emoji: '🪡',
    description: 'Woven aso-oke strips along collars, cuffs or hems for a rich traditional finish.',
  },
  {
    id: 'a8', name: 'Contrast Piping', emoji: '➰',
    description: 'A slim contrast-colour edge along seams, plackets and pockets for a sharp, tailored look.',
  },
  {
    id: 'a1', name: 'Statement Buttons', emoji: '🔘',
    appliesTo: ['top', 'full_body'],
    description: 'Premium gold-toned or covered buttons that finish collars, cuffs, and front closures.',
  },
  {
    id: 'a2', name: 'Waist Belt / Sash', emoji: '🪢',
    appliesTo: ['full_body'],
    description: 'A matching structured belt or soft sash to cinch the silhouette and add definition.',
  },
  {
    id: 'a5', name: 'Sequin Detail', emoji: '✨',
    appliesTo: ['top', 'full_body'], genders: ['female'],
    description: 'Sparkling sequin detailing for evening and event wear — adds glamour and light-catching movement.',
  },
  {
    id: 'a6', name: 'Lace Trim', emoji: '🎀',
    appliesTo: ['top', 'full_body'], genders: ['female'],
    description: 'Delicate lace trim along hems, necklines, or sleeves for a feminine and elegant finish.',
  },
  {
    id: 'a9', name: 'Side Pockets', emoji: '🫙',
    description: 'Discreet in-seam pockets — practical without breaking the garment’s line.',
  },
];

/**
 * Embellishments that make sense for the garment being designed. No type or
 * gender chosen yet → the universally applicable ones.
 */
export function filterEmbellishments(
  clothingType?: ClothingType | null,
  gender?: DesignGender | null,
): AccessoryOption[] {
  return ACCESSORIES.filter((a) => {
    if (a.appliesTo && clothingType && !a.appliesTo.includes(clothingType)) return false;
    if (a.appliesTo && !clothingType) return false;
    if (a.genders && gender && gender !== 'unisex' && !a.genders.includes(gender)) return false;
    return true;
  });
}

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

// ── Selection enrichment ────────────────────────────────────────
// The studio stores only option IDs (e.g. "s2"). Resolve those to a
// { id, name, image, emoji } shape so a saved design carries human-readable
// names + thumbnails that the vendor (or anyone) can render without this
// catalog. Unknown ids pass through unchanged.

export interface ResolvedSelection {
  id: string;
  name: string;
  image?: string;
  emoji?: string;
}

const SELECTION_CATALOG: Record<string, { id: string; label?: string; name?: string; imageUrl?: string; image?: string; emoji?: string }[]> = {
  silhouette: SILHOUETTES,
  neckline: NECKLINES,
  sleeve: SLEEVES,
  fit: FIT_OPTIONS as any,
  accessories: ACCESSORIES,
};

function resolveSelection(kind: string, id: unknown): ResolvedSelection | unknown {
  if (typeof id !== 'string' || !id) return id;
  const arr = SELECTION_CATALOG[kind];
  const opt = arr?.find((o) => o.id === id);
  if (!opt) return id;
  return {
    id,
    name: opt.label ?? opt.name ?? id,
    image: opt.imageUrl ?? opt.image,
    emoji: opt.emoji,
  };
}

/** Enrich a studio selections object, resolving style ids to {name, image}. */
export function enrichSelections(
  // Loose on purpose — callers pass typed selection objects without an index sig.
  selections: any,
): Record<string, unknown> {
  if (!selections) return {};
  const out: Record<string, unknown> = { ...(selections as Record<string, unknown>) };
  for (const kind of Object.keys(SELECTION_CATALOG)) {
    if (!selections[kind]) continue;
    // Multi-select kinds (accessories) are arrays of ids — resolve each.
    out[kind] = Array.isArray(selections[kind])
      ? selections[kind].map((id: unknown) => resolveSelection(kind, id))
      : resolveSelection(kind, selections[kind]);
  }
  return out;
}
