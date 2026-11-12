/**
 * Links to a store's page. The address to share is /s/<slug>; a store the
 * backend hasn't given one yet falls back to /vendor/<id>, which forwards to
 * /s/ once the store has an address.
 */

export function storePath(slug: string): string {
  return `/s/${encodeURIComponent(slug)}`;
}

export function storeHref(
  store: { slug?: string | null; _id?: string; id?: string } | null | undefined,
  fallbackId?: string,
): string {
  if (store?.slug) return storePath(store.slug);
  const id = store?._id ?? store?.id ?? fallbackId ?? '';
  return `/vendor/${id}`;
}

/** Whether a stored link points at a store page (either form). */
export function isStoreHref(href: string): boolean {
  return href.startsWith('/s/') || href.startsWith('/vendor/');
}
