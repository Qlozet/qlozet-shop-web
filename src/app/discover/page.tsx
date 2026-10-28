'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GenderToggle } from '@/components/GenderToggle';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { HERO_BANNERS, BROWSE_CATEGORIES } from '@/data/taxonomy';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { BrowseCategoriesGrid } from '@/components/discover/BrowseCategoriesGrid';
import { VendorShowcaseCarousel } from '@/components/discover/VendorShowcaseCarousel';
import { DealCarousel } from '@/components/discover/DealCarousel';
import { ProductCarousel } from '@/components/discover/ProductCarousel';
import { CollectionsGrid } from '@/components/discover/CollectionsGrid';
import { usePlatformCollections } from '@/hooks/useCollections';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import { usePersonalizedFeed, useTrendingProducts } from '@/hooks/useRecommendations';
import { useBespokeDesigns } from '@/hooks/useBespokeDesigns';
import { api } from '@/lib/api';
import type { ApiFeedItem, ApiProduct } from '@/lib/api-types';
import { getProductImage, getProductTaxonomy } from '@/lib/api-types';
import type { BrowseCategory } from '@/data/taxonomy';

export default function DiscoverPage() {
  const { gender, setGender, user } = useApp();
  const { isDark } = useTheme();
  // Match the real panels: mute the rich category colours in dark mode.
  const panelBg = (color: string) => (isDark ? `color-mix(in srgb, ${color} 72%, var(--bg-surface))` : color);

  // ── Fetch live data ─────────────────────────────────────────────
  const audience = gender === 'male' ? 'men' : 'women';
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50, audience });
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 50 });

  // Platform collections (admin-curated) — all of them on the main explore page.
  const { collections: platformCollections, loading: collectionsLoading } = usePlatformCollections();

  // Personalized "For You" row (logged-in). Header links to the full For You page.
  const { items: personalizedItems } = usePersonalizedFeed({ limit: 12, gender });
  const forYouProducts: ApiProduct[] = (personalizedItems as ApiFeedItem[])
    .map((i) => i.product)
    .filter((p): p is ApiProduct => !!p);

  // ── Card rows: each card asks the backend for exactly its own products, so
  // a card never shows something that doesn't belong in it. All follow the
  // Men/Women toggle (the backend's audience filter also lets unisex through).
  const card = { size: 3, audience } as const;
  const clothingQ = useProducts({ ...card, kind: 'clothing' });
  const accessoryQ = useProducts({ ...card, kind: 'accessory' });
  const fabricQ = useProducts({ ...card, kind: 'fabric' });
  const newQ = useProducts({ ...card, sortBy: 'date', order: 'desc' });
  const saleQ = useProducts({ ...card, on_sale: true });
  const ratedQ = useProducts({ ...card, sortBy: 'rating', order: 'desc' });
  const { items: trendingItems, loading: trendingLoading } = useTrendingProducts(30);

  // Designs: your own designs when you have some, otherwise the platform's
  // templates. Both matched to the toggle.
  const designGender = gender === 'male' ? 'men' : 'women';
  const { designs: myDesigns, isLoading: myDesignsLoading } = useBespokeDesigns();
  const [templates, setTemplates] = useState<
    { _id: string; name: string; category: string; gender?: string; design_images?: string[] }[] | null
  >(null);
  useEffect(() => {
    let cancelled = false;
    api
      .get('/bespoke/templates')
      .then((res) => {
        const rows = res.data?.data ?? res.data ?? [];
        if (!cancelled) setTemplates(Array.isArray(rows) ? rows : []);
      })
      .catch(() => !cancelled && setTemplates([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const cardsLoading =
    clothingQ.loading || accessoryQ.loading || fabricQ.loading || newQ.loading ||
    saleQ.loading || ratedQ.loading || trendingLoading ||
    (!!user && myDesignsLoading) || templates === null;

  const isLoading = cardsLoading || productsLoading || vendorsLoading;

  // Only vendors that actually have products to show (hide empty shops).
  // `total_products` is undefined on older API responses — treat unknown as
  // visible so the carousels don't go empty before the backend is deployed.
  const stockedVendors = useMemo(
    () => allVendors.filter((v) => (v.total_products ?? 1) > 0),
    [allVendors]
  );

  // "Worth the Hype": best-REVIEWED shops, Bayesian-weighted so one lucky
  // 5-star review can't outrank a shop with two hundred 4.8s. Each vendor's
  // rating is pulled toward the marketplace average (C) until they earn
  // enough reviews (m) for their own average to dominate:
  //   score = (n·R + m·C) / (n + m)
  const worthTheHypeVendors = useMemo(() => {
    const rated = stockedVendors.filter(
      (v) => (v.total_ratings ?? 0) > 0 && (v.average_rating ?? 0) > 0
    );
    const m = 5; // reviews needed before a vendor's own average dominates
    const C = rated.length
      ? rated.reduce((sum, v) => sum + (v.average_rating ?? 0), 0) / rated.length
      : 0;
    const score = (v: (typeof stockedVendors)[number]) => {
      const n = v.total_ratings ?? 0;
      const r = v.average_rating ?? 0;
      return n > 0 ? (n * r + m * C) / (n + m) : 0;
    };
    return [...stockedVendors].sort((a, b) => score(b) - score(a)).slice(0, 5);
  }, [stockedVendors]);

  // Top shops by total items sold
  const topShops = useMemo(() =>
    [...stockedVendors]
      .sort((a, b) => (b.total_items_sold ?? 0) - (a.total_items_sold ?? 0))
      .slice(0, 8),
    [stockedVendors]
  );

  // ── Dynamic Browse Categories ──────────────────────────────────
  const shopCategoryLabels = ['CLOTHING', 'ACCESSORIES', 'FABRIC', 'DESIGNS'];
  const curatedCollectionLabels = ["WHAT'S NEW", 'DISCOUNTS', 'TOP RATED', 'TRENDING'];

  // Trending is a marketplace-wide feed; keep the pieces meant for the
  // toggled side (or for everyone).
  const trendingForAudience = useMemo(() => {
    const ok = [audience, audience === 'men' ? 'male' : 'female', 'unisex'];
    return (trendingItems as ApiFeedItem[])
      .map((i) => i.product)
      .filter((p): p is ApiProduct => !!p)
      .filter((p) => {
        const a = (getProductTaxonomy(p) as { audience?: string } | null)?.audience;
        return !a || ok.includes(String(a).toLowerCase());
      });
  }, [trendingItems, audience]);

  // Designs card: yours first, templates otherwise. Only ones with a picture.
  const designTiles = useMemo(() => {
    const mine = myDesigns
      .filter((d) => d.status !== 'cancelled' && d.design_images?.[0] && d.gender === designGender)
      .slice(0, 3)
      .map((d) => ({
        image: d.design_images[0],
        link: `/bespoke/studio?name=${encodeURIComponent(d.name)}&type=${encodeURIComponent(d.category)}&designId=${d._id}`,
      }));
    if (mine.length > 0) return { tiles: mine, href: '/bespoke' };
    const tpl = (templates ?? [])
      .filter((t) => t.design_images?.[0] && (t.gender === 'men' ? 'men' : 'women') === designGender)
      .slice(0, 3)
      .map((t) => ({
        image: t.design_images?.[0] as string,
        link: `/bespoke/studio?name=${encodeURIComponent(t.name)}&type=${encodeURIComponent(t.category)}&gender=${designGender}&template=${t._id}`,
      }));
    return { tiles: tpl, href: '/bespoke?tab=templates' };
  }, [myDesigns, templates, designGender]);

  const productsFor = (label: string): ApiProduct[] => {
    switch (label) {
      case 'CLOTHING': return clothingQ.products;
      case 'ACCESSORIES': return accessoryQ.products;
      case 'FABRIC': return fabricQ.products;
      case "WHAT'S NEW": return newQ.products;
      case 'DISCOUNTS': return saleQ.products;
      case 'TOP RATED': return ratedQ.products.filter((p) => (p.average_rating ?? 0) > 0);
      case 'TRENDING': return trendingForAudience;
      default: return [];
    }
  };

  // A card shows only real items. Nothing to show → no card. The static
  // images in BROWSE_CATEGORIES are never used as stand-ins.
  const buildCard = (cat: BrowseCategory): BrowseCategory | null => {
    if (cat.label === 'DESIGNS') {
      const { tiles, href } = designTiles;
      if (tiles.length === 0) return null;
      return { ...cat, href, images: tiles.map((t) => t.image), productIds: [], links: tiles.map((t) => t.link) };
    }
    const items = productsFor(cat.label).filter((p) => getProductImage(p)).slice(0, 3);
    if (items.length === 0) return null;
    return { ...cat, images: items.map((p) => getProductImage(p)), productIds: items.map((p) => p._id), links: undefined };
  };

  const shopCategories = BROWSE_CATEGORIES
    .filter((c) => shopCategoryLabels.includes(c.label))
    .map(buildCard)
    .filter((c): c is BrowseCategory => !!c);

  const curatedCollections = BROWSE_CATEGORIES
    .filter((c) => curatedCollectionLabels.includes(c.label))
    .map(buildCard)
    .filter((c): c is BrowseCategory => !!c);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '32px' }}>

      {/* Gender Toggle — desktop only */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Page Title */}
      <h1
        className="text-left lg:text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
        style={{ fontSize: '22px' }}
      >
        Discover
      </h1>

      {/* Platform collections (admin-curated) in the hero-banner style. Falls
          back to the static banners only while there are no collections yet. */}
      {collectionsLoading || platformCollections.length > 0 ? (
        <CollectionsGrid title="Collections" collections={platformCollections} loading={collectionsLoading} />
      ) : (
        <DiscoverHeroBanners banners={HERO_BANNERS} />
      )}

      {/* Categories & Collections — show skeletons while loading */}
      {isLoading ? (
        <>
          {/* Shop by Category Skeleton */}
          {(() => {
            const shopSkeletonData = [
              { label: 'CLOTHING', color: '#3B3026' },
              { label: 'ACCESSORIES', color: '#4A6741' },
              { label: 'FABRIC', color: '#5B4A6B' },
              { label: 'DESIGNS', color: '#2E4A62' },
            ];
            const curatedSkeletonData = [
              { label: "WHAT'S NEW", color: '#B04A4A' },
              { label: 'DISCOUNTS', color: '#C48B3F' },
              { label: 'TOP RATED', color: '#3A7A6A' },
              { label: 'TRENDING', color: '#6B5B4A' },
            ];

            const renderSkeletonGrid = (title: string, items: { label: string; color: string }[]) => (
              <div className="flex flex-col" style={{ gap: '16px' }}>
                {/* Section Header */}
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {title}
                  </h2>
                  <ChevronRight size={14} color="var(--text-primary)" />
                </div>
                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col overflow-hidden"
                      style={{ borderRadius: '24px', background: panelBg(item.color) }}
                    >
                      {/* Header — label + chevron */}
                      <div className="flex items-center justify-between" style={{ padding: '16px 16px 10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.label}
                        </span>
                        <ChevronRight size={16} color="#FFFFFF" style={{ opacity: 0.7 }} />
                      </div>
                      {/* Image placeholders — 3 pulsing boxes */}
                      <div className="flex flex-1" style={{ gap: '12px', padding: '0 16px 16px' }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`animate-pulse${i === 2 ? ' hidden lg:block' : ''}`}
                            style={{
                              flex: 1,
                              aspectRatio: '3 / 4',
                              borderRadius: '16px',
                              background: 'rgba(255,255,255,0.15)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

            return (
              <>
                {renderSkeletonGrid('Shop by Category', shopSkeletonData)}
                {renderSkeletonGrid('Curated For You', curatedSkeletonData)}
              </>
            );
          })()}
        </>
      ) : (
        <>
          <BrowseCategoriesGrid title="Shop by Category" categories={shopCategories} />
          <BrowseCategoriesGrid title="Curated For You" categories={curatedCollections} />
        </>
      )}

      {/* Personalized "For You" — logged-in only; sits under Curated For You.
          Header opens the full For You page. */}
      {user && forYouProducts.length > 0 && (
        <ProductCarousel title="For You" products={forYouProducts} href="/for-you" />
      )}

      {/* Loading State for vendor sections */}
      {isLoading && (
        <div className="flex flex-col animate-pulse" style={{ gap: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col" style={{ gap: '16px' }}>
              <div className="h-3 w-32 bg-[var(--bg-surface-elevated)] rounded" />
              {/* overflow-hidden: fixed-width placeholders must not widen the page */}
              <div className="flex overflow-hidden" style={{ gap: '16px' }}>
                {/* Same responsive footprint as VendorShowcaseCard (420px tall
                    on mobile, 360×500 from lg) so the page doesn't jump when
                    the real cards swap in. */}
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-[24px] bg-[var(--bg-surface-elevated)] flex-shrink-0 w-[calc(100vw-56px)] max-w-[380px] h-[420px] lg:w-[360px] lg:max-w-none lg:h-[500px]" style={{ minWidth: '300px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live data sections — only show after loading */}
      {!isLoading && (
        <>
          {/* Top Shops — showcase cards */}
          <VendorShowcaseCarousel title="Top Shops" vendors={topShops} allProducts={allProducts} />

          {/* Worth the Hype */}
          <VendorShowcaseCarousel title="Worth the Hype" vendors={worthTheHypeVendors} allProducts={allProducts} />

          {/* Vendor Deals — self-hides when no vendor has an active discount */}
          <DealCarousel title="Vendor Deals" vendors={allVendors} allProducts={allProducts} />
        </>
      )}

    </div>
  );
}
