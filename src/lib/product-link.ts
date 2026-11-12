/**
 * Links to a product page. The address to share is /p/<name>-<code>, e.g.
 * /p/blue-agbada-set-k3x9q2m7. Only the code is looked up, so a rename
 * never breaks a link; the name is there for people and search engines.
 * A product without a code yet falls back to /products/<id>, which forwards
 * to /p/ once it has one. Keep in step with the backend's product-code.ts.
 */

const NAME_MAX = 60;

/** "Ada's Blue Agbada (3 pc)" → "adas-blue-agbada-3-pc". */
export function productNameSlug(name: string | null | undefined): string {
  let s = (name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (s.length > NAME_MAX) {
    s = s.slice(0, NAME_MAX);
    const cut = s.lastIndexOf('-');
    if (cut >= NAME_MAX / 2) s = s.slice(0, cut);
    s = s.replace(/-+$/g, '');
  }
  return s || 'item';
}

type Linkable = {
  _id?: string;
  id?: string;
  code?: string | null;
  kind?: string;
  name?: string;
  clothing?: { name?: string } | null;
  fabric?: { name?: string } | null;
  accessory?: { name?: string } | null;
};

function nameOf(p: Linkable): string {
  return p.clothing?.name ?? p.fabric?.name ?? p.accessory?.name ?? p.name ?? '';
}

/** The product's shop path. `fallbackId` for when only the id is to hand. */
export function productHref(
  product: Linkable | null | undefined,
  fallbackId?: string,
): string {
  if (product?.code) return `/p/${productNameSlug(nameOf(product))}-${product.code}`;
  const id = product?._id ?? product?.id ?? fallbackId ?? '';
  return `/products/${id}`;
}

/** Whether a stored link points at a product page (either form). */
export function isProductHref(href: string): boolean {
  return href.startsWith('/p/') || href.startsWith('/products/');
}
