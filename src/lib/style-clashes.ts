// Combinations Surprise me must not put together: a sleeve on a strapless
// neckline, a collar on a sweetheart, a mermaid gown with a pleated skirt, a
// ball gown cut mini. Keyed on the platform library's style codes (stable,
// unlike names); a style without a known code is never ruled out.
//
// Only Surprise me follows these. A customer can still pick anything.

type Coded = { style_code?: string | null } | null | undefined;
const code = (s: Coded) => (s?.style_code ?? '').toUpperCase();

/** Necklines (and dress styles) that leave no room for a sleeve. */
const SLEEVELESS_ONLY = new Set([
  'NECK_STRAPLESS',
  'NECK_HALTER',
  'NECK_ONE_SHOULDER',
  'FB_DRESS_SLIP',
]);
const SLEEVELESS = 'SLV_SLEEVELESS';

/** Sleeves that need the shoulder an off-shoulder neckline leaves bare. */
const NOT_OFF_SHOULDER = new Set(['SLV_CAP', 'SLV_RAGLAN', 'SLV_COLD_SHOULDER']);

/** Necklines whose shape is the neck: a collar on top would fight it. */
const NO_COLLAR_NECK = new Set([
  'NECK_STRAPLESS',
  'NECK_OFF_SHOULDER',
  'NECK_ONE_SHOULDER',
  'NECK_HALTER',
  'NECK_SWEETHEART',
  'NECK_COWL',
  'NECK_BOAT',
  'NECK_SQUARE',
  'NECK_SCOOP',
  'NECK_ILLUSION',
  'NECK_KEYHOLE',
  'NECK_ASYMMETRIC',
  'NECK_QUEEN_ANNE',
  'NECK_BOW',
  'NECK_HIGH',
  'NECK_POLO',
]);

/** Outfits that come with their own neck finish (or none at all). */
const NO_COLLAR_FULL_BODY = new Set([
  'FB_KAFTAN_MANDARIN',
  'FB_KAFTAN_JALABIYA',
  'FB_DRESS_SLIP',
]);

/** Shapes that only work at some lengths (LENGTH_OPTIONS ids). */
const LENGTHS_FOR: Record<string, string[]> = {
  FB_DRESS_BALL_GOWN: ['floor'],
  FB_DRESS_MERMAID_GOWN: ['ankle', 'floor'],
  FB_DRESS_MAXI: ['ankle', 'floor'],
  FB_DRESS_CORSET: ['midi', 'ankle', 'floor'],
  FB_DRESS_KAFTAN_GOWN: ['ankle', 'floor'],
  FB_DRESS_BODYCON: ['mini', 'knee'],
  FB_DRESS_SHEATH: ['knee', 'midi'],
  FB_DRESS_FIT_FLARE: ['mini', 'knee', 'midi'],
  FB_DRESS_SHIRT: ['knee', 'midi'],
  FB_DRESS_ASYMMETRIC: ['knee', 'midi', 'ankle'],
  SKT_MERMAID: ['ankle', 'floor'],
  SKT_TRUMPET: ['midi', 'ankle', 'floor'],
  SKT_PENCIL: ['knee', 'midi'],
  SKT_HIGH_LOW: ['knee', 'midi', 'ankle'],
  SKT_PEPLUM: ['knee', 'midi'],
  SKT_CIRCLE: ['knee', 'midi', 'ankle'],
};

/** Whether this sleeve suits the neckline and outfit already picked. */
export function sleeveSuits(sleeve: Coded, neckline: Coded, outfit?: Coded): boolean {
  const s = code(sleeve);
  if (!s) return true;
  if (SLEEVELESS_ONLY.has(code(neckline)) || SLEEVELESS_ONLY.has(code(outfit))) {
    return s === SLEEVELESS;
  }
  if (code(neckline) === 'NECK_OFF_SHOULDER') return !NOT_OFF_SHOULDER.has(s);
  return true;
}

/** Whether a collar can go on this neckline and outfit at all. */
export function collarAllowed(neckline: Coded, outfit?: Coded): boolean {
  return !NO_COLLAR_NECK.has(code(neckline)) && !NO_COLLAR_FULL_BODY.has(code(outfit));
}

/**
 * The lengths that suit the picked dress style or skirt shape, or null when
 * any length goes. The outfit wins over the skirt when both say something.
 */
export function lengthsThatSuit(outfit?: Coded, skirt?: Coded): string[] | null {
  return LENGTHS_FOR[code(outfit)] ?? LENGTHS_FOR[code(skirt)] ?? null;
}
