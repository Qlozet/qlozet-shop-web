'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp, cartLineId } from '@/context/AppContext';
import { useCheckout } from '@/hooks/useCheckout';
import { api } from '@/lib/api';
import { openPaystackModal } from '@/lib/paystack';
import type { CheckoutPreviewResponse } from '@/lib/api-types';
import {
  ChevronUp,
  ChevronDown,
  Info,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Truck,
  Wallet,
  Check,
} from 'lucide-react';

type PromoTab = 'promo' | 'voucher' | 'rewards';

// Promo/voucher UI is hidden until codes are validated server-side. The old
// flow checked a hardcoded code client-side and granted a flat discount to
// anyone who found it. Flip to true once a real promo endpoint exists.
const SHOW_PROMO = false;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, user } = useApp();
  const checkout = useCheckout();

  // Promo section
  const [showPromo, setShowPromo] = useState(true);
  const [promoTab, setPromoTab] = useState<PromoTab>('promo');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Delivery address
  const [deliveryName, setDeliveryName] = useState(user?.name || 'Guest User');
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    area: '',
    state: '',
    zip: '',
    country: '',
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initCheckout = async () => {
      setIsLoadingAddress(true);
      let addressId: string | undefined = undefined;

      // 1. Fetch user address (if token exists)
      const token = typeof window !== 'undefined' ? localStorage.getItem('qlozet_access_token') : null;
      if (token) {
        try {
          const res = await api.get('/users/customer/addresses');

          // The backend response interceptor wraps in { statusCode, data }
          // But sometimes it could be nested: res.data.data or just res.data
          let addressList: any[] = [];
          
          if (res.data?.data && Array.isArray(res.data.data)) {
            addressList = res.data.data;
          } else if (Array.isArray(res.data?.data)) {
            addressList = res.data.data;
          } else if (Array.isArray(res.data)) {
            addressList = res.data;
          } else if (res.data?.data && !Array.isArray(res.data.data)) {
            // Single address object wrapped
            addressList = [res.data.data];
          }
          
          if (addressList.length > 0) {
            const defaultAddr = addressList.find((addr: any) => addr.is_default) || addressList[0];
            if (defaultAddr) {
              addressId = defaultAddr._id || defaultAddr.id;
              if (isMounted) {
                setDeliveryName(defaultAddr.full_name || defaultAddr.label || defaultAddr.name || 'Guest User');
                setDeliveryAddress({
                  line1: defaultAddr.address || defaultAddr.address_line_1 || '',
                  area: defaultAddr.city || '',
                  state: defaultAddr.state || '',
                  zip: defaultAddr.postal_code || defaultAddr.zip_code || '',
                  country: defaultAddr.country || 'Nigeria',
                });
              }
            }
          } else {
            console.warn('[Checkout] No addresses found in response');
          }
        } catch (err: any) {
          console.warn('[Checkout] Failed to fetch addresses:', err?.response?.status, err?.response?.data || err.message);
        }
      } else {
        console.warn('[Checkout] No auth token found, skipping address fetch');
      }
      
      if (isMounted) {
        setIsLoadingAddress(false);
      }

      // 2. Hydrate Checkout Preview using the determined addressId
      const stored = sessionStorage.getItem('qlozet_checkout_preview');
      if (stored && !addressId) {
        try {
          JSON.parse(stored);
          checkout.fetchPreview();
        } catch {
          checkout.fetchPreview(addressId);
        }
      } else {
        checkout.fetchPreview(addressId);
      }
    };

    initCheckout();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | null>(null);
  const [payError, setPayError] = useState('');

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Per-item breakdowns → total item-level discount savings (§11, informational;
  // the subtotal is already the discounted final).
  const [breakdowns, setBreakdowns] = useState<Record<string, any>>({});

  // Authoritative per-unit price: the server breakdown final (exactly what the
  // order will charge) when loaded, else the price stored at add-to-cart time.
  const effectivePrice = (item: { id: string; price: number }) =>
    breakdowns[cartLineId(item)]?.final ?? item.price;

  // Computations — sum the authoritative per-item finals so the displayed
  // subtotal matches what createOrder will actually charge (the checkout preview
  // could be stale after a re-configuration).
  const subtotal = cart.reduce((acc, item) => acc + effectivePrice(item) * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const shipping = checkout.totalShipping;
  const total = subtotal - discount + shipping;

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
          if (!cancelled && b) setBreakdowns((prev) => ({ ...prev, [cartLineId(item)]: b }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);
  const itemSavings = cart.reduce(
    (acc, item) => acc + (breakdowns[cartLineId(item)]?.discount ?? 0) * item.quantity,
    0,
  );

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.toUpperCase() === '2773672') {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleBuyNow = async () => {
    if (cart.length === 0) return;

    // Require an explicit payment choice. Without this, a null selection
    // silently defaulted to Paystack and returned a confusing "unable to
    // initialize payment" error when no card had been added.
    if (!paymentMethod) {
      setPayError('Please choose how you want to pay — add a card or select Pay with Wallet.');
      return;
    }
    setPayError('');
    setIsProcessing(true);

    const method = paymentMethod === 'wallet' ? 'wallet' : 'paystack';
    const result = await checkout.placeOrder(method);

    if (!result) {
      setIsProcessing(false);
      return;
    }

    // Wallet: charged immediately — hand off to the single confirmation page
    // (same one card uses). It resolves instantly since the wallet transaction
    // is already successful, and clears the cart there.
    if (method === 'wallet') {
      const ref = result.transaction?.reference || result.order?.reference;
      router.push(ref ? `/payment/verify?reference=${encodeURIComponent(ref)}` : '/payment/verify');
      return;
    }

    // Card: open the Paystack modal ON this page (no redirect). The order was
    // created UNPAID; only a successful popup means it was charged. On success
    // we hand off to /payment/verify which polls the transaction, records the
    // outcome and clears the cart.
    const accessCode = result.payment?.access_code;
    const paymentUrl = result.payment?.paymentUrl || result.authorization_url;
    const reference = result.transaction?.reference || result.payment?.reference;

    if (!accessCode) {
      // No inline access code — fall back to Paystack's hosted checkout page.
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      setPayError('We could not start the card payment. Your order was not charged — please try again.');
      setIsProcessing(false);
      return;
    }

    await openPaystackModal({
      accessCode,
      onSuccess: (ref) => {
        const r = ref || reference;
        // Full-page navigation (NOT router.push): an SPA transition leaves the
        // Paystack popup's full-screen overlay mounted in the DOM on the next
        // page, which silently blocks every click. A hard navigation tears it
        // down — this is what the vendor platform does too.
        window.location.href = r
          ? `/payment/verify?reference=${encodeURIComponent(r)}`
          : '/payment/verify';
      },
      onClose: () => {
        // Customer dismissed the popup without paying — keep the cart/order.
        setIsProcessing(false);
        setPayError('Payment was not completed. You can try again when ready.');
      },
      onError: (msg) => {
        // Inline script failed to load — fall back to hosted checkout if we can.
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
        setIsProcessing(false);
        setPayError(msg || 'Card payment failed. Please try again.');
      },
    });
  };

  // Card style
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    borderRadius: '24px',
    border: '1px solid var(--border-glass)',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  // ─── Empty Cart Redirect ────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in" style={{ padding: '80px 24px', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No items to checkout</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Add items to your cart first.</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '8px', padding: '12px 32px', fontSize: '13px', borderRadius: '100px' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 lg:py-8 animate-fade-in w-full">

      {/* ─── Title ────────────────────────────────────────────────── */}
      <h1
        className="text-left lg:text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
        style={{ fontSize: '22px' }}
      >
        Checkout
      </h1>

      {/* ─── Two-Column Layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start max-w-[900px] mx-auto w-full">

        {/* ══════ LEFT COLUMN ══════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* ── PROMO, VOUCHERS OR REWARD ─────────────────────── */}
          {/* Hidden until promo codes are validated server-side — the previous
              client-side check granted a flat discount to anyone with the code. */}
          {SHOW_PROMO && (
          <div style={cardStyle}>
            <button
              onClick={() => setShowPromo(!showPromo)}
              className="w-full flex items-center justify-between"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <h3 style={sectionTitle}>Promo, Vouchers or Reward</h3>
              {showPromo ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>

            {showPromo && (
              <div className="animate-fade-in" style={{ marginTop: '16px' }}>
                {/* Tabs */}
                <div className="flex gap-0" style={{ marginBottom: '16px' }}>
                  {(['promo', 'voucher', 'rewards'] as PromoTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPromoTab(tab)}
                      className="transition-colors"
                      style={{
                        padding: '8px 18px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        border: '1px solid var(--border-glass)',
                        borderRight: tab !== 'rewards' ? 'none' : '1px solid var(--border-glass)',
                        background: promoTab === tab ? 'var(--text-primary)' : 'var(--bg-base)',
                        color: promoTab === tab ? 'var(--bg-base)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: tab === 'promo' ? '8px 0 0 8px' : tab === 'rewards' ? '0 8px 8px 0' : '0',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Input + Button */}
                <div className="flex gap-2" style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      fontSize: '13px',
                      outline: 'none',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    type="button"
                    className="transition-all hover:bg-[var(--bg-surface-elevated)]"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Apply
                  </button>
                </div>

                {promoApplied && (
                  <p style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: 600, marginBottom: '8px' }}>
                    ✓ 15% discount applied!
                  </p>
                )}
                {promoError && (
                  <p style={{ fontSize: '12px', color: '#E8430A', fontWeight: 600, marginBottom: '8px' }}>
                    {promoError}
                  </p>
                )}

                {/* Need to Know */}
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Need to Know
                </h4>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                  <li>You can only use one discount/promo code per order. This applies to our free-delivery codes, too.</li>
                  <li>Discount/promo codes cannot be used when buying gift vouchers.</li>
                </ul>
              </div>
            )}
          </div>
          )}

          {/* ── DELIVERY ADDRESS ───────────────────────────────── */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={sectionTitle}>Delivery Address</h3>
              <Info size={16} color="var(--text-muted)" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{deliveryName}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '16px' }}>
                  <p style={{ margin: 0 }}>{deliveryAddress.line1}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.area}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.state}, {deliveryAddress.zip}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.country}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/profile?tab=address-book')}
                className="transition-all hover:bg-[var(--bg-surface-elevated)]"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* ── DELIVERY OPTIONS (per vendor) ────────────────── */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={sectionTitle}>Shipping</h3>
              <Truck size={16} color="var(--text-muted)" />
            </div>

            {checkout.loading && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--border-glass)', borderTopColor: '#064E3B', borderRadius: '50%', display: 'inline-block' }} />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Loading shipping rates…</p>
              </div>
            )}

            {checkout.error && (
              <div className="flex items-start gap-2" style={{ padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2', marginBottom: '12px' }}>
                <AlertCircle size={14} color="#DC2626" className="flex-shrink-0" style={{ marginTop: '2px' }} />
                <p style={{ fontSize: '11px', color: '#DC2626', lineHeight: 1.6, margin: 0 }}>{checkout.error}</p>
              </div>
            )}

            {checkout.preview?.vendor_shipping.map((vendor) => {
              const selected = checkout.selectedCouriers.find((s) => s.business_id === vendor.business_id);
              return (
                <div key={vendor.business_id} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {vendor.business_name}
                    <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
                      {vendor.items.length} item{vendor.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {vendor.rates.map((rate) => (
                      <button
                        key={String(rate.courier_id)}
                        onClick={() => checkout.selectCourier(vendor.business_id, rate)}
                        className="flex items-center justify-between w-full transition-all"
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: selected?.courier.courier_id === rate.courier_id
                            ? '2px solid #064E3B'
                            : '1px solid var(--border-glass)',
                          background: selected?.courier.courier_id === rate.courier_id
                            ? 'rgba(6,78,59,0.03)'
                            : 'var(--bg-surface-elevated)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {rate.courier_image && (
                            <Image src={rate.courier_image} alt="" width={20} height={20} style={{ borderRadius: '4px' }} />
                          )}
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{rate.courier_name}</div>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{rate.delivery_eta_time}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₦{rate.rate_amount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Fabric transfers */}
            {checkout.preview?.fabric_transfers.map((ft) => {
              const key = `${ft.fabric_vendor_id}_${ft.tailor_vendor_id}`;
              const selected = checkout.selectedFabricCouriers.find((s) => s.key === key);
              return (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-brown)', marginBottom: '6px' }}>
                    Fabric Transfer
                    <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
                      {ft.fabric_name} ({ft.fabric_yards}yd) → {ft.tailor_vendor_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {ft.rates.map((rate) => (
                      <button
                        key={String(rate.courier_id)}
                        onClick={() => checkout.selectFabricCourier(key, rate)}
                        className="flex items-center justify-between w-full transition-all"
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: selected?.courier.courier_id === rate.courier_id
                            ? '2px solid var(--brand-fill)'
                            : '1px solid var(--border-glass)',
                          background: selected?.courier.courier_id === rate.courier_id
                            ? 'rgba(139,90,43,0.03)'
                            : 'var(--bg-surface-elevated)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{rate.courier_name}</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{rate.delivery_eta_time}</div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₦{rate.rate_amount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {!checkout.loading && shipping > 0 && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                Total Shipping: ₦{shipping.toLocaleString()}
              </div>
            )}

            <div className="flex items-start gap-2" style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', marginTop: '12px' }}>
              <AlertCircle size={14} color="var(--text-muted)" className="flex-shrink-0" style={{ marginTop: '2px' }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                No delivery on Public Holidays. All orders are subject to Customs and Duty charges, payable by the recipient of the order.
              </p>
            </div>
          </div>

          {/* ── PAYMENT ────────────────────────────────────────── */}
          <div style={cardStyle}>
            <h3 style={{ ...sectionTitle, marginBottom: '16px' }}>Payment</h3>

            {/* Billing Address */}
            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Delivery Address
                </h4>
                <Info size={14} color="var(--text-muted)" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  {isLoadingAddress ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-[var(--border-glass)] rounded animate-pulse" />
                      <div className="h-3 w-48 bg-[var(--bg-surface-elevated)] rounded animate-pulse mt-2" />
                      <div className="h-3 w-40 bg-[var(--bg-surface-elevated)] rounded animate-pulse" />
                      <div className="h-3 w-36 bg-[var(--bg-surface-elevated)] rounded animate-pulse" />
                    </div>
                  ) : deliveryAddress.line1 ? (
                    <>
                      <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{deliveryName}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '16px' }}>
                        <p style={{ margin: 0 }}>{deliveryAddress.line1}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.area}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.state}, {deliveryAddress.zip}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.country}</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '16px' }}>
                      No default address saved.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/profile?tab=address-book')}
                  className="transition-all hover:bg-[var(--bg-surface-elevated)]"
                  style={{
                    padding: '7px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0 0 20px 0' }} />

            {/* Payment Type */}
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Payment Method
            </h4>

            {/* Two consistent, selectable options with a radio indicator. */}
            <div className="flex flex-col gap-2.5" style={{ marginBottom: '16px' }}>
              {([
                { key: 'card', title: 'Credit / Debit Card', sub: 'Pay securely with Paystack', Icon: CreditCard },
                { key: 'wallet', title: 'Pay with Wallet', sub: 'Use your Qlozet wallet balance', Icon: Wallet },
              ] as const).map(({ key, title, sub, Icon }) => {
                const active = paymentMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setPaymentMethod(key); setPayError(''); }}
                    aria-pressed={active}
                    className="w-full flex items-center gap-3 text-left transition-all"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: active ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: active ? 'var(--bg-surface-elevated)' : 'var(--bg-base)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--bg-surface-elevated)', color: 'var(--brand-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>
                    </span>
                    <span
                      aria-hidden
                      style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        border: active ? '6px solid var(--brand-fill)' : '2px solid var(--border-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-base)',
                      }}
                    >
                      {active && <Check size={10} color="var(--brand-fill-text)" style={{ marginTop: '-1px' }} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Accepted card networks (Paystack) */}
            <div className="flex items-center justify-center gap-2.5">
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '2px' }}>We accept</span>
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" fill="#EB001B" opacity="0.9"/>
                  <circle cx="13" cy="7" r="5.5" fill="#F79E1B" opacity="0.9"/>
                  <path d="M10 2.5a5.5 5.5 0 010 9 5.5 5.5 0 000-9z" fill="#FF5F00"/>
                </svg>
              </div>
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
              </div>
              <div style={{ width: '38px', height: '22px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#0AA1DD', letterSpacing: '-0.02em' }}>verve</span>
              </div>
            </div>
          </div>

          {/* ── OUT-OF-STOCK NOTICE ────────────────────────────── */}
          {checkout.unavailableItems.length > 0 && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid rgba(180,35,42,0.18)', marginBottom: '12px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                <AlertCircle size={14} color="#B4232A" className="flex-shrink-0" />
                <p style={{ fontSize: '12px', fontWeight: 800, color: '#B4232A', margin: 0 }}>
                  Some items are no longer available
                </p>
              </div>
              <ul style={{ margin: 0, paddingLeft: '22px' }}>
                {checkout.unavailableItems.map((it) => (
                  <li key={it.product_id} style={{ fontSize: '11.5px', color: '#8A1E24', lineHeight: 1.7 }}>
                    <strong>{it.product_name}</strong> — {it.reason}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '11px', color: '#8A1E24', margin: '6px 0 0' }}>
                Remove them from your cart to continue.
              </p>
            </div>
          )}

          {/* ── BUY NOW BUTTON ─────────────────────────────────── */}
          {(payError || (checkout.error && !checkout.loading)) && (
            <div className="flex items-start gap-2" style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEF2F2', marginBottom: '12px' }}>
              <AlertCircle size={14} color="#DC2626" className="flex-shrink-0" style={{ marginTop: '2px' }} />
              <p style={{ fontSize: '11px', color: '#DC2626', lineHeight: 1.6, margin: 0 }}>{payError || checkout.error}</p>
            </div>
          )}
          <button
            onClick={handleBuyNow}
            disabled={isProcessing || checkout.placing || !checkout.isReady}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: '#064E3B',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: 'none',
              cursor: (isProcessing || checkout.placing || !checkout.isReady) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(45,106,79,0.25)',
              opacity: !checkout.isReady ? 0.5 : 1,
            }}
          >
            {isProcessing || checkout.placing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block' }} />
                Placing Order...
              </span>
            ) : !checkout.isReady ? (
              'Select Shipping to Continue'
            ) : (
              `Pay ₦${total.toLocaleString()}`
            )}
          </button>
        </div>

        {/* ══════ RIGHT COLUMN — Order Summary ══════ */}
        <div className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-6">
          <div style={{ ...cardStyle, padding: '20px' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'Item' : 'Items'}
              </h3>
              <Link href="/cart" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-brown)', textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none' }}>
                Edit
              </Link>
            </div>

            {/* Item List */}
            <div className="flex flex-col gap-3" style={{ marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={cartLineId(item)} className="flex gap-3">
                  <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-surface-elevated)]" style={{ width: '56px', height: '66px' }}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h4 className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.title}</h4>
                        <p className="truncate" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                        ₦{(effectivePrice(item) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                    {/* Discount tags */}
                    {promoApplied && (
                      <div className="flex gap-1 mt-1.5">
                        <span style={{ fontSize: '8px', fontWeight: 800, color: '#FFF', background: '#E8430A', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          15% off
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0 0 14px 0' }} />

            {/* Totals */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sub-total</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>₦{subtotal.toLocaleString()}</span>
              </div>
              {itemSavings > 0 && (
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '12px', color: '#2D6A4F' }}>Item savings</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2D6A4F' }}>-₦{itemSavings.toLocaleString()}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '12px', color: '#2D6A4F' }}>Discount</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2D6A4F' }}>-₦{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Delivery</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '12px 0' }} />

            <div className="flex items-center justify-between">
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
