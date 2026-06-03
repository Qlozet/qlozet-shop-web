'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ChevronUp,
  ChevronDown,
  Info,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type PromoTab = 'promo' | 'voucher' | 'rewards';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, user } = useApp();

  // Promo section
  const [showPromo, setShowPromo] = useState(true);
  const [promoTab, setPromoTab] = useState<PromoTab>('promo');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Delivery address
  const [deliveryName] = useState(user?.name || 'Guest User');
  const [deliveryAddress] = useState({
    line1: '13c Hallen Estate',
    area: 'Abuja',
    state: 'FCT',
    zip: '900001',
    country: 'Nigeria',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | null>(null);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = promoApplied ? Math.round(subtotal * 0.15) : 0;
  const shipping = subtotal > 100000 ? 0 : 5000;
  const total = subtotal - discount + shipping;

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.toUpperCase() === '2773672') {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleBuyNow = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF2E63', '#FF6B8B', '#D4AF37', '#4A2306', '#FFFFFF'],
      });
    }, 2500);
  };

  // Card style
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '16px',
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
    const orderNumber = `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
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
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>₦{total.toLocaleString()}</span>
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

          {/* ── DELIVERY OPTIONS ───────────────────────────────── */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={sectionTitle}>Delivery Options</h3>
              <Info size={16} color="#CCC" />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
              </span>
              <span style={{ fontSize: '13px', color: '#777', marginLeft: '12px' }}>Standard Delivery</span>
            </div>

            <div className="flex items-start gap-2" style={{ padding: '12px 14px', borderRadius: '10px', background: '#FAFAFA' }}>
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
              onClick={() => setPaymentMethod('card')}
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

            {/* PayPal Button */}
            <button
              onClick={() => setPaymentMethod('paypal')}
              className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: paymentMethod === 'paypal' ? '2px solid #462814' : 'none',
                background: '#2D6A4F',
                fontSize: '11px',
                fontWeight: 800,
                color: '#FFF',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '14px' }}>₱</span>
              Paypal
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
          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: '#2D6A4F',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(45,106,79,0.25)',
            }}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block' }} />
                Processing...
              </span>
            ) : (
              'Buy Now'
            )}
          </button>
        </div>

        {/* ══════ RIGHT COLUMN — Order Summary ══════ */}
        <div className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-6">
          <div style={{ ...cardStyle, padding: '20px' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
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
                        <p className="truncate" style={{ fontSize: '10px', color: '#AAA', marginTop: '2px' }}>{item.title}</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', flexShrink: 0 }}>
                        ₦{item.price.toLocaleString()}
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
