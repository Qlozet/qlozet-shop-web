'use client';

import { ProductListPage } from '@/components/ProductListPage';
import { useApp } from '@/context/AppContext';
import { useTrendingProducts } from '@/hooks/useRecommendations';
import { useProducts } from '@/hooks/useProducts';
import type { ApiProduct } from '@/lib/api-types';

export default function TrendingPage() {
  const { gender } = useApp();
  const audience = gender === 'male' ? 'men' : 'women';

  const { items } = useTrendingProducts(40);
  const { products: fallback, loading } = useProducts({ size: 40, audience });

  const feed = items.map((i) => i.product).filter((p): p is ApiProduct => !!p);
  const products = feed.length > 0 ? feed : fallback;

  return (
    <ProductListPage
      title="Trending"
      subtitle="What everyone's loving right now"
      products={products}
      loading={loading && feed.length === 0}
    />
  );
}
