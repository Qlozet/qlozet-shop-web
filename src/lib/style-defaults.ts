/**
 * Default styles on a made-to-order listing — mirrors the backend rule in
 * products/style-defaults.ts (keep the two in step).
 *
 * Each part (neckline, sleeve, collar...) has one default: the style the
 * vendor marked, else the cheapest. The listing price includes them, the
 * product page opens with them chosen, and an order that leaves a part
 * empty gets its default.
 */
import type { ApiStyle } from './api-types';

export const STYLE_PARTS = [
  'neckline', 'sleeve', 'collar', 'skirt', 'trouser', 'full_body', 'bodice', 'hemline', 'back',
] as const;

const clean = (v: unknown) => String(v ?? '').trim().toLowerCase();

/** The part a style is for, read the same way the backend reads it. */
export function stylePart(s: ApiStyle | null | undefined): string | null {
  if (!s) return null;
  const parts = STYLE_PARTS as readonly string[];
  const cats = (s.categories ?? []).map(clean);
  const type = clean(s.type);
  return cats.find((c) => parts.includes(c)) ?? (parts.includes(type) ? type : null) ?? (cats[0] || type || null);
}

/** The default style of each part: the vendor's pick, else the cheapest. */
export function defaultStylesByPart(styles: ApiStyle[] | null | undefined): Map<string, ApiStyle> {
  const marked = new Map<string, ApiStyle>();
  const cheapest = new Map<string, ApiStyle>();
  for (const s of styles ?? []) {
    const part = stylePart(s);
    if (!part) continue;
    if (s.is_default && !marked.has(part)) marked.set(part, s);
    const best = cheapest.get(part);
    if (!best || (s.price ?? 0) < (best.price ?? 0)) cheapest.set(part, s);
  }
  const out = new Map<string, ApiStyle>();
  for (const [part, s] of cheapest) out.set(part, marked.get(part) ?? s);
  return out;
}
