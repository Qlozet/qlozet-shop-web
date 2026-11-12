'use client';

import { useParams } from 'next/navigation';
import StorePage from '@/components/store/StorePage';

// The older store link. Still works everywhere it was shared; the page moves
// the browser to the store's /s/<address> once it has loaded.
export default function VendorIdPage() {
  const params = useParams();
  return <StorePage storeKey={String(params.id ?? '')} />;
}
