import type { Metadata } from 'next';
import StorePage from '@/components/store/StorePage';
import { storeMetadata } from '@/lib/share-meta';

// A store's shareable address: shop.qlozet.app/s/<slug>.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return storeMetadata(decodeURIComponent(slug).toLowerCase());
}

export default async function StoreAddressPage({ params }: Props) {
  const { slug } = await params;
  return <StorePage storeKey={decodeURIComponent(slug).toLowerCase()} />;
}
