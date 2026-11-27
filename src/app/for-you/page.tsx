'use client';

import { useMemo, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Ruler, Scissors, Plus, Store } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  usePersonalizedFeed,
  useTrendingProducts,
  useNewArrivals,
  useRecommendedVendors,
  useFitsMe,
} from '@/hooks/useRecommendations';
import { useMeasurements } from '@/hooks/useMeasurements';
import { ReasonPanel, ReasonPanelSkeleton, REASON_COLORS } from '@/components/ReasonPanel';
import { useBespokeDesigns } from '@/hooks/useBespokeDesigns';
import { useProducts } from '@/hooks/useProducts';
import { getProductImage, hasDiscount } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';

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

/**
 * Panels down the page; two side by side on a wide screen, an odd last one
 * spanning the row.
 */
function PanelGrid({ children }: { children: ReactNode[] }) {
  const panels = children.filter(Boolean);
  if (panels.length === 0) return null;
  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2" style={{ gap: '16px' }}>
      {panels.map((panel, i) => (
        <div
          key={i}
          className={i === panels.length - 1 && panels.length % 2 === 1 ? '2xl:col-span-2' : ''}
          style={{ minWidth: 0 }}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

/** A plain one-line card with an action (sign in, add measurements). */
function PromptCard({ icon, text, href, action }: { icon?: ReactNode; text: string; href: string; action: string }) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: '14px',
        padding: '16px 14px 16px 18px',
        borderRadius: '20px',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-glass)',
      }}
    >
      {icon}
      <p style={{ flex: 1, fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{text}</p>
      <Link
        href={href}
        className="flex-shrink-0 transition-opacity hover:opacity-90"
        style={{
          padding: '10px 16px',
          borderRadius: '100px',
          background: 'var(--brand-fill)',
          color: 'var(--brand-fill-text)',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        {action}
      </Link>
    </div>
  );
}

export default function ForYouPage() {
  const { user, gender, recentlyViewed } = useApp();

  const { items: personalizedItems, loading: feedLoading } = usePersonalizedFeed({ limit: 24, gender });
  const { items: saleItems } = usePersonalizedFeed({ limit: 24, gender, onSale: true });
  const { picks: fitPicks } = useFitsMe(24);
  const { profiles: measurementSets, isLoading: measurementsLoading } = useMeasurements();
  const { items: trendingItems } = useTrendingProducts(12);
  const { items: newItems } = useNewArrivals(12);
  const { vendors } = useRecommendedVendors(8);
  const { designs, isLoading: designsLoading } = useBespokeDesigns();

  // Real product listing — robust fallback when the recommendation
  // engine returns nothing (same approach as the home page).
  const audience = gender === 'male' ? 'men' : 'women';
  const { products: allProducts, loading: productsLoading } = useProducts({ size: 50, audience });

  const firstName = user?.name?.trim().split(/\s+/)[0] || '';

  const feedProducts = useMemo<ApiProduct[]>(
    () => personalizedItems.map((it) => it.product).filter((p): p is ApiProduct => !!p),
    [personalizedItems],
  );
  // The sale rule again here: a backend without onSale sends the ordinary
  // feed, which must not show under a sale title.
  const saleProducts = useMemo<ApiProduct[]>(
    () => saleItems.map((it) => it.product).filter((p): p is ApiProduct => !!p && hasDiscount(p)),
    [saleItems],
  );
  const sizeFor = useMemo(() => new Map(fitPicks.map((f) => [f.product._id, f.bestSize])), [fitPicks]);

  // Recommendation feeds → products, each with a listing fallback.
  const trendingProducts = useMemo<ApiProduct[]>(() => {
    const fromFeed = trendingItems.map((it) => it.product).filter((p): p is ApiProduct => !!p);
    return fromFeed.length > 0 ? fromFeed : allProducts.slice(0, 12);
  }, [trendingItems, allProducts]);

  const newProducts = useMemo<ApiProduct[]>(() => {
    const fromFeed = newItems.map((it) => it.product).filter((p): p is ApiProduct => !!p);
    return fromFeed.length > 0 ? fromFeed : [...allProducts].reverse().slice(0, 12);
  }, [newItems, allProducts]);

  // Picked for you: the personal feed when there is one, else the shop's
  // listing so the page is never empty.
  const usingPersonal = !!user && feedProducts.length > 0;
  const picked = usingPersonal ? feedProducts : allProducts.slice(0, 24);
  const pickedLoading = picked.length === 0 && (productsLoading || (!!user && feedLoading));
  const pickedTitle = usingPersonal ? 'Picked for you' : 'Popular right now';
  const pickedSubtitle = usingPersonal ? 'Based on what you browse, save and buy' : 'Loved across Qlozet this week';
  const hasMeasurements = measurementSets.length > 0;

  const validRecent = recentlyViewed.filter(
    (item) => typeof item === 'object' && !!item?.id && !!item?.image && !!item?.href,
  );

  // Designs to surface (skip cancelled)
  const studioDesigns = designs.filter((d) => d.status !== 'cancelled').slice(0, 10);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '32px', paddingBottom: '8px' }}>
      {/* ───────────────────────── TITLE ───────────────────────── */}
      <header className="flex flex-col" style={{ gap: '6px' }}>
        <h1
          style={{
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            fontSize: '30px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.05,
          }}
        >
          {firstName ? `${firstName}'s Edit` : 'For you'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Every row says why it is here, and it all updates as you shop.
        </p>
      </header>

      {!user && (
        <PromptCard
          text="Sign in and this page fills with picks from your style, fit and saves."
          href="/auth/login"
          action="Sign in"
        />
      )}

      {/* ─────────────────────── TOP PANELS ─────────────────────── */}
      {pickedLoading ? (
        <ReasonPanelSkeleton color={REASON_COLORS.graphite} />
      ) : (
        <PanelGrid>
          {[
            picked.length > 0 && (
              <ReasonPanel
                key="picked"
                title={pickedTitle}
                subtitle={pickedSubtitle}
                color={REASON_COLORS.graphite}
                products={picked.slice(0, 12)}
                href="/for-you/picked"
              />
            ),
            fitPicks.length > 0 && (
              <ReasonPanel
                key="fits"
                title="Fits your measurements"
                subtitle="Cut to the sizes in your saved measurements"
                color={REASON_COLORS.slate}
                products={fitPicks.slice(0, 12).map((f) => f.product)}
                note={(p) => (sizeFor.get(p._id) ? `Your size ${sizeFor.get(p._id)}` : undefined)}
                href="/for-you/fits"
              />
            ),
            saleProducts.length > 0 && (
              <ReasonPanel
                key="sale"
                title="From the sale, for you"
                subtitle="Discounted pieces that match your taste"
                color={REASON_COLORS.sage}
                products={saleProducts.slice(0, 12)}
                href="/for-you/sale"
              />
            ),
          ]}
        </PanelGrid>
      )}

      {/* Signed in, no measurements yet: what saving them adds. */}
      {user && !measurementsLoading && !hasMeasurements && (
        <PromptCard
          icon={<Ruler size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />}
          text="Save your measurements and we will show pieces cut to fit you."
          href="/profile?tab=add-measurement"
          action="Add"
        />
      )}

      {/* ─────────────────────── FROM YOUR STUDIO (bespoke) ─────────────────────── */}
      {user && (studioDesigns.length > 0 || !designsLoading) && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead
            title="Your bespoke designs"
            subtitle="Pick up a design or start a new one"
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

      {/* ─────────────────────── NEW + TRENDING ─────────────────────── */}
      <PanelGrid>
        {[
          newProducts.length > 0 && (
            <ReasonPanel
              key="new"
              title="New this week"
              subtitle="Fresh drops picked for your feed"
              color={REASON_COLORS.tan}
              products={newProducts}
              href="/whats-new"
            />
          ),
          trendingProducts.length > 0 && (
            <ReasonPanel
              key="trending"
              title="Trending now"
              subtitle="What everyone's loving"
              color={REASON_COLORS.wine}
              products={trendingProducts}
              href="/trending"
            />
          ),
        ]}
      </PanelGrid>

      {/* ─────────────────────── VENDORS MADE FOR YOU ─────────────────────── */}
      {user && vendors.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="Stores made for you" subtitle="Makers that match your taste" />
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
                        <img loading="lazy" decoding="async" src={logo} alt={vendorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* ─────────────────────── RECENTLY VIEWED ─────────────────────── */}
      {validRecent.length > 0 && (
        <section className="flex flex-col" style={{ gap: '16px' }}>
          <SectionHead title="Pick up where you left off" href="/recently-viewed" />
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
