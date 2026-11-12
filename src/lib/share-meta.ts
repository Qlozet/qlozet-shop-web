import { cache } from 'react';
import type { Metadata } from 'next';
import { config } from './config';
import type { ApiProduct, ApiBusinessPublicDetail } from './api-types';
import { getProductImage, getProductName, getProductPrice, getPriceUnit } from './api-types';
import { productHref } from './product-link';
import { storeHref } from './store-link';

/**
 * Link previews for shared product and store links (WhatsApp, Instagram, X,
 * Google). The pages themselves load in the browser, which preview bots
 * never run, so these run on the server and only feed <head>.
 *
 * Every failure falls back to the site-wide preview: a slow or missing
 * backend must never break the page itself.
 */

/** Where canonical links point; the vercel.app address is not the one to share. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.qlozet.app').replace(/\/+$/, '');

const SITE_NAME = 'Qlozet';
const REVALIDATE_SECONDS = 300;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${config.apiUrl}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    return null;
  }
}

export const fetchProductForMeta = cache((key: string) =>
  getJson<ApiProduct>(`/products/${encodeURIComponent(key)}`),
);

export const fetchStoreForMeta = cache((key: string) =>
  getJson<ApiBusinessPublicDetail>(`/business/public/${encodeURIComponent(key)}`),
);

function plain(text: string | null | undefined, max = 160): string {
  const s = (text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function naira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function descriptionOf(p: ApiProduct): string {
  const raw = (p as unknown as Record<string, { description?: string } | undefined>)[p.kind]?.description;
  return plain(raw, 120);
}

/** Preview for a product page. `isPreviewLink`: a vendor's private preview, kept out of search. */
export async function productMetadata(key: string, isPreviewLink = false): Promise<Metadata> {
  if (isPreviewLink) {
    return { title: `Listing preview · ${SITE_NAME}`, robots: { index: false, follow: false } };
  }
  const product = await fetchProductForMeta(key);
  if (!product) return { title: `Product not found · ${SITE_NAME}`, robots: { index: false } };

  const name = getProductName(product);
  const store = typeof product.business === 'object' ? product.business?.business_name : undefined;
  const price = getProductPrice(product);
  const priceLine = price > 0 ? `${naira(price)}${getPriceUnit(product) ?? ''}` : '';
  const title = store ? `${name} by ${store}` : name;
  const description =
    [priceLine, store ? `Shop ${store} on ${SITE_NAME}` : `On ${SITE_NAME}`, descriptionOf(product)]
      .filter(Boolean)
      .join(' · ');
  const image = getProductImage(product);
  const url = `${SITE_URL}${productHref(product)}`;

  return {
    title: `${title} · ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url,
      title,
      description,
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** Preview text for a store page; the picture is made by lib/store-share-image. */
export async function storeMetadata(key: string): Promise<Metadata> {
  const store = await fetchStoreForMeta(key);
  if (!store) return { title: `Store not found · ${SITE_NAME}`, robots: { index: false } };

  const name = store.business_name;
  const where = [store.city, store.state].map((part) => part?.trim()).filter(Boolean).join(', ');
  const count = Number(store.total_products) || 0;
  const description =
    plain(store.description, 140) ||
    [
      `Shop ${name} on ${SITE_NAME}`,
      count ? `${count} item${count === 1 ? '' : 's'}` : '',
      where,
    ]
      .filter(Boolean)
      .join(' · ');
  const url = `${SITE_URL}${storeHref(store)}`;
  const title = `${name} on ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url,
      title,
      description,
    },
    // The picture comes from opengraph-image / twitter-image beside the store
    // pages (lib/store-share-image): cover, logo and name in one.
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
