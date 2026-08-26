'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductListPage } from '@/components/ProductListPage';
import type { ApiProduct } from '@/lib/api-types';

/**
 * A platform collection's product list. Fetches
 * GET /collections/platform/{slug} which returns { collection, products }.
 */
export default function CollectionPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string | undefined);

  const [title, setTitle] = useState('Collection');
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    api
      .get(`/collections/platform/${slug}`, { params: { limit: 40 } })
      .then((res) => {
        if (!alive) return;
        const body = res.data?.data ?? res.data;
        const collection = body?.collection ?? body;
        const prods = body?.products?.data ?? body?.products ?? collection?.products ?? [];
        setTitle(collection?.title || collection?.name || 'Collection');
        setSubtitle(collection?.description || undefined);
        setProducts(Array.isArray(prods) ? prods : []);
      })
      .catch(() => {
        if (alive) setProducts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <ProductListPage
      title={title}
      subtitle={loading ? undefined : subtitle ?? `${products.length} item${products.length === 1 ? '' : 's'}`}
      products={products}
      loading={loading}
      emptyText="No products in this collection yet."
    />
  );
}
