// What a customized outfit is made of, line by line, for the live summary in
// the Customize panel and the review card before Add to cart. Item prices come
// from the listing (the same numbers the local estimate uses); the totals come
// from the server preview, and "Tailoring" is whatever is left, so the lines
// always add up to the price that will be charged.

import type { ApiProduct } from '@/lib/api-types';
import type { CustomizationState } from '@/hooks/useCustomization';
import { FIT_OPTIONS } from '@/data/studio-options';

export type OutfitSection = 'styles' | 'fabric' | 'accessories' | 'fit' | 'addons';

export interface OutfitLine {
  key: string;
  section: OutfitSection;
  /** "Collar", "Fabric", "Accessory"… */
  label: string;
  /** What was chosen: "Mandarin", "Aso-oke, 4 yd". */
  value: string;
  /** Extra cost; 0 shows "Included", null shows nothing (fit, own fabric). */
  price: number | null;
}

export interface OutfitTotals {
  /** Tailoring = total before discount minus the priced lines. */
  tailoring: number;
  discount: number;
  total: number;
  /** Total against the outfit as pictured (default styles, no extras). */
  vsPictured: number;
}

const PART_LABELS: Array<[keyof CustomizationState, string]> = [
  ['selectedFullBody', 'Style'],
  ['selectedSilhouette', 'Silhouette'],
  ['selectedNeckline', 'Neckline'],
  ['selectedCollar', 'Collar'],
  ['selectedSleeve', 'Sleeves'],
  ['selectedSkirt', 'Skirt'],
  ['selectedTrouser', 'Trouser'],
];

type Named = { _id?: string; name?: string; price?: number };

export function outfitLines(opts: {
  product: ApiProduct;
  customization: CustomizationState;
  /** Yards of the outfit's own fabric for the chosen size. */
  fabricYards?: number;
  /** A fabric from another listing applied with Use Fabric. */
  appliedFabricName?: string | null;
  appliedFabricYards?: number | null;
}): OutfitLine[] {
  const { product, customization: c } = opts;
  const clothing = product.clothing;
  if (!clothing) return [];
  const lines: OutfitLine[] = [];

  const styles = (clothing.styles ?? []) as Named[];
  for (const [field, label] of PART_LABELS) {
    const id = c[field] as string | null;
    if (!id) continue;
    const s = styles.find((st) => st._id === id);
    if (!s?.name) continue;
    lines.push({ key: String(field), section: 'styles', label, value: s.name, price: Number(s.price) || 0 });
  }

  if (opts.appliedFabricName) {
    const yd = opts.appliedFabricYards ? `, ${opts.appliedFabricYards} yd` : '';
    lines.push({ key: 'applied-fabric', section: 'fabric', label: 'Your fabric', value: `${opts.appliedFabricName}${yd}`, price: null });
  } else if (c.selectedFabric) {
    const fab = (clothing.fabrics ?? []).find((f: { _id?: string }) => f._id === c.selectedFabric) as
      | { name?: string; price_per_yard?: number; min_cut?: number }
      | undefined;
    if (fab) {
      const yards = opts.fabricYards || fab.min_cut || 1;
      lines.push({
        key: 'fabric',
        section: 'fabric',
        label: 'Fabric',
        value: `${fab.name || 'Fabric'}, ${yards} yd`,
        price: (Number(fab.price_per_yard) || 0) * yards,
      });
    }
  }

  for (const accId of c.selectedAccessories) {
    const acc = ((clothing.accessories ?? []) as Named[]).find((a) => a._id === accId);
    if (acc?.name) lines.push({ key: `acc-${accId}`, section: 'accessories', label: 'Accessory', value: acc.name, price: Number(acc.price) || 0 });
  }

  for (const [addonName, variantName] of Object.entries(c.selectedAddons)) {
    const addon = (clothing.addons ?? []).find((a: { name?: string }) => a.name === addonName) as
      | { name?: string; variants?: Named[] }
      | undefined;
    const v = addon?.variants?.find((x) => x.name === variantName);
    if (addon) lines.push({ key: `addon-${addonName}`, section: 'addons', label: addonName, value: variantName || addonName, price: Number(v?.price) || 0 });
  }

  const fit = FIT_OPTIONS.find((f) => f.id === c.selectedFit)?.label;
  if (fit) lines.push({ key: 'fit', section: 'fit', label: 'Fit', value: fit, price: null });

  return lines;
}

/** The short one-line version: "Mandarin · Long · Aso-oke · Slim fit". */
export function outfitHeadline(lines: OutfitLine[]): string {
  return lines
    .map((l) => (l.key === 'fit' ? `${l.value} fit` : l.value.replace(/, [\d.]+ yd$/, '')))
    .join(' · ');
}

export function outfitTotals(opts: {
  lines: OutfitLine[];
  /** Server breakdown when available. */
  breakdown: { base: number; before_discount: number; discount: number; final: number } | null;
  /** The price shown on the page (server price, else the local estimate). */
  total: number;
  /** The outfit as pictured: the listing's headline price. */
  pictured: number;
}): OutfitTotals {
  const priced = opts.lines.reduce((sum, l) => sum + (l.price ?? 0), 0);
  const before = opts.breakdown?.before_discount ?? opts.total;
  const discount = opts.breakdown?.discount ?? 0;
  const tailoring = Math.max(0, before - priced);
  return {
    tailoring: tailoring || opts.breakdown?.base || 0,
    discount,
    total: opts.total,
    vsPictured: opts.total - opts.pictured,
  };
}
