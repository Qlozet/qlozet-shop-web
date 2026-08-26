'use client';

import { ProductListPage } from '@/components/ProductListPage';
import { useApp } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';

export default function TopRatedPage() {
  const { gender } = useApp();
  const audience = gender === 'male' ? 'men' : 'women';

  const { products, loading } = useProducts({ sortBy: 'rating', order: 'desc', size: 40, audience });

  return (
    <ProductListPage
      title="Top Rated"
      subtitle="Highest rated by shoppers"
      products={products}
      loading={loading}
      emptyText="No rated products yet — ratings appear as orders complete."
    />
  );
}
