import { storeShareImage } from '@/lib/store-share-image';

// The picture shown when a store link is shared (see lib/store-share-image).
export const alt = 'A store on Qlozet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return storeShareImage(decodeURIComponent(slug).toLowerCase());
}
