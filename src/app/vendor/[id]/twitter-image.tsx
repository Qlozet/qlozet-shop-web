import { storeShareImage } from '@/lib/store-share-image';

// The picture shown when an older store link is shared (see lib/store-share-image).
export const alt = 'A store on Qlozet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return storeShareImage(id);
}
