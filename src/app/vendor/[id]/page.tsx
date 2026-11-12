import type { Metadata } from 'next';
import StorePage from '@/components/store/StorePage';
import { storeMetadata } from '@/lib/share-meta';

// The older store link. Still works everywhere it was shared; the page moves
// the browser to the store's /s/<address> once it has loaded.
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return storeMetadata(id);
}

export default async function VendorIdPage({ params }: Props) {
  const { id } = await params;
  return <StorePage storeKey={id} />;
}
