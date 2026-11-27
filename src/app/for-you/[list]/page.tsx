'use client';

import { useParams } from 'next/navigation';
import { ProductListPage } from '@/components/ProductListPage';
import { useApp } from '@/context/AppContext';
import { useFitsMe, usePersonalizedFeed } from '@/hooks/useRecommendations';
import { useProducts } from '@/hooks/useProducts';
import { hasDiscount } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';

/**
 * VIEW ALL for the For You panels that have no page of their own:
 * /for-you/picked, /for-you/fits and /for-you/sale. Same data as the panel,
 * more of it.
 */
export default function ForYouListPage() {
  const { list } = useParams<{ list: string }>();
  const { user, gender } = useApp();
  const audience = gender === 'male' ? 'men' : 'women';

  const { items: feed, loading: feedLoading } = usePersonalizedFeed({ limit: 60, gender });
  const { items: sale, loading: saleLoading } = usePersonalizedFeed({ limit: 60, gender, onSale: true });
  const { picks, loading: fitsLoading } = useFitsMe(60);
  const { products: listing, loading: listingLoading } = useProducts({ size: 60, audience });

  const feedProducts = feed.map((i) => i.product).filter((p): p is ApiProduct => !!p);

  if (list === 'fits') {
    return (
      <ProductListPage
        title="Fits your measurements"
        subtitle="Cut to the sizes in your saved measurements"
        products={picks.map((f) => f.product)}
        loading={fitsLoading}
        emptyText={
          user
            ? 'Nothing matches your measurements yet. Check that your measurements are saved, and look again as stores add size guides.'
            : 'Sign in and save your measurements to see what fits you.'
        }
      />
    );
  }

  if (list === 'sale') {
    return (
      <ProductListPage
        title="From the sale, for you"
        subtitle="Discounted pieces that match your taste"
        products={sale.map((i) => i.product).filter((p): p is ApiProduct => !!p && hasDiscount(p))}
        loading={saleLoading}
        emptyText="Nothing on sale matches your taste right now. Check back soon."
      />
    );
  }

  // picked (and anything unknown): the personal feed, else the listing.
  const personal = !!user && feedProducts.length > 0;
  return (
    <ProductListPage
      title={personal ? 'Picked for you' : 'Popular right now'}
      subtitle={personal ? 'Based on what you browse, save and buy' : 'Loved across Qlozet this week'}
      products={personal ? feedProducts : listing}
      loading={personal ? false : listingLoading || (!!user && feedLoading)}
    />
  );
}
