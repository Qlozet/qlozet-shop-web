'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { productCatalog } from '@/data/products';
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  ShoppingBag,
  Heart,
  Pen,
} from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, toggleWishlist, wishlist } = useApp();

  // Collapsible sections
  const [showPremiere, setShowPremiere] = useState(false);
  const [showLooking, setShowLooking] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 100000 || subtotal === 0 ? 0 : 5000;

  // Suggested products (not in cart)
  const cartIds = cart.map((c) => c.id);
  const suggestedProducts = productCatalog
    .filter((p) => !cartIds.includes(p.id))
    .slice(0, 4);

  // "Looking for this?" — random product not in cart
  const lookingProduct = productCatalog.find((p) => !cartIds.includes(p.id) && p.tag === 'CUSTOMIZABLE');

  // ─── Card style ─────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid rgba(0,0,0,0.04)',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
  };

  // ─── Empty Cart ─────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="flex flex-col gap-6 py-4 lg:py-8 animate-fade-in">
        <h1
          className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
          style={{ fontSize: '22px' }}
        >
          My Cart
        </h1>
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 24px', gap: '16px' }}>
          <div className="flex items-center justify-center" style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5F0EB' }}>
            <ShoppingBag size={28} color="#462814" strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', fontFamily: 'var(--font-display)' }}>
            Your cart is empty
          </h3>
          <p style={{ fontSize: '14px', color: '#999', maxWidth: '300px', lineHeight: 1.6 }}>
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
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
        style={{ fontSize: '22px' }}
      >
        My Cart
      </h1>

      {/* ─── Two-Column Layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start max-w-[900px] mx-auto w-full">

        {/* ══════ LEFT COLUMN — cart items + sections ══════ */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* ── Cart Items Card ────────────────────────────────── */}
          <div style={cardStyle}>
            {cart.map((item, idx) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative flex-shrink-0 rounded-xl overflow-hidden bg-[#F5F5F5]"
                    style={{ width: '100px', height: '120px' }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }} className="truncate">{item.title}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>
                      ₦{item.price.toLocaleString()}
                    </span>

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
                        className="flex items-center gap-1.5 transition-colors hover:bg-gray-50"
                        style={{
                          padding: '5px 14px',
                          borderRadius: '6px',
                          border: '1px solid #E0E0E0',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#1A1A1A',
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
                        className="flex items-center gap-1.5 transition-colors hover:opacity-90"
                        style={{
                          padding: '5px 14px',
                          borderRadius: '6px',
                          background: '#462814',
                          border: 'none',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={9} fill={wishlist.includes(item.id) ? 'white' : 'none'} />
                        + Wishlist
                      </button>
                    </div>
                  </div>
                </div>

                {/* Divider between items */}
                {idx < cart.length - 1 && (
                  <div style={{ height: '1px', background: '#F2F2F2', margin: '20px 0' }} />
                )}
              </div>
            ))}
          </div>

          {/* ── QLOZET PREMIERE AFRICA ─────────────────────────── */}
          <div style={cardStyle}>
            <button
              onClick={() => setShowPremiere(!showPremiere)}
              className="w-full flex items-center justify-between"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#462814' }}
                >
                  <span style={{ color: '#D4AF37', fontWeight: 800, fontSize: '11px', fontFamily: 'var(--font-display)' }}>Q</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Qlozet Premiere Africa
                </h3>
              </div>
              {showPremiere ? <ChevronUp size={16} color="#BBB" /> : <ChevronDown size={16} color="#BBB" />}
            </button>

            {showPremiere && (
              <div className="animate-fade-in" style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.7, marginBottom: '16px' }}>
                  Get unlimited Next Day Delivery for only ₦10,000 a year. Minimum spend per order applies.
                </p>
                <button
                  className="transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: '#462814',
                    color: '#FFFFFF',
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

          {/* ── LOOKING FOR THIS? ──────────────────────────────── */}
          {lookingProduct && (
            <div style={cardStyle}>
              <button
                onClick={() => setShowLooking(!showLooking)}
                className="w-full flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Looking for this ?
                </h3>
                {showLooking ? <ChevronUp size={16} color="#BBB" /> : <ChevronDown size={16} color="#BBB" />}
              </button>

              {showLooking && (
                <div className="animate-fade-in" style={{ marginTop: '16px', maxWidth: '180px' }}>
                  <ProductCard
                    id={lookingProduct.id}
                    imageUrl={lookingProduct.image}
                    title={lookingProduct.title}
                    brand={lookingProduct.brand}
                    price={lookingProduct.price}
                    tag={lookingProduct.tag}
                    isFavorite={wishlist.includes(lookingProduct.id)}
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
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Suggested for you
              </h3>
              {showSuggested ? <ChevronUp size={16} color="#BBB" /> : <ChevronDown size={16} color="#BBB" />}
            </button>

            {showSuggested && (
              <div className="animate-fade-in hide-scrollbar flex overflow-x-auto gap-3 mt-4" style={{ paddingBottom: '4px' }}>
                {suggestedProducts.map((p) => (
                  <div key={p.id} style={{ minWidth: '150px', maxWidth: '170px', flexShrink: 0 }}>
                    <ProductCard
                      id={p.id}
                      imageUrl={p.image}
                      title={p.title}
                      brand={p.brand}
                      price={p.price}
                      tag={p.tag}
                      isFavorite={wishlist.includes(p.id)}
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
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              Total
            </h3>

            {/* Sub-total */}
            <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Sub-total</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>₦{subtotal.toLocaleString()}</span>
            </div>

            {/* Delivery */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '13px', color: '#666' }}>Delivery</span>
                <Info size={12} color="#CCC" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
              </span>
            </div>

            <div style={{ height: '1px', background: '#F0F0F0', margin: '0 0 14px 0' }} />

            {/* Delivery Type Selector */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E5E5E5',
                marginBottom: '18px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A' }}>Standard Delivery</span>
              <ChevronDown size={13} color="#999" />
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: '13px',
                borderRadius: '10px',
                background: '#2D6A4F',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                marginBottom: '14px',
              }}
            >
              Check Out
            </Link>

            {/* Payment Icons */}
            <div className="flex items-center justify-center gap-2.5">
              {/* Mastercard */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" fill="#EB001B" opacity="0.9"/>
                  <circle cx="13" cy="7" r="5.5" fill="#F79E1B" opacity="0.9"/>
                  <path d="M10 2.5a5.5 5.5 0 010 9 5.5 5.5 0 000-9z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* Visa */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
              </div>
              {/* Apple Pay */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', fontWeight: 700, color: '#1A1A1A' }}> Pay</span>
              </div>
              {/* Google Pay */}
              <div style={{ width: '34px', height: '22px', borderRadius: '4px', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', fontWeight: 700, color: '#4285F4' }}>G Pay</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
