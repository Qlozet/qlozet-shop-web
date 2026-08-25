'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Ruler,
  Wallet,
  Heart,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Scissors,
  Plus,
  Store,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  usePersonalizedFeed,
  useTrendingProducts,
  useNewArrivals,
  useRecommendedVendors,
} from '@/hooks/useRecommendations';
import { useBespokeDesigns } from '@/hooks/useBespokeDesigns';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ProductCarousel } from '@/components/discover/ProductCarousel';
import {
  getProductImage,
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductTag,
  hasDiscount,
} from '@/lib/api-types';
import type { ApiProduct, ApiFeedItem, ReasonCode } from '@/lib/api-types';

// ── Personalization "why" labels ─────────────────────────────
const REASON_LABELS: Record<ReasonCode, string> = {
  STYLE_MATCH: 'Your style',
  AESTHETIC_MATCH: 'Your aesthetic',
  TRUSTED_VENDOR: 'Trusted vendor',
  FAST_ETA: 'Ships fast',
  PRICE_FIT: 'In your budget',
  FIT_COMPATIBLE: 'Fits you',
  TRENDING: 'Trending now',
};

// The pillars our curation is built on — answers "why these picks?"
const PILLARS = [
  { icon: Sparkles, label: 'Your style' },
  { icon: Ruler, label: 'Your fit' },
  { icon: Wallet, label: 'Your budget' },
  { icon: Heart, label: 'Your favorites' },
  { icon: TrendingUp, label: 'Trending' },
];

// Bespoke design status → readable badge
const BESPOKE_STATUS: Record<string, { label: string; bg: string }> = {
  draft: { label: 'Draft', bg: 'rgba(107,114,128,0.9)' },
  quoting: { label: 'Awaiting price', bg: 'rgba(217,119,6,0.92)' },
  requesting_quotes: { label: 'Awaiting price', bg: 'rgba(217,119,6,0.92)' },
  quoted: { label: 'Price ready', bg: 'rgba(37,99,235,0.92)' },
  accepted: { label: 'In progress', bg: 'rgba(124,58,237,0.92)' },
  in_progress: { label: 'In progress', bg: 'rgba(124,58,237,0.92)' },
  in_production: { label: 'In progress', bg: 'rgba(124,58,237,0.92)' },
  completed: { label: 'Ready', bg: 'rgba(5,150,105,0.92)' },
};

interface GridCard {
  product: ApiProduct;
  reason?: string;
}

// ── Small section header ─────────────────────────────────────
function SectionHead({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between" style={{ gap: '16px' }}>
      <div className="flex flex-col" style={{ gap: '3px' }}>
        <h2
          style={{
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            fontSize: '15px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center flex-shrink-0 hover:opacity-70 transition-opacity"
          style={{ gap: '4px', textDecoration: 'none' }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            View all
          </span>
          <ChevronRight size={14} color="var(--text-secondary)" />
        </Link>
      )}
    </div>
  );
}

// ── Loading skeleton grid ────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse" style={{ gap: '10px' }}>
          <div style={{ aspectRatio: '214/264', borderRadius: '18px', background: 'var(--bg-surface-elevated)' }} />
          <div style={{ height: '11px', width: '55%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
          <div style={{ height: '13px', width: '75%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
        </div>
      ))}
    </div>
  );
}

export default function ForYouPage() {
  const { user, gender, wishlist, toggleWishlist, recentlyViewed } = useApp();

  const { items: personalizedItems, loading: feedLoading } = usePersonalizedFeed({ limit: 24, gender });
  const { items: trendingItems } = useTrendingProducts(12);
  const { items: newItems } = useNewArrivals(12);
  const { vendors } = useRecommendedVendors(8);
  const { designs, isLoading: designsLoading } = useBespokeDesigns();

  // Real product listing — robust fallback when the recommendation
  // engine returns nothing (same approach as the home page).
  const audience = gender === 'male' ? 'men' : 'women';
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50, audience });

  const firstName = user?.name?.trim().split(/\s+/)[0] || '';

  // Personalized feed → product cards with a "why" chip
  const feedCards = useMemo<GridCard[]>(
    () =>
      personalizedItems
        .filter((it): it is ApiFeedItem & { product: ApiProduct } => !!it.product)
        .map((it) => ({
          product: it.product,
          reason: it.reasonCodes?.length ? REASON_LABELS[it.reasonCodes[0]] : undefined,
        })),
    [personalizedItems],
  );

  // Recommendation feeds → products, each with a listing fallback.
  const trendingProducts = useMemo<ApiProduct[]>(() => {
    const fromFeed = trendingItems.map((it) => it.product).filter((p): p is ApiProduct => !!p);
    return fromFeed.length > 0 ? fromFeed : allProducts.slice(0, 12);
  }, [trendingItems, allProducts]);

  const newProducts = useMemo<ApiProduct[]>(() => {
    const fromFeed = newItems.map((it) => it.product).filter((p): p is ApiProduct => !!p);
    return fromFeed.length > 0 ? fromFeed : [...allProducts].reverse().slice(0, 12);
  }, [newItems, allProducts]);

  // Main grid: personalized feed when we have it, otherwise real products so
  // the page is never empty for a signed-in user.
  const usingPersonal = !!user && feedCards.length > 0;
  const gridCards: GridCard[] = usingPersonal
    ? feedCards
    : allProducts.slice(0, 24).map((product) => ({ product }));
  const gridLoading =
    gridCards.length === 0 && (productsLoading || (!!user && feedLoading));

  const validRecent = recentlyViewed.filter(
    (item) => typeof item === 'object' && !!item?.id && !!item?.image && !!item?.href,
  );

  // Designs to surface (skip cancelled)
  const studioDesigns = designs.filter((d) => d.status !== 'cancelled').slice(0, 10);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '32px', paddingBottom: '8px' }}>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          borderRadius: '24px',
          padding: '32px 24px',
          background: 'linear-gradient(135deg, #26262a 0%, #313035 55%, #3b3a40 100%)',
        }}
      >
        {/* decorative glow — soft neutral light */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-70px', left: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)' }} />

        <div className="relative flex flex-col" style={{ gap: '16px', maxWidth: '640px' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <Sparkles size={14} color="#CFC9BE" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#CFC9BE', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              Curated for you
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              lineHeight: 1.05,
            }}
          >
            {firstName ? `${firstName}'s Edit` : 'Your Edit'}
          </h1>

          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '460px' }}>
            {user
              ? 'Handpicked from your style, your fit, your budget and the pieces you love — refreshed as you shop.'
              : 'Sign in to unlock a feed shaped around your style, fit and the pieces you love.'}
          </p>

          {user ? (
            <div className="flex flex-wrap" style={{ gap: '8px', marginTop: '4px' }}>
              {PILLARS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center"
                  style={{
                    gap: '6px',
                    padding: '7px 13px',
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  <Icon size={12} color="#CFC9BE" />
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center self-start transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                marginTop: '4px',
                padding: '13px 26px',
                borderRadius: '100px',
                background: '#FFFFFF',
                color: '#26262a',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                gap: '8px',
              }}
            >
              Sign in to personalize
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </section>

      {/* ─────────────────────── PICKED FOR YOU ─────────────────────── */}
      <section className="flex flex-col" style={{ gap: '16px' }}>
        <SectionHead
          title={user ? 'Picked for you' : 'Popular right now'}
          subtitle={
            usingPersonal
              ? 'The pieces we think are most you'
              : user
                ? 'Curated around your style and fit'
                : 'Loved across Qlozet this week'
          }
        />
        {gridLoading ? (
          <GridSkeleton />
        ) : gridCards.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {gridCards.map(({ product, reason }) => (
              <ProductCard
                key={product._id}
                id={product._id}
                imageUrl={getProductImage(product)}
                title={getProductName(product)}
                brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
                price={getProductPrice(product)}
                originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
                tag={getProductTag(product)}
                stockState={product.availability?.state}
                reason={reason}
                isFavorite={wishlist.includes(product._id)}
                onFavoriteToggle={() => toggleWishlist(product._id)}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: '48px 24px', borderRadius: '20px', background: 'var(--bg-surface-elevated)', gap: '10px' }}
          >
            <Sparkles size={28} color="var(--brand-brown)" strokeWidth={1.5} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '340px' }}>
              Browse a few pieces and your personalized edit will start filling in here.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center transition-opacity hover:opacity-80"
              style={{ marginTop: '4px', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--brand-brown)', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none' }}
            >
              Start exploring <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* ─────────────────────── FROM YOUR STUDIO (bespoke) ─────────────────────── */}
      {user && (studioDesigns.length > 0 || !designsLoading) && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead
            title="From your studio"
            subtitle="Your bespoke designs, ready to continue"
            href="/bespoke"
          />
          {designsLoading ? (
            <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '14px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: '150px', aspectRatio: '150/188', borderRadius: '18px', background: 'var(--bg-surface-elevated)' }} />
              ))}
            </div>
          ) : studioDesigns.length > 0 ? (
            <div className="flex overflow-x-auto hide-scrollbar snap-x" style={{ gap: '14px', paddingBottom: '4px' }}>
              {studioDesigns.map((d) => {
                const status = BESPOKE_STATUS[d.status] || BESPOKE_STATUS.draft;
                const href = `/bespoke/studio?name=${encodeURIComponent(d.name)}&type=${encodeURIComponent(d.category || 'Design')}&designId=${d._id}`;
                return (
                  <Link
                    key={d._id}
                    href={href}
                    className="group flex-shrink-0 snap-start flex flex-col transition-transform hover:-translate-y-1"
                    style={{ width: '150px', gap: '8px', textDecoration: 'none' }}
                  >
                    <div className="relative overflow-hidden" style={{ aspectRatio: '150/188', borderRadius: '18px', background: 'var(--bg-surface-elevated)' }}>
                      <Image
                        src={d.design_images?.[0] || '/image/bespoke-agbada-green.webp'}
                        alt={d.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="150px"
                      />
                      <span
                        className="absolute"
                        style={{ top: '8px', left: '8px', padding: '3px 9px', borderRadius: '6px', fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#FFF', background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</span>
                  </Link>
                );
              })}

              {/* New design tile */}
              <Link
                href="/bespoke"
                className="flex-shrink-0 snap-start flex flex-col items-center justify-center transition-all hover:opacity-80"
                style={{ width: '150px', aspectRatio: '150/188', borderRadius: '18px', border: '1.5px dashed var(--border-glass)', background: 'transparent', gap: '10px', textDecoration: 'none' }}
              >
                <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--brand-brown-tint, rgba(139,90,43,0.1))' }}>
                  <Plus size={20} color="var(--brand-brown)" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-brown)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New design</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/bespoke"
              className="flex items-center justify-between transition-all hover:opacity-90"
              style={{ padding: '20px 22px', borderRadius: '20px', background: 'var(--bg-surface-elevated)', gap: '16px', textDecoration: 'none' }}
            >
              <div className="flex items-center" style={{ gap: '14px' }}>
                <div className="flex items-center justify-center" style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--brand-brown-tint, rgba(139,90,43,0.1))', flexShrink: 0 }}>
                  <Scissors size={20} color="var(--brand-brown)" />
                </div>
                <div className="flex flex-col" style={{ gap: '3px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>Design something bespoke</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Turn your ideas into a made-to-fit outfit</span>
                </div>
              </div>
              <ArrowRight size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            </Link>
          )}
        </section>
      )}

      {/* ─────────────────────── VENDORS MADE FOR YOU ─────────────────────── */}
      {user && vendors.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="Vendors made for you" subtitle="Makers that match your taste" />
          <div className="flex overflow-x-auto hide-scrollbar snap-x" style={{ gap: '14px', paddingBottom: '4px' }}>
            {vendors.map((v) => {
              const cover = v.products?.find((p) => p.product)?.product;
              // The hydrated product carries the real vendor info; fall back to
              // the feed's own fields. (The feed's vendorName was "Unknown
              // Vendor" because the backend read business.name — the field is
              // business_name.)
              const biz = cover && typeof cover.business === 'object' ? cover.business : undefined;
              const vendorName = biz?.business_name || v.vendorName || 'Vendor';
              const logo = biz?.business_logo_url || v.vendorLogo;
              return (
                <Link
                  key={v.vendorId}
                  href={`/vendor/${v.vendorId}`}
                  className="group relative flex-shrink-0 snap-start overflow-hidden flex flex-col justify-end transition-transform hover:-translate-y-1"
                  style={{ width: '210px', height: '150px', borderRadius: '18px', background: 'var(--bg-surface-elevated)', textDecoration: 'none' }}
                >
                  {cover ? (
                    <Image
                      src={getProductImage(cover)}
                      alt={vendorName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="210px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Store size={28} color="var(--text-muted)" />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                  <div className="relative flex items-center" style={{ padding: '14px', gap: '10px' }}>
                    {/* Vendor logo avatar */}
                    <div
                      className="flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#FFF', border: '1.5px solid rgba(255,255,255,0.8)' }}
                    >
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={vendorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Store size={15} color="var(--brand-brown)" />
                      )}
                    </div>
                    <div className="flex flex-col" style={{ gap: '2px', minWidth: 0, flex: 1 }}>
                      <span className="truncate" style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif", fontSize: '13px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{vendorName}</span>
                      {v.explanations?.[0] && (
                        <span className="truncate" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)' }}>{v.explanations[0]}</span>
                      )}
                    </div>
                    <ChevronRight size={16} color="#FFF" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────── NEW THIS WEEK ─────────────────────── */}
      {newProducts.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="New this week" subtitle="Fresh drops picked for your feed" href="/discover" />
          <ProductCarousel title="" products={newProducts} />
        </section>
      )}

      {/* ─────────────────────── TRENDING (only as a supplement when the grid is personalized) ─────────────────────── */}
      {usingPersonal && trendingProducts.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="Trending now" subtitle="What everyone's loving" href="/discover" />
          <ProductCarousel title="" products={trendingProducts} />
        </section>
      )}

      {/* ─────────────────────── RECENTLY VIEWED ─────────────────────── */}
      {validRecent.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="Pick up where you left off" href="/products" />
          <div className="flex overflow-x-auto hide-scrollbar snap-x" style={{ gap: '12px', paddingBottom: '4px' }}>
            {validRecent.slice(0, 12).map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.href}
                className="relative flex-shrink-0 snap-start overflow-hidden transition-all hover:opacity-85 active:scale-95"
                style={{ width: '104px', aspectRatio: '104/130', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}
              >
                <Image src={item.image} alt="" fill className="object-cover" sizes="104px" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
