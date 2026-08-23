'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCompleteTheLook } from '@/hooks/useRecommendations';
import { getProductName, getProductImage, getProductPrice, getProductTag } from '@/lib/api-types';
import type { ApiProduct, ApiFeedItem } from '@/lib/api-types';
import { useCheckout } from '@/hooks/useCheckout';
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  ShoppingBag,
  Heart,
  Pen,
} from 'lucide-react';

// "Qlozet Premiere" subscription is hidden until it's built (its CTA was a
// no-op). Flip to true when the feature ships.
const SHOW_PREMIERE = false;

export default function CartPage() {
  const { cart, removeFromCart, toggleWishlist, wishlist, user } = useApp();
  const router = useRouter();
  const { fetchPreview, loading: previewLoading, error: previewError } = useCheckout();



  // Collapsible sections
  const [showPremiere, setShowPremiere] = useState(false);
  const [showLooking, setShowLooking] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);

  // Per-item pricing breakdown (authoritative, from the server) for the §8 ladder.
  const [breakdowns, setBreakdowns] = useState<Record<string, any>>({});
  useEffect(() => {
    let cancelled = false;
    cart.forEach((item) => {
      const hasSel =
        item.selections &&
        Object.values(item.selections).some((a: any) => Array.isArray(a) && a.length > 0);
      if (!hasSel && !item.applied_fabric_id) return;
      api
        .post('/orders/price-item', {
          product_id: item.id,
          selections: item.selections,
          ...(item.applied_fabric_id ? { applied_fabric_id: item.applied_fabric_id } : {}),
          ...(item.applied_fabric_yards ? { applied_fabric_yards: item.applied_fabric_yards } : {}),
        })
        .then((res) => {
          // API wrapper double-nests the service's { data } under its own data.
          const payload = res.data?.data?.data ?? res.data?.data ?? res.data;
          const b = payload?.breakdown;
          if (!cancelled && b) setBreakdowns((prev) => ({ ...prev, [item.id]: b }));
        })
        .catch(() => {
          // Don't fail silently — but dedupe to a single toast across all items
          // via a stable id (sonner updates rather than stacks).
          if (!cancelled)
            toast.error("Couldn't refresh prices", {
              id: 'cart-price-refresh',
              description: 'Showing the last known price for now.',
            });
        });
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  // Identity of any applied external fabric, so the cart can show WHICH fabric
  // (not just its cost). Keyed by fabric product id.
  const [fabricInfo, setFabricInfo] = useState<
    Record<string, { name?: string; image?: string }>
  >({});
  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(
      new Set(cart.map((i) => i.applied_fabric_id).filter(Boolean) as string[]),
    );
    ids.forEach((id) => {
      api
        .get(`/products/${id}`)
        .then((res) => {
          const fab = res.data?.data ?? res.data;
          const img = fab?.fabric?.images?.[0] ?? fab?.images?.[0];
          if (!cancelled) {
            setFabricInfo((prev) => ({
              ...prev,
              [id]: {
                name: fab?.fabric?.name ?? fab?.name,
                image: typeof img === 'string' ? img : (img as any)?.url,
              },
            }));
          }
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  // Total discount savings across the cart (§11).
  const totalDiscount = cart.reduce(
    (acc, item) => acc + (breakdowns[item.id]?.discount ?? 0) * item.quantity,
    0,
  );

  // Authoritative per-unit price: prefer the server breakdown (what the order
  // will actually charge) over the price captured at add-to-cart time, which can
  // be stale if the configuration changed. Falls back to item.price until the
  // breakdown loads.
  const effectivePrice = (item: { id: string; price: number }) =>
    breakdowns[item.id]?.final ?? item.price;

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + effectivePrice(item) * item.quantity, 0);
  const shipping = subtotal > 100000 || subtotal === 0 ? 0 : 5000;

  const { products: allProducts } = useProducts({ size: 20 });

  // Recommendation engine: complete-the-look based on cart items
  const cartItemIds = cart.map((c) => c.id);
  const { items: ctlItems } = useCompleteTheLook(cartItemIds, 6);

  // Helper: extract ApiProduct[] from feed items
  const feedToProducts = (items: ApiFeedItem[]): ApiProduct[] =>
    items.map(i => i.product).filter((p): p is ApiProduct => !!p && !cartItemIds.includes(p._id));

  // Suggested products: prefer recommendation engine, fallback to generic
  const ctlProducts = feedToProducts(ctlItems);
  const suggestedProducts = ctlProducts.length > 0
    ? ctlProducts.slice(0, 4)
    : allProducts.filter((p) => !cartItemIds.includes(p._id)).slice(0, 4);

  // "Looking for this?" — product tagged CUSTOMIZABLE
  const lookingProduct = allProducts.find((p) => !cartItemIds.includes(p._id) && getProductTag(p) === 'CUSTOMIZABLE');

  if (!user) {
    return (
      <div className="flex flex-col gap-6 py-4 lg:py-8 animate-fade-in">
        <h1
          className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px' }}
        >
          My Cart
        </h1>
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 24px', gap: '20px' }}>
          <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(44,24,16,0.06)' }}>
            <ShoppingBag size={32} color="var(--brand-brown)" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sign In Required
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
              You must sign in first before being able to view or manage your shopping cart.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="flex items-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '14px 32px',
              borderRadius: '100px',
              background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(44,24,16,0.2)',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ─── Card style ─────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    borderRadius: '24px',
    border: '1px solid var(--border-glass)',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
  };

  // ─── Empty Cart ─────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex flex-col gap-6 py-4 lg:py-8 animate-fade-in">
        <h1
          className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px' }}
        >
          My Cart
        </h1>
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 24px', gap: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}>
            <ShoppingBag size={28} color="var(--brand-brown)" strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Your cart is empty
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
            Browse our collection and add items to your cart.
          </p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '8px', padding: '12px 32px', fontSize: '13px', borderRadius: '100px' }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 lg:py-8 animate-fade-in w-full">

      {/* ─── Title ────────────────────────────────────────────────── */}
      <h1
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
        style={{ fontSize: '22px' }}
      >
        My Cart
      </h1>

      {/* ─── Two-Column Layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:items-start max-w-[900px] mx-auto w-full px-4 lg:px-0">

        {/* ══════ LEFT COLUMN — cart items + sections ══════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">

          {/* ── Cart Items Card ────────────────────────────────── */}
          <div style={cardStyle}>
            {cart.map((item, idx) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative flex-shrink-0 rounded-xl overflow-hidden bg-[var(--bg-surface-elevated)]"
                    style={{ width: '100px', height: '120px' }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    {/* Item number badge */}
                    <span
                      className="absolute flex items-center justify-center"
                      style={{
                        top: '6px', left: '6px',
                        width: '20px', height: '20px',
                        borderRadius: '50%',
                        background: 'var(--brand-fill)',
                        color: 'var(--brand-fill-text)',
                        fontSize: '10px',
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {item.quantity}
                    </span>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{item.title}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(item.id);
                          toast('Removed from cart', { description: item.title });
                        }}
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-[var(--text-muted)] hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₦{(effectivePrice(item) * item.quantity).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          (₦{effectivePrice(item).toLocaleString()} each)
                        </span>
                      )}
                    </div>

                    {/* Pricing breakdown (§8) */}
                    {breakdowns[item.id] && (
                      <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', fontSize: '11px' }}>
                        {(
                          [
                            ['Base', breakdowns[item.id].base],
                            ['Styles', breakdowns[item.id].styles_total],
                            ['Fabric', breakdowns[item.id].fabric_total],
                            ['Variant', breakdowns[item.id].variant_total],
                            ['Accessories', breakdowns[item.id].accessories_total],
                            ['Add-ons', breakdowns[item.id].addons_total],
                            ['Applied fabric', breakdowns[item.id].external_fabric],
                          ] as [string, number][]
                        )
                          .filter(([label, v]) => label === 'Base' || v > 0)
                          .map(([label, v]) => (
                            <div key={label} className="flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                              <span>{label}</span>
                              <span>₦{v.toLocaleString()}</span>
                            </div>
                          ))}
                        <div className="flex items-center justify-between" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontWeight: 600 }}>
                          <span>Before discount</span>
                          <span>₦{breakdowns[item.id].before_discount.toLocaleString()}</span>
                        </div>
                        {breakdowns[item.id].discount > 0 && (
                          <div className="flex items-center justify-between" style={{ color: '#059669' }}>
                            <span>Discount</span>
                            <span>-₦{breakdowns[item.id].discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between" style={{ marginTop: '2px', color: 'var(--text-primary)', fontWeight: 700 }}>
                          <span>Final</span>
                          <span>₦{breakdowns[item.id].final.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Applied external fabric — which fabric the customer is using */}
                    {item.applied_fabric_id && fabricInfo[item.applied_fabric_id] && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', background: '#EDE9FE', flexShrink: 0 }}>
                          {fabricInfo[item.applied_fabric_id].image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fabricInfo[item.applied_fabric_id].image}
                              alt={fabricInfo[item.applied_fabric_id].name ?? 'Fabric'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : null}
                        </div>
                        <span style={{ fontSize: '12px', color: '#4C1D95' }}>
                          Using your fabric:{' '}
                          <strong>{fabricInfo[item.applied_fabric_id].name ?? 'your fabric'}</strong>
                          {item.applied_fabric_yards ? ` · ${item.applied_fabric_yards} yd` : ''}
                        </span>
                      </div>
                    )}

                    {/* Customization tag */}
                    {item.kind === 'clothing' && (
                      <div className="flex items-center gap-1.5" style={{ marginTop: '2px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#E8430A' }} />
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#E8430A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Ready edit for customization
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
                      <Link
                        href={`/products/${item.id}`}
                        className="flex items-center gap-1.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                        style={{
                          padding: '5px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-glass)',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          textDecoration: 'none',
                        }}
                      >
                        <Pen size={9} />
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="flex items-center justify-center transition-all hover:opacity-90 active:scale-90"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: wishlist.includes(item.id) ? 'var(--brand-fill)' : 'none',
                          border: wishlist.includes(item.id) ? 'none' : '1px solid var(--border-glass)',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <Heart size={13} color={wishlist.includes(item.id) ? 'var(--brand-fill-text)' : 'var(--text-primary)'} fill={wishlist.includes(item.id) ? 'var(--brand-fill-text)' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider between items */}
                {idx < cart.length - 1 && (
                  <div style={{ height: '1px', background: 'var(--border-glass)', margin: '20px 0' }} />
                )}
              </div>
            ))}
          </div>

          {/* ── QLOZET PREMIERE AFRICA ─────────────────────────── */}
          {/* Hidden until the subscription is actually built — the "Add to Bag"
              action was a no-op. */}
          {SHOW_PREMIERE && (
          <div style={cardStyle}>
            <button
              onClick={() => setShowPremiere(!showPremiere)}
              className="w-full flex items-center justify-between"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-fill)' }}
                >
                  <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '11px', fontFamily: 'var(--font-display)' }}>Q</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Qlozet Premiere Africa
                </h3>
              </div>
              {showPremiere ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>

            {showPremiere && (
              <div className="animate-fade-in" style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                  Get unlimited Next Day Delivery for only ₦10,000 a year. Minimum spend per order applies.
                </p>
                <button
                  className="transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: 'var(--brand-fill)',
                    color: 'var(--brand-fill-text)',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add to Bag
                </button>
              </div>
            )}
          </div>
          )}

          {/* ── LOOKING FOR THIS? ──────────────────────────────── */}
          {lookingProduct && (
            <div style={cardStyle}>
              <button
                onClick={() => setShowLooking(!showLooking)}
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Looking for this ?
                </h3>
                {showLooking ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </button>

              {showLooking && (
                <div className="animate-fade-in" style={{ marginTop: '16px', maxWidth: '180px' }}>
                  <ProductCard
                    id={lookingProduct._id}
                    imageUrl={getProductImage(lookingProduct)}
                    title={getProductName(lookingProduct)}
                    brand={typeof lookingProduct.business === 'object' ? lookingProduct.business?.business_name ?? '' : ''}
                    price={getProductPrice(lookingProduct)}
                    originalPrice={undefined}
                    tag={getProductTag(lookingProduct)}
                    isFavorite={wishlist.includes(lookingProduct._id)}
                    onFavoriteToggle={(id) => toggleWishlist(id as string)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── SUGGESTED FOR YOU ──────────────────────────────── */}
          <div style={cardStyle}>
            <button
              onClick={() => setShowSuggested(!showSuggested)}
              className="w-full flex items-center justify-between"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Suggested for you
              </h3>
              {showSuggested ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>

            {showSuggested && (
              <div className="animate-fade-in hide-scrollbar flex overflow-x-auto gap-3 mt-4" style={{ paddingBottom: '4px' }}>
                {suggestedProducts.map((p) => (
                  <div key={p._id} style={{ minWidth: '150px', maxWidth: '170px', flexShrink: 0 }}>
                    <ProductCard
                      id={p._id}
                      imageUrl={getProductImage(p)}
                      title={getProductName(p)}
                      brand={typeof p.business === 'object' ? p.business?.business_name ?? '' : ''}
                      price={getProductPrice(p)}
                      originalPrice={undefined}
                      tag={getProductTag(p)}
                      isFavorite={wishlist.includes(p._id)}
                      onFavoriteToggle={(id) => toggleWishlist(id as string)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════ RIGHT COLUMN — Order Summary (sticky) ══════ */}
        <div className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-6">
          <div style={{ ...cardStyle, padding: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              Total
            </h3>

            {/* Sub-total */}
            <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sub-total</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>₦{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount savings (§11) */}
            {totalDiscount > 0 && (
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#059669' }}>Discount savings</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>−₦{totalDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Delivery */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Delivery</span>
                <Info size={12} color="var(--text-muted)" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
              </span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0 0 14px 0' }} />

            {/* Delivery note — the actual courier per vendor is chosen at checkout. */}
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
              Choose a delivery option for each vendor at checkout.
            </p>

            {/* Checkout Button */}
            <button
              onClick={async () => {
                const data = await fetchPreview();
                if (data) {
                  // Store preview for the checkout page
                  sessionStorage.setItem('qlozet_checkout_preview', JSON.stringify(data));
                  router.push('/checkout');
                }
              }}
              disabled={previewLoading || cart.length === 0}
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: '13px',
                borderRadius: '10px',
                background: previewLoading ? '#999' : '#064E3B',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '14px',
                border: 'none',
                cursor: previewLoading ? 'wait' : 'pointer',
                opacity: cart.length === 0 ? 0.5 : 1,
              }}
            >
              {previewLoading ? 'Loading Shipping Rates…' : 'Check Out'}
            </button>
            {previewError && (
              <p style={{ fontSize: '11px', color: '#DC2626', textAlign: 'center', marginBottom: '10px' }}>
                {previewError}
              </p>
            )}

            {/* Accepted card networks (Paystack) */}
            <div className="flex items-center justify-center gap-2.5">
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '2px' }}>We accept</span>
              {/* Mastercard */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" fill="#EB001B" opacity="0.9"/>
                  <circle cx="13" cy="7" r="5.5" fill="#F79E1B" opacity="0.9"/>
                  <path d="M10 2.5a5.5 5.5 0 010 9 5.5 5.5 0 000-9z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* Visa */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
              </div>
              {/* Verve */}
              <div style={{ width: '38px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#0AA1DD', letterSpacing: '-0.02em' }}>verve</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
