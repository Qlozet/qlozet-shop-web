'use client';

import { ProductListPage } from '@/components/ProductListPage';
import { useApp } from '@/context/AppContext';
import { useProducts } from '@/hooks/useProducts';

export default function WhatsNewPage() {
  const { gender } = useApp();
  const audience = gender === 'male' ? 'men' : 'women';

  // Newest first — the backend sorts by createdAt.
  const { products, loading } = useProducts({ sortBy: 'date', order: 'desc', size: 40, audience });

  return (
    <ProductListPage
      title="What's New"
      subtitle="Fresh drops, newest first"
      products={products}
      loading={loading}
    />
  );
}
