import type { Metadata } from 'next';
import ProductPage from '@/components/product/ProductPage';
import { productMetadata } from '@/lib/share-meta';

// The older product link. Still works everywhere it was shared; the page
// moves the browser to the product's /p/<name>-<code> once it has loaded.
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return productMetadata(id, Boolean(query.preview));
}

export default async function ProductIdPage({ params }: Props) {
  const { id } = await params;
  return <ProductPage productKey={id} />;
}
