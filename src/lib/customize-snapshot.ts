// The choices made in a product's Customize panel, so they survive a refresh,
// a trip to Profile → My Measurement, or Cancel (which puts back what was
// there when the panel opened). Kept per product in this browser for two
// weeks; the cart line keeps its own copy once added.

import type { CustomizationState } from '@/hooks/useCustomization';

export interface CustomizeSnapshot {
  silhouette: string | null;
  neckline: string | null;
  sleeve: string | null;
  collar: string | null;
  skirt: string | null;
  trouser: string | null;
  fullBody: string | null;
  fabric: string | null;
  color: string | null;
  accessories: string[];
  addons: Record<string, string>;
  fit: string | null;
  measurementSet: string | null;
  /** AI previews already paid for, and which one is showing. */
  images: string[];
  activeImage: number;
}

const KEY = (productId: string) => `qlozet_customize_${productId}`;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export function takeSnapshot(c: CustomizationState): CustomizeSnapshot {
  return {
    silhouette: c.selectedSilhouette,
    neckline: c.selectedNeckline,
    sleeve: c.selectedSleeve,
    collar: c.selectedCollar,
    skirt: c.selectedSkirt,
    trouser: c.selectedTrouser,
    fullBody: c.selectedFullBody,
    fabric: c.selectedFabric,
    color: c.selectedColor,
    accessories: [...c.selectedAccessories],
    addons: { ...c.selectedAddons },
    fit: c.selectedFit,
    measurementSet: c.measurementSetName,
    images: [...c.generatedImages],
    activeImage: c.activeImageIndex,
  };
}

/** The choices alone, as text: equal strings mean nothing was changed. */
export function choicesKey(s: CustomizeSnapshot): string {
  const { images: _images, activeImage: _active, ...choices } = s;
  return JSON.stringify(choices);
}

/**
 * Put choices back. Previews are restored only when asked: Cancel keeps any
 * preview made meanwhile, since it was paid for.
 */
export function applySnapshot(c: CustomizationState, s: CustomizeSnapshot, withImages = false): void {
  c.setSelectedSilhouette(s.silhouette);
  c.setSelectedNeckline(s.neckline);
  c.setSelectedSleeve(s.sleeve);
  c.setSelectedCollar(s.collar);
  c.setSelectedSkirt(s.skirt);
  c.setSelectedTrouser(s.trouser);
  c.setSelectedFullBody(s.fullBody);
  c.setSelectedFabric(s.fabric);
  if (s.color) c.setSelectedColor(s.color);
  c.setSelectedAccessories(s.accessories ?? []);
  // Add-ons only have a per-item setter: clear the ones not in the snapshot.
  for (const name of Object.keys(c.selectedAddons)) {
    if (!(name in (s.addons ?? {}))) c.selectAddon(name, c.selectedAddons[name]);
  }
  for (const [name, variant] of Object.entries(s.addons ?? {})) {
    if (c.selectedAddons[name] !== variant) c.selectAddon(name, variant);
  }
  c.setSelectedFit(s.fit);
  c.setMeasurementSetName(s.measurementSet);
  if (withImages && s.images?.length) {
    c.setGeneratedImages(s.images);
    c.setActiveImageIndex(Math.min(Math.max(0, s.activeImage ?? 0), s.images.length - 1));
  }
}

export function saveSnapshot(productId: string, s: CustomizeSnapshot): void {
  try {
    localStorage.setItem(KEY(productId), JSON.stringify({ at: Date.now(), s }));
  } catch {
    /* storage full or blocked: choices just won't survive a reload */
  }
}

export function loadSnapshot(productId: string): CustomizeSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY(productId));
    if (!raw) return null;
    const { at, s } = JSON.parse(raw) as { at: number; s: CustomizeSnapshot };
    if (!s || Date.now() - Number(at) > MAX_AGE_MS) {
      localStorage.removeItem(KEY(productId));
      return null;
    }
    return s;
  } catch {
    return null;
  }
}
