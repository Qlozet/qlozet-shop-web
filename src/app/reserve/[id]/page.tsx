'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  AlertTriangle,
  Loader2,
  LogIn,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  Guest reservation page (/reserve/:id) — the link an organizer
//  shares with their event guests. Public to view; claiming needs a
//  signed-in account (the claim creates an order + Paystack charge).
// ═══════════════════════════════════════════════════════════════

export default function ReservationPage() {
  const { fmt: fmtMoney, currency } = useCurrency();
  const { user } = useApp();
  const params = useParams();
  const reservationId = params.id as string;

  const [raw, setRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedYards, setSelectedYards] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // ── Delivery (optional) ── most guests want their yards shipped rather
  // than collected at the event. Pickup stays the default (free).
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [quote, setQuote] = useState<{ request_token: string; rates: any[] } | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Load saved addresses once the guest opts into delivery.
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !user || addresses.length > 0) return;
    api
      .get('/users/customer/addresses')
      .then((res) => {
        const d = res.data?.data ?? res.data;
        const list = Array.isArray(d) ? d : d ? [d] : [];
        setAddresses(list);
        const def = list.find((a: any) => a.is_default) || list[0];
        if (def) setSelectedAddressId(def._id || def.id);
      })
      .catch(() => setAddresses([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod, user]);

  // Quote couriers whenever delivery is on and address/yards settle (debounced).
  useEffect(() => {
    if (deliveryMethod !== 'delivery' || !user || !selectedAddressId || selectedYards <= 0) {
      return;
    }
    let cancelled = false;
    setQuoting(true);
    setQuoteError(null);
    const t = setTimeout(() => {
      api
        .post(`/reservations/${reservationId}/claim-preview`, {
          yards: selectedYards,
          address_id: selectedAddressId,
        })
        .then((res) => {
          if (cancelled) return;
          const d = res.data?.data ?? res.data;
          if (d?.request_token && Array.isArray(d?.rates) && d.rates.length > 0) {
            setQuote({ request_token: d.request_token, rates: d.rates });
            // Auto-select the cheapest rate.
            const cheapest = d.rates.reduce((a: any, b: any) =>
              a.rate_amount <= b.rate_amount ? a : b,
            );
            setSelectedCourier(cheapest);
          } else {
            setQuote(null);
            setSelectedCourier(null);
            setQuoteError('No couriers available for this address right now.');
          }
        })
        .catch((err: any) => {
          if (cancelled) return;
          setQuote(null);
          setSelectedCourier(null);
          setQuoteError(
            err?.response?.data?.message || 'Could not load delivery rates.',
          );
        })
        .finally(() => {
          if (!cancelled) setQuoting(false);
        });
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod, selectedAddressId, selectedYards, user, reservationId]);

  // Fetch reservation details (public guest link)
  useEffect(() => {
    if (!reservationId) return;
    let cancelled = false;
    setLoading(true);
    api
      .get(`/reservations/${reservationId}`)
      .then((res) => {
        // Envelope walk: newer backends return { reservation, progress, … }
        // directly under data; older ones double-nest it under data.data.
        const d = res.data?.data;
        const payload = d?.reservation ? d : (d?.data?.reservation ? d.data : d);
        if (!cancelled) {
          if (payload?.reservation) setRaw(payload);
          else setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  // Normalize the backend shape into the fields the UI uses
  const rsv = raw?.reservation;
  const progress = raw?.progress;
  const fabricProduct = rsv?.fabric;
  const fabricSub = fabricProduct?.fabric;
  const pickUrl = (imgs: any): string | undefined => {
    const first = imgs?.[0];
    return typeof first === 'string' ? first : first?.url;
  };
  const reservation = rsv
    ? {
        id: rsv._id as string,
        fabricId: (fabricProduct?._id as string) ?? '',
        fabricName: fabricSub?.name ?? 'Fabric',
        fabricPrice: rsv.price_per_yard ?? fabricSub?.price_per_yard ?? 0,
        minCut: Math.max(1, Math.ceil(Number(fabricSub?.min_cut) || 1)),
        fabricImage:
          pickUrl(fabricSub?.images) ??
          pickUrl(fabricProduct?.images) ??
          '/image/bespoke-agbada-orange.webp',
        eventName: rsv.event_name ?? 'Event',
        organizerName:
          rsv.organizer?.full_name || rsv.organizer?.username || 'Organizer',
        totalYards: progress?.total_yards ?? rsv.total_yards ?? 0,
        claimedYards: progress?.claimed_yards ?? rsv.claimed_yards ?? 0,
        guestCount: raw?.guest_count ?? 0,
        deadline: rsv.deadline,
        status: rsv.status as string,
        feePaid: rsv.fee_paid !== false,
      }
    : null;

  const remainingYards = reservation
    ? Math.max(0, reservation.totalYards - reservation.claimedYards)
    : 0;

  // Default the picker once the data lands: a 6-yard asoebi bundle when there's
  // room, the fabric's minimum otherwise — always clamped to what's left.
  useEffect(() => {
    if (!reservation || selectedYards > 0) return;
    const start = Math.min(Math.max(6, reservation.minCut), remainingYards);
    setSelectedYards(Math.max(start, Math.min(reservation.minCut, remainingYards)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsv?._id]);

  // Countdown timer
  useEffect(() => {
    if (!reservation) return;
    const update = () => {
      const diff = new Date(reservation.deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rsv?._id, rsv?.deadline]);

  // Fee not yet settled — the backend self-heals a cleared-but-unflagged fee
  // on this very fetch, so this state only shows while payment is genuinely
  // outstanding (and the reservation auto-cancels if it never completes).
  const isPendingActivation =
    raw?.is_pending_activation ??
    (reservation?.status === 'active' && reservation?.feePaid === false);
  const isCancelled = raw?.is_cancelled || reservation?.status === 'cancelled';
  const isExpired = reservation
    ? raw?.is_expired ||
      new Date(reservation.deadline).getTime() < Date.now() ||
      reservation.status === 'expired'
    : false;
  const isCompleted = raw?.is_sold_out || reservation?.status === 'completed';
  const progressPercent =
    reservation && reservation.totalYards > 0
      ? (reservation.claimedYards / reservation.totalYards) * 100
      : 0;

  const minClaim = reservation ? Math.min(reservation.minCut, remainingYards) : 1;
  const canClaim =
    !isExpired && !isCompleted && !isCancelled && !isPendingActivation && remainingYards > 0;

  const wantsDelivery = deliveryMethod === 'delivery';
  const deliveryFee = wantsDelivery && selectedCourier ? selectedCourier.rate_amount : 0;
  const deliveryReady = !wantsDelivery || (!!selectedCourier && !!quote && !quoting);

  const handleClaim = async () => {
    if (!reservation || selectedYards > remainingYards || claiming || !deliveryReady) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await api.post(`/reservations/${reservation.id}/claim`, {
        yards: selectedYards,
        // Non-NGN display currency → Stripe where available (₦/Paystack fallback).
        ...(currency && currency !== 'NGN' ? { currency } : {}),
        ...(wantsDelivery && quote && selectedCourier
          ? {
              address_id: selectedAddressId,
              courier: {
                request_token: quote.request_token,
                courier_id: String(selectedCourier.courier_id),
                service_code: selectedCourier.service_code,
              },
            }
          : {}),
      });
      const d = res.data?.data ?? res.data;
      // The payment initializer names the link `paymentUrl`.
      const paymentUrl =
        d?.payment?.paymentUrl ??
        d?.payment?.authorization_url ??
        d?.authorization_url ??
        d?.paymentUrl;
      if (paymentUrl) {
        // Stash the reservation so /payment/verify shows a claim confirmation
        // (and does NOT clear the shopper's unrelated cart) when Paystack
        // returns the guest there.
        try {
          sessionStorage.setItem('pending_claim_reservation_id', reservation.id);
        } catch {
          /* storage unavailable — verify page falls back to generic copy */
        }
        window.location.href = paymentUrl;
        return;
      }
      setClaimError('Could not start the payment. Please try again.');
    } catch (err: any) {
      setClaimError(
        err?.response?.data?.message || err?.message || 'Could not claim. Please try again.',
      );
    } finally {
      setClaiming(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    borderRadius: '24px',
    border: '1px solid var(--border-glass)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ padding: '40px 20px', gap: '16px' }}
      >
        <Loader2 size={36} color="var(--brand-brown)" className="animate-spin" />
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading reservation…</p>
      </div>
    );
  }

  // ── Not Found State ──
  if (notFound || !reservation) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ padding: '40px 20px', gap: '16px' }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: '64px', height: '64px', background: 'var(--bg-surface-elevated)' }}
        >
          <AlertTriangle size={28} color="var(--text-muted)" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Reservation Not Found
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
          This reservation link is invalid or has been removed.
        </p>
        <Link
          href="/"
          className="transition-all hover:opacity-90"
          style={{ marginTop: '8px', padding: '13px 32px', borderRadius: '100px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 100px' }}>

        {/* Back Link */}
        <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-70" style={{ gap: '6px', padding: '20px 0 16px', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Back</span>
        </Link>

        {/* ── Hero Card ── */}
        <div style={cardStyle}>
          {/* Fabric Image */}
          <div className="relative w-full" style={{ aspectRatio: '16/9', background: 'var(--bg-surface-elevated)' }}>
            <Image
              src={reservation.fabricImage}
              alt={reservation.fabricName}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
            {/* Event badge — fixed white on the photo overlay in both themes */}
            <div className="absolute bottom-4 left-4 right-4">
              <p style={{ fontSize: '10px', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Fabric Reservation
              </p>
              <p style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.2, color: '#FFFFFF' }}>{reservation.eventName}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                Hosted by {reservation.organizerName}
              </p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '20px 24px 24px' }}>
            {/* Fabric Info */}
            <Link
              href={`/products/${reservation.fabricId}`}
              className="flex items-center transition-opacity hover:opacity-80"
              style={{ gap: '12px', marginBottom: '20px', textDecoration: 'none' }}
            >
              <div className="relative flex-shrink-0 rounded-[10px] overflow-hidden" style={{ width: '48px', height: '48px', background: 'var(--bg-surface-elevated)' }}>
                <Image src={reservation.fabricImage} alt="" fill style={{ objectFit: 'cover' }} sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{reservation.fabricName}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{fmtMoney(reservation.fabricPrice)} per yard</p>
              </div>
            </Link>

            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {reservation.claimedYards} of {reservation.totalYards} yards claimed
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: progressPercent >= 100 ? '#059669' : '#D4AF37' }}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full rounded-full" style={{ height: '10px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, progressPercent)}%`,
                    background: progressPercent >= 100
                      ? 'linear-gradient(90deg, #065F46, #059669)'
                      : 'linear-gradient(90deg, #D4AF37, #F0C040)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{remainingYards} yards remaining</span>
                <div className="flex items-center" style={{ gap: '4px' }}>
                  <Users size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {reservation.guestCount} guest{reservation.guestCount === 1 ? '' : 's'} claimed
                  </span>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div
              className="flex items-center rounded-[14px]"
              style={{
                gap: '10px',
                padding: '14px',
                background: isExpired || isCancelled ? 'rgba(239,68,68,0.06)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${isExpired || isCancelled ? 'rgba(239,68,68,0.2)' : 'var(--border-glass)'}`,
              }}
            >
              {isExpired || isCancelled ? (
                <AlertTriangle size={18} color="#EF4444" />
              ) : (
                <Clock size={18} color="#D4AF37" />
              )}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: isExpired || isCancelled ? '#EF4444' : 'var(--text-primary)' }}>
                  {isCancelled ? 'Reservation Cancelled' : isExpired ? 'Reservation Expired' : `Ends in ${timeLeft}`}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <CalendarDays size={11} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                  Deadline: {new Date(reservation.deadline).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Claim Section ── */}
        {canClaim && (
          <div style={{ ...cardStyle, marginTop: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px' }}>
              Claim Your Fabric
            </h3>

            {/* Yards selector — steps by the yard, floored at the fabric's
                minimum cut, capped at what's left (the last short cut is
                claimable instead of stranded). */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', marginBottom: '8px' }}
            >
              <button
                onClick={() => setSelectedYards((y) => Math.max(minClaim, y - 1))}
                disabled={selectedYards <= minClaim}
                aria-label="Fewer yards"
                className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-35"
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
              >
                <Minus size={16} color="var(--text-primary)" />
              </button>
              <div className="flex flex-col items-center">
                <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>{selectedYards}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>yards</span>
              </div>
              <button
                onClick={() => setSelectedYards((y) => Math.min(remainingYards, y + 1))}
                disabled={selectedYards >= remainingYards}
                aria-label="More yards"
                className="flex items-center justify-center transition-all active:scale-90 disabled:opacity-35"
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
              >
                <Plus size={16} color="var(--text-primary)" />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Minimum cut: {reservation.minCut} yd
            </p>

            {/* ── Delivery method ── */}
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              How do you want your fabric?
            </span>
            <div className="flex flex-col" style={{ gap: '8px', marginBottom: '16px' }}>
              {([
                { key: 'pickup', title: 'Pick up at the event', sub: 'The organizer hands you your yards — free' },
                { key: 'delivery', title: 'Deliver to me', sub: 'A courier ships your cut to your address' },
              ] as const).map(({ key, title, sub }) => {
                const active = deliveryMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDeliveryMethod(key)}
                    className="w-full flex items-center text-left transition-all"
                    style={{ gap: '10px', padding: '12px 14px', borderRadius: '12px', border: active ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)', background: active ? 'var(--bg-surface-elevated)' : 'var(--bg-base)', cursor: 'pointer' }}
                  >
                    <span className="flex-1 min-w-0">
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>
                    </span>
                    <span aria-hidden style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: active ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)' }} />
                  </button>
                );
              })}
            </div>

            {/* ── Delivery details ── */}
            {wantsDelivery && (
              <div style={{ marginBottom: '16px' }}>
                {!user ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sign in below to choose a delivery address.</p>
                ) : addresses.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    No saved delivery address —{' '}
                    <Link href="/profile?tab=address-book" style={{ color: 'var(--brand-brown)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      add one in your address book
                    </Link>{' '}
                    and come back to this link.
                  </p>
                ) : (
                  <>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Deliver to
                    </span>
                    <div className="flex flex-col" style={{ gap: '6px', marginBottom: '12px' }}>
                      {addresses.map((a) => {
                        const id = a._id || a.id;
                        const active = id === selectedAddressId;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedAddressId(id)}
                            className="w-full flex items-center text-left transition-all"
                            style={{ gap: '10px', padding: '10px 12px', borderRadius: '10px', border: active ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer' }}
                          >
                            <span className="flex-1 min-w-0">
                              <span className="truncate" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {a.label || a.full_name || 'Address'}
                              </span>
                              <span className="truncate" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                                {a.address}{a.city ? `, ${a.city}` : ''}{a.state ? `, ${a.state}` : ''}
                              </span>
                            </span>
                            <span aria-hidden style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, border: active ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)' }} />
                          </button>
                        );
                      })}
                    </div>

                    {quoting && (
                      <div className="flex items-center" style={{ gap: '8px', padding: '8px 0' }}>
                        <Loader2 size={14} color="var(--brand-brown)" className="animate-spin" />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Getting delivery rates…</span>
                      </div>
                    )}
                    {quoteError && !quoting && (
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', margin: '4px 0 8px' }}>{quoteError}</p>
                    )}
                    {!quoting && quote && quote.rates.length > 0 && (
                      <div className="flex flex-col" style={{ gap: '6px' }}>
                        {quote.rates.map((rate: any) => {
                          const active =
                            selectedCourier &&
                            selectedCourier.courier_id === rate.courier_id &&
                            selectedCourier.service_code === rate.service_code;
                          return (
                            <button
                              key={`${rate.courier_id}-${rate.service_code}`}
                              type="button"
                              onClick={() => setSelectedCourier(rate)}
                              className="w-full flex items-center justify-between text-left transition-all"
                              style={{ gap: '8px', padding: '10px 12px', borderRadius: '10px', border: active ? '2px solid #064E3B' : '1px solid var(--border-glass)', background: active ? 'rgba(6,78,59,0.05)' : 'var(--bg-surface-elevated)', cursor: 'pointer' }}
                            >
                              <span className="min-w-0">
                                <span className="truncate" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{rate.courier_name}</span>
                                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>{rate.delivery_eta_time || rate.delivery_eta || ''}</span>
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0 }}>{fmtMoney(rate.rate_amount)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Price */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-glass)', marginBottom: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Fabric ({selectedYards} yd)</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{fmtMoney(reservation.fabricPrice * selectedYards)}</span>
              </div>
              {wantsDelivery && (
                <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Delivery</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedCourier ? fmtMoney(deliveryFee) : '—'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {fmtMoney(reservation.fabricPrice * selectedYards + deliveryFee)}
                </span>
              </div>
            </div>

            {claimError && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', textAlign: 'center' }}>
                {claimError}
              </div>
            )}

            {/* Claim / Sign-in CTA — claiming charges the guest via Paystack,
                so it needs an account. */}
            {user ? (
              <button
                onClick={handleClaim}
                disabled={selectedYards > remainingYards || selectedYards < minClaim || claiming || !deliveryReady}
                className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ padding: '16px', borderRadius: '14px', background: '#064E3B', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: claiming ? 'wait' : 'pointer', gap: '8px' }}
              >
                {claiming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Starting payment…
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Claim &amp; Pay
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none', gap: '8px' }}
              >
                <LogIn size={16} />
                Sign in to claim
              </Link>
            )}
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', lineHeight: 1.6 }}>
              You pay for your yards now; they&apos;re held under {reservation.eventName}.
            </p>
          </div>
        )}

        {/* ── Awaiting activation (fee still settling) ── */}
        {isPendingActivation && (
          <div className="flex flex-col items-center" style={{ ...cardStyle, marginTop: '16px', padding: '32px 24px', gap: '12px' }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: 'rgba(180,83,10,0.1)' }}>
              <Clock size={26} color="#B4530A" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Almost Ready</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
              The organizer is completing this reservation&apos;s setup. Check back in a moment — your yards aren&apos;t going anywhere yet.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="transition-all hover:opacity-90"
              style={{ marginTop: '4px', padding: '13px 32px', borderRadius: '100px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
            >
              Refresh
            </button>
          </div>
        )}

        {/* ── Ended States ── */}
        {!canClaim && !isPendingActivation && (
          <div className="flex flex-col items-center" style={{ ...cardStyle, marginTop: '16px', padding: '32px 24px', gap: '12px' }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: '56px', height: '56px', background: isCompleted ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.08)' }}
            >
              {isCompleted
                ? <Check size={28} color="#059669" strokeWidth={3} />
                : <AlertTriangle size={26} color="#EF4444" />
              }
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isCompleted ? 'Fully Claimed!' : isCancelled ? 'Reservation Cancelled' : 'Reservation Ended'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
              {isCompleted
                ? 'All yards have been claimed for this event.'
                : isCancelled
                  ? 'The organizer cancelled this reservation. Unclaimed yards were returned to stock.'
                  : 'This reservation has expired. Unclaimed yards have been returned to stock.'}
            </p>
            <Link
              href="/products"
              className="transition-all hover:opacity-90"
              style={{ marginTop: '4px', padding: '13px 32px', borderRadius: '100px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}
            >
              Browse Fabrics
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
