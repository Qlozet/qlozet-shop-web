'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// ═══════════════════════════════════════════════════════════════
//  Single payment confirmation page.
//  Every payment — card (Paystack popup) and wallet — lands here with
//  a ?reference=. It polls the transaction until the outcome is known
//  (the webhook finalizes card payments server-side; wallet ones are
//  already successful), then shows a clean result. No order timeline.
// ═══════════════════════════════════════════════════════════════

type Status = 'verifying' | 'success' | 'failed';

// Brand tokens (shared with the profile / orders redesign).
const INK = 'var(--text-primary)';
const BROWN = '#462814';
const MUTE = 'var(--text-secondary)';
const GOOD = '#0F6E4F';

function PaymentVerifyInner() {
  const params = useSearchParams();
  const { clearCart } = useApp();
  const reference = params.get('reference') || params.get('trxref') || '';
  const [status, setStatus] = useState<Status>('verifying');
  // Runs the success cleanup (clear cart, confetti) EXACTLY once. clearCart is
  // not a stable reference and mutates cart state, so without this guard the
  // effect re-fires on every render and spams DELETE /cart/clear (→ 429s).
  const handled = useRef(false);

  // A reservation the organizer just paid the fee for (stashed before redirect)
  const [reservationId, setReservationId] = useState<string | null>(null);
  // A guest's fabric CLAIM payment (stashed on /reserve/:id before redirect) —
  // not a cart checkout, so the cart must be left alone.
  const [claimReservationId, setClaimReservationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReservationId(sessionStorage.getItem('pending_reservation_id'));
      setClaimReservationId(sessionStorage.getItem('pending_claim_reservation_id'));
    }
  }, []);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        // Actively verify + finalize (confirms the charge with Paystack and
        // records the order server-side) rather than waiting on the webhook.
        // Idempotent, and safe for wallet refs too (it reports their status
        // without hitting Paystack).
        const res = await api.post(`/webhook/verify/${reference}`);
        const data = res.data?.data ?? res.data;
        const s = data?.status;
        if (cancelled) return;
        if (data?.success === true || s === 'success') {
          setStatus('success');
          return;
        }
        if (s === 'failed' || s === 'reversed') {
          setStatus('failed');
          return;
        }
      } catch {
        /* keep trying — Paystack settlement may lag a moment */
      }
      if (cancelled) return;
      if (attempts++ < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        // Still not settled — the webhook will finalize it if it lands later.
        setStatus('failed');
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  // On confirmed payment: clear the stashed reservation id, celebrate once, and
  // — for a checkout payment (not a reservation) — clear the cart that survived
  // the payment round-trip so the customer isn't left with the just-paid items.
  useEffect(() => {
    if (status !== 'success' || handled.current || typeof window === 'undefined') return;
    handled.current = true;
    sessionStorage.removeItem('pending_reservation_id');
    sessionStorage.removeItem('pending_claim_reservation_id');
    // Only a CART checkout clears the cart — reservation fees and guest fabric
    // claims are standalone payments that must not wipe an unrelated cart.
    if (!reservationId && !claimReservationId) {
      clearCart();
      sessionStorage.removeItem('qlozet_checkout_preview');
    }
    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.55 },
      colors: [BROWN, '#8A5A2B', '#D4AF37', GOOD, '#FFFFFF'],
    });
  }, [status, reservationId, claimReservationId, clearCart]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: '48px 20px' }}
    >
      <div
        className="w-full flex flex-col items-center text-center"
        style={{
          maxWidth: '400px',
          gap: '20px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-glass)',
          borderRadius: '24px',
          padding: '40px 28px',
          boxShadow: '0 8px 40px rgba(70,40,20,0.06)',
        }}
      >
        {status === 'verifying' && (
          <>
            <Spinner />
            <Heading>Confirming payment…</Heading>
            <Body>Hang tight — this usually takes a few seconds.</Body>
          </>
        )}

        {status === 'success' && (
          <>
            <Badge tone="good">
              <Check size={34} color="#FFFFFF" strokeWidth={3} />
            </Badge>
            <Heading>Payment confirmed</Heading>
            <Body>
              {reservationId
                ? 'Your fabric reservation is active — share the link with your guests.'
                : claimReservationId
                  ? 'Your fabric is claimed! Your yards are secured under this event.'
                  : 'Thank you! Your payment was successful and your order is on its way to the vendor.'}
            </Body>
            {reference && <Ref value={reference} />}
            <Actions>
              {reservationId ? (
                <PrimaryLink href={`/reserve/${reservationId}`}>View reservation</PrimaryLink>
              ) : claimReservationId ? (
                <PrimaryLink href={`/reserve/${claimReservationId}`}>Back to reservation</PrimaryLink>
              ) : (
                <PrimaryLink href="/profile?tab=orders">View orders</PrimaryLink>
              )}
              <GhostLink href="/products">Continue shopping</GhostLink>
            </Actions>
          </>
        )}

        {status === 'failed' && (
          <>
            <Badge tone="bad">
              <X size={34} color="#FFFFFF" strokeWidth={3} />
            </Badge>
            <Heading>Payment not confirmed</Heading>
            <Body>
              We couldn&apos;t confirm your payment yet. If you were charged it may still be
              processing — check your orders shortly. Otherwise you can try again.
            </Body>
            {reference && <Ref value={reference} />}
            <Actions>
              {claimReservationId ? (
                <PrimaryLink href={`/reserve/${claimReservationId}`}>Back to reservation</PrimaryLink>
              ) : (
                <PrimaryLink href="/cart">Back to cart</PrimaryLink>
              )}
              <GhostLink href="/">Home</GhostLink>
            </Actions>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Presentational atoms ─────────────────────────────────────
function Spinner() {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{ width: '68px', height: '68px', background: 'rgba(70,40,20,0.06)' }}
    >
      <Loader2 size={34} color="var(--brand-fill)" className="animate-spin" />
    </div>
  );
}

function Badge({ tone, children }: { tone: 'good' | 'bad'; children: React.ReactNode }) {
  const bg = tone === 'good' ? GOOD : '#C0362C';
  const halo = tone === 'good' ? 'rgba(15,110,79,0.14)' : 'rgba(192,54,44,0.14)';
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{ width: '72px', height: '72px', background: bg, boxShadow: `0 0 0 8px ${halo}` }}
    >
      {children}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontSize: '22px', fontWeight: 800, color: INK, letterSpacing: '-0.01em', margin: 0 }}>
      {children}
    </h1>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '13.5px', color: MUTE, lineHeight: 1.6, margin: 0, maxWidth: '320px' }}>
      {children}
    </p>
  );
}

function Ref({ value }: { value: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '100px',
        background: 'var(--bg-surface-elevated)',
        fontSize: '11px',
        fontWeight: 700,
        color: MUTE,
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ textTransform: 'uppercase' }}>Ref</span>
      <span style={{ fontFamily: 'monospace', color: INK }}>{value}</span>
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full" style={{ gap: '10px', marginTop: '4px' }}>
      {children}
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex-1 flex items-center justify-center transition-opacity hover:opacity-90"
      style={{
        padding: '13px 20px',
        borderRadius: '14px',
        background: 'var(--brand-fill)',
        color: 'var(--brand-fill-text)',
        fontSize: '13px',
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex-1 flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
      style={{
        padding: '13px 20px',
        borderRadius: '14px',
        border: '1px solid var(--border-glass)',
        color: INK,
        fontSize: '13px',
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={38} className="animate-spin" color="var(--brand-fill)" />
        </div>
      }
    >
      <PaymentVerifyInner />
    </Suspense>
  );
}
