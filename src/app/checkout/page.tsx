'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useCheckout } from '@/hooks/useCheckout';
import { api } from '@/lib/api';
import type { CheckoutPreviewResponse } from '@/lib/api-types';
import {
  ChevronUp,
  ChevronDown,
  Info,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type PromoTab = 'promo' | 'voucher' | 'rewards';

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
          console.log('[Checkout] Raw address response:', JSON.stringify(res.data));
          
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
          
          console.log('[Checkout] Parsed address list:', addressList.length, 'addresses');
          
          if (addressList.length > 0) {
            const defaultAddr = addressList.find((addr: any) => addr.is_default) || addressList[0];
            console.log('[Checkout] Using address:', JSON.stringify(defaultAddr));
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
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  // Snapshot of the amount charged, captured BEFORE clearCart() empties the cart
  // (otherwise the confirmation total collapses to just the shipping fee).
  const [paidTotal, setPaidTotal] = useState(0);

  // Per-item breakdowns → total item-level discount savings (§11, informational;
  // the subtotal is already the discounted final).
  const [breakdowns, setBreakdowns] = useState<Record<string, any>>({});

  // Authoritative per-unit price: the server breakdown final (exactly what the
  // order will charge) when loaded, else the price stored at add-to-cart time.
  const effectivePrice = (item: { id: string; price: number }) =>
    breakdowns[item.id]?.final ?? item.price;

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
          if (!cancelled && b) setBreakdowns((prev) => ({ ...prev, [item.id]: b }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);
  const itemSavings = cart.reduce(
    (acc, item) => acc + (breakdowns[item.id]?.discount ?? 0) * item.quantity,
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

    if (result) {
      // Card payments hand off to Paystack inside placeOrder (a full-page
      // redirect), so success is only shown in-place for wallet payments. A
      // card order that reaches here without redirecting means no payment URL
      // came back — placeOrder returns null in that case, so we never show a
      // false "payment successful" for an unpaid card order.
      if (method === 'wallet') {
        setOrderRef(result.order?.reference || result.reference || `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`);
        setPaidTotal(total); // capture before clearCart() zeroes the cart-derived total
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
        sessionStorage.removeItem('qlozet_checkout_preview');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF2E63', '#FF6B8B', '#D4AF37', '#4A2306', '#FFFFFF'],
        });
      }
    } else {
      setIsProcessing(false);
    }
  };

  // Card style
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid rgba(0,0,0,0.04)',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 800,
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  // ─── Order Complete ─────────────────────────────────────────
  if (orderComplete) {
    const orderNumber = orderRef || `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const deliveryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const formattedDate = deliveryDate.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <div className="flex flex-col items-center gap-8 py-8 lg:py-12 animate-fade-in w-full" style={{ maxWidth: '560px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── Animated Checkmark ─────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center justify-center animate-slide-up"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)',
              boxShadow: '0 8px 32px rgba(45,106,79,0.3), 0 0 0 8px rgba(45,106,79,0.08)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <div className="text-center" style={{ marginTop: '4px' }}>
            <h2
              className="font-display"
              style={{ fontSize: '26px', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.01em', marginBottom: '6px' }}
            >
              Payment Confirmed
            </h2>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Thank you for shopping with Qlozet!
            </p>
          </div>
        </div>

        {/* ── Order Info Card ───────────────────────────────── */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.04)',
            padding: '28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Order number & date */}
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Order Number</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{orderNumber}</p>
            </div>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'rgba(45,106,79,0.08)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#2D6A4F',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Confirmed
            </div>
          </div>

          <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 20px' }} />

          {/* Estimated Delivery */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Estimated Delivery</p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{formattedDate}</p>
          </div>

          {/* Order Timeline */}
          <div className="flex items-center gap-0" style={{ marginBottom: '24px' }}>
            {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5" style={{ flex: i === 0 ? '0 0 auto' : undefined }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: i === 0 ? '#2D6A4F' : '#F0F0F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i === 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: i === 0 ? '#2D6A4F' : '#CCC', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {i < 3 && (
                  <div style={{ flex: 1, height: '2px', background: i === 0 ? '#2D6A4F' : '#F0F0F0', marginBottom: '18px' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 20px' }} />

          {/* Delivery Address */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Delivering to</p>
            <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{deliveryName}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, paddingLeft: '14px', margin: 0 }}>
              {deliveryAddress.line1}, {deliveryAddress.area}, {deliveryAddress.state} {deliveryAddress.zip}, {deliveryAddress.country}
            </p>
          </div>

          <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 20px' }} />

          {/* Total Paid */}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Paid</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>₦{(paidTotal || total).toLocaleString()}</span>
          </div>
        </div>

        {/* ── Confirmation Message ──────────────────────────── */}
        <div
          className="text-center"
          style={{
            padding: '20px 24px',
            borderRadius: '14px',
            background: 'rgba(45,106,79,0.04)',
            border: '1px solid rgba(45,106,79,0.1)',
            width: '100%',
          }}
        >
          <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>
            A confirmation email has been sent to <strong style={{ color: '#1A1A1A' }}>{user?.email || 'your email'}</strong>.
            You can track your order status from your profile.
          </p>
        </div>

        {/* ── Action Buttons ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: '#462814',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(70,40,20,0.2)',
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              color: '#1A1A1A',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── Empty Cart Redirect ────────────────────────────────────
  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in" style={{ padding: '80px 24px', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>No items to checkout</h2>
        <p style={{ fontSize: '14px', color: '#999' }}>Add items to your cart first.</p>
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
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
        style={{ fontSize: '22px' }}
      >
        Checkout
      </h1>

      {/* ─── Two-Column Layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start max-w-[900px] mx-auto w-full">

        {/* ══════ LEFT COLUMN ══════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* ── PROMO, VOUCHERS OR REWARD ─────────────────────── */}
          <div style={cardStyle}>
            <button
              onClick={() => setShowPromo(!showPromo)}
              className="w-full flex items-center justify-between"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <h3 style={sectionTitle}>Promo, Vouchers or Reward</h3>
              {showPromo ? <ChevronUp size={16} color="#BBB" /> : <ChevronDown size={16} color="#BBB" />}
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
                        border: '1px solid #E0E0E0',
                        borderRight: tab !== 'rewards' ? 'none' : '1px solid #E0E0E0',
                        background: promoTab === tab ? '#1A1A1A' : '#FFF',
                        color: promoTab === tab ? '#FFF' : '#1A1A1A',
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
                      border: '1px solid #E0E0E0',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="transition-all hover:bg-gray-100"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid #E0E0E0',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: '#FFF',
                      color: '#1A1A1A',
                      cursor: 'pointer',
                    }}
                  >
                    Change
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

                <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
                  have you been <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>referred by a friend</span>?
                </p>

                {/* Need to Know */}
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Need to Know
                </h4>
                <ul style={{ fontSize: '12px', color: '#777', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                  <li>You can only use one discount/promo code per order. This applies to our free-delivery codes, too.</li>
                  <li>Discount/promo codes cannot be used when buying gift vouchers.</li>
                </ul>
              </div>
            )}
          </div>

          {/* ── DELIVERY ADDRESS ───────────────────────────────── */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={sectionTitle}>Delivery Address</h3>
              <Info size={16} color="#CCC" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{deliveryName}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#777', lineHeight: 1.7, paddingLeft: '16px' }}>
                  <p style={{ margin: 0 }}>{deliveryAddress.line1}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.area}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.state}, {deliveryAddress.zip}</p>
                  <p style={{ margin: 0 }}>{deliveryAddress.country}</p>
                </div>
              </div>
              <button
                className="transition-all hover:bg-gray-100"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: '#FFF',
                  color: '#1A1A1A',
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
              <Truck size={16} color="#CCC" />
            </div>

            {checkout.loading && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #E5E5E5', borderTopColor: '#064E3B', borderRadius: '50%', display: 'inline-block' }} />
                <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>Loading shipping rates…</p>
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
                    {vendor.business_name}
                    <span style={{ fontSize: '10px', fontWeight: 400, color: '#999', marginLeft: '8px' }}>
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
                            : '1px solid #E5E5E5',
                          background: selected?.courier.courier_id === rate.courier_id
                            ? 'rgba(6,78,59,0.03)'
                            : '#FAFAFA',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {rate.courier_image && (
                            <Image src={rate.courier_image} alt="" width={20} height={20} style={{ borderRadius: '4px' }} />
                          )}
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{rate.courier_name}</div>
                            <div style={{ fontSize: '9px', color: '#999' }}>{rate.delivery_eta_time}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>
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
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#8B5A2B', marginBottom: '6px' }}>
                    Fabric Transfer
                    <span style={{ fontSize: '10px', fontWeight: 400, color: '#999', marginLeft: '8px' }}>
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
                            ? '2px solid #8B5A2B'
                            : '1px solid #E5E5E5',
                          background: selected?.courier.courier_id === rate.courier_id
                            ? 'rgba(139,90,43,0.03)'
                            : '#FAFAFA',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{rate.courier_name}</div>
                          <div style={{ fontSize: '9px', color: '#999' }}>{rate.delivery_eta_time}</div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>
                          ₦{rate.rate_amount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {!checkout.loading && shipping > 0 && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginTop: '8px' }}>
                Total Shipping: ₦{shipping.toLocaleString()}
              </div>
            )}

            <div className="flex items-start gap-2" style={{ padding: '12px 14px', borderRadius: '10px', background: '#FAFAFA', marginTop: '12px' }}>
              <AlertCircle size={14} color="#999" className="flex-shrink-0" style={{ marginTop: '2px' }} />
              <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.6, margin: 0 }}>
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
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Delivery Address
                </h4>
                <Info size={14} color="#CCC" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  {isLoadingAddress ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mt-2" />
                      <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ) : deliveryAddress.line1 ? (
                    <>
                      <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{deliveryName}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#777', lineHeight: 1.7, paddingLeft: '16px' }}>
                        <p style={{ margin: 0 }}>{deliveryAddress.line1}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.area}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.state}, {deliveryAddress.zip}</p>
                        <p style={{ margin: 0 }}>{deliveryAddress.country}</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', paddingLeft: '16px' }}>
                      No default address saved.
                    </div>
                  )}
                </div>
                <button
                  className="transition-all hover:bg-gray-100"
                  style={{
                    padding: '7px 18px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: '#FFF',
                    color: '#1A1A1A',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 20px 0' }} />

            {/* Payment Type */}
            <h4 className="text-center" style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Payment Type
            </h4>

            {/* Card Button */}
            <button
              onClick={() => { setPaymentMethod('card'); setPayError(''); }}
              className="w-full flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: paymentMethod === 'card' ? '2px solid #462814' : '1px solid #E0E0E0',
                background: '#FFF',
                fontSize: '11px',
                fontWeight: 800,
                color: '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              <CreditCard size={16} />
              Add Credit / Debit Card
            </button>

            <p className="text-center" style={{ fontSize: '12px', fontWeight: 700, color: '#999', margin: '0 0 12px 0' }}>OR</p>

            {/* Wallet Button */}
            <button
              onClick={() => { setPaymentMethod('wallet'); setPayError(''); }}
              className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: paymentMethod === 'wallet' ? '2px solid #462814' : 'none',
                background: '#064E3B',
                fontSize: '11px',
                fontWeight: 800,
                color: '#FFF',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '14px' }}>💳</span>
              Pay with Wallet
            </button>

            {/* Payment Icons */}
            <div className="flex items-center justify-center gap-2.5">
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" fill="#EB001B" opacity="0.9"/>
                  <circle cx="13" cy="7" r="5.5" fill="#F79E1B" opacity="0.9"/>
                  <path d="M10 2.5a5.5 5.5 0 010 9 5.5 5.5 0 000-9z" fill="#FF5F00"/>
                </svg>
              </div>
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
              </div>
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', fontWeight: 700, color: '#1A1A1A' }}> Pay</span>
              </div>
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', fontWeight: 700, color: '#4285F4' }}>G Pay</span>
              </div>
            </div>
          </div>

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
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {cart.reduce((acc, item) => acc + item.quantity, 0)} {cart.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'Item' : 'Items'}
              </h3>
              <Link href="/cart" style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.04em', textDecoration: 'none' }}>
                Edit
              </Link>
            </div>

            {/* Item List */}
            <div className="flex flex-col gap-3" style={{ marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]" style={{ width: '56px', height: '66px' }}>
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
                        <h4 className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{item.title}</h4>
                        <p className="truncate" style={{ fontSize: '10px', color: '#AAA', marginTop: '2px' }}>Qty: {item.quantity}</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', flexShrink: 0 }}>
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

            <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 14px 0' }} />

            {/* Totals */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '12px', color: '#777' }}>Sub-total</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>₦{subtotal.toLocaleString()}</span>
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
                <span style={{ fontSize: '12px', color: '#777' }}>Delivery</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>
                  {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{ height: '1px', background: '#F0F0F0', margin: '12px 0' }} />

            <div className="flex items-center justify-between">
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
