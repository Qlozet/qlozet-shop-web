import type { Metadata } from 'next';
import ProductPage from '@/components/product/ProductPage';
import { productMetadata } from '@/lib/share-meta';

// A product's shareable address: shop.qlozet.app/p/<name>-<code>. Only the
// code is looked up, so an old name in the link still opens the product.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return productMetadata(decodeURIComponent(slug), Boolean(query.preview));
}

export default async function ProductAddressPage({ params }: Props) {
  const { slug } = await params;
  return <ProductPage productKey={decodeURIComponent(slug)} />;
}
