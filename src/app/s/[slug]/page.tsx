'use client';

import { useParams } from 'next/navigation';
import StorePage from '@/components/store/StorePage';

// A store's shareable address: shop.qlozet.app/s/<slug>.
export default function StoreAddressPage() {
  const params = useParams();
  const slug = decodeURIComponent(String(params.slug ?? '')).toLowerCase();
  return <StorePage storeKey={slug} />;
}
