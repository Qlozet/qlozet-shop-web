// A piece made to fit (a custom garment, or a bespoke quote) is sewn from one
// of the customer's saved measurement sets, frozen onto the order. The backend
// refuses the order when that set is missing or empty; these helpers let the
// shop say so before the customer tries to pay. Same rule as the backend's
// common/utils/usable-measurements: three positive values. On top of that,
// when the garment is known (lib/garment-measurements), the set must hold the
// points that garment needs: an agbada can't be cut without a sleeve length.

import type { MeasurementProfile } from '@/app/profile/types';
import { checkGarment, type GarmentCheck, type GarmentKind } from '@/lib/garment-measurements';

export const MIN_MEASUREMENT_VALUES = 3;

/** Where to send someone who needs to add measurements. */
export const ADD_MEASUREMENTS_HREF = '/profile?tab=add-measurement';

/** Where to send someone whose saved set lacks a few points (to edit it). */
export const MY_MEASUREMENTS_HREF = '/profile?tab=measurements';

/** Matches the backend's refusal, so a refused order shows the same help. */
export const isNoMeasurementsError = (message?: string | null) =>
  !!message && /add your measurements|the tailor needs your/i.test(message);

/** Every value a set holds, the core points and the extra tailoring keys. */
const allValues = (profile: MeasurementProfile) =>
  ({ ...(profile.values ?? {}), ...(profile.tailoring ?? {}) }) as Record<string, unknown>;

export function profileIsUsable(profile?: MeasurementProfile | null): boolean {
  if (!profile) return false;
  const all = allValues(profile);
  let count = 0;
  for (const v of Object.values(all)) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) count += 1;
    if (count >= MIN_MEASUREMENT_VALUES) return true;
  }
  return false;
}

/** The set an order would use: the named one, else the default, else the first. */
export function resolveProfile(
  profiles: MeasurementProfile[],
  name?: string | null,
): MeasurementProfile | undefined {
  return (
    (name ? profiles.find((p) => p.name === name) : undefined) ??
    profiles.find((p) => p.isDefault) ??
    profiles[0]
  );
}

/**
 * The points a garment needs that this set lacks, or null when it has them
 * all, the garment is unknown, or there is no set (profileIsUsable covers
 * that). Show missingMeasurementsMessage(gap) to the customer.
 */
export function garmentGap(
  profile: MeasurementProfile | null | undefined,
  garment: GarmentKind | null | undefined,
): GarmentCheck | null {
  if (!profile || !garment) return null;
  const check = checkGarment(garment, allValues(profile));
  return check.missing.length ? check : null;
}
