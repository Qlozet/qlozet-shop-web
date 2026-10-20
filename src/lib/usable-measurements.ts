// A piece made to fit (a custom garment, or a bespoke quote) is sewn from one
// of the customer's saved measurement sets, frozen onto the order. The backend
// refuses the order when that set is missing or empty; these helpers let the
// shop say so before the customer tries to pay. Same rule as the backend's
// common/utils/usable-measurements: three positive values.

import type { MeasurementProfile } from '@/app/profile/types';

export const MIN_MEASUREMENT_VALUES = 3;

/** Where to send someone who needs to add measurements. */
export const ADD_MEASUREMENTS_HREF = '/profile?tab=add-measurement';

/** Matches the backend's refusal, so a refused order shows the same help. */
export const isNoMeasurementsError = (message?: string | null) =>
  !!message && /add your measurements/i.test(message);

export function profileIsUsable(profile?: MeasurementProfile | null): boolean {
  if (!profile) return false;
  const all = { ...(profile.values ?? {}), ...(profile.tailoring ?? {}) } as Record<string, unknown>;
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
