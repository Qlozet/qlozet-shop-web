'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════
//  Payment return page — Paystack redirects here after any payment
//  (checkout, reservation fee, guest claim). Polls the transaction
//  by reference and shows the result. The webhook is what actually
//  finalizes the payment server-side; this just reads the outcome.
// ═══════════════════════════════════════════════════════════════

type Status = 'verifying' | 'success' | 'failed';

function PaymentVerifyInner() {
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref') || '';
  const [status, setStatus] = useState<Status>('verifying');

  // A reservation the organizer just paid the fee for (stashed before redirect)
  const [reservationId, setReservationId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReservationId(sessionStorage.getItem('pending_reservation_id'));
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
        const res = await api.get(`/transactions/reference/${reference}`);
        const data = res.data?.data ?? res.data;
        const s = data?.status;
        if (cancelled) return;
        if (s === 'success') {
          setStatus('success');
          return;
        }
        if (s === 'failed' || s === 'reversed') {
          setStatus('failed');
          return;
        }
      } catch {
        /* keep polling — the webhook may still be processing */
      }
      if (cancelled) return;
      if (attempts++ < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        // Timed out while still pending — the webhook will still process it.
        setStatus('failed');
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  // Clear the stashed reservation id once we've shown success
  useEffect(() => {
    if (status === 'success' && typeof window !== 'undefined') {
      sessionStorage.removeItem('pending_reservation_id');
    }
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '18px', background: '#F8F9FA' }}>
      {status === 'verifying' && (
        <>
          <Loader2 size={44} color="#4C1D95" className="animate-spin" />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>Verifying payment…</h2>
          <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', maxWidth: '320px' }}>
            Hang tight — we&apos;re confirming your payment. This usually takes a few seconds.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex items-center justify-center rounded-full" style={{ width: '72px', height: '72px', background: '#ECFDF5' }}>
            <CheckCircle2 size={40} color="#065F46" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A' }}>Payment confirmed</h2>
          <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', maxWidth: '320px' }}>
            {reservationId
              ? 'Your fabric reservation is active. Share the link with your guests.'
              : 'Thank you! Your payment was successful.'}
          </p>
          <div className="flex items-center" style={{ gap: '10px', marginTop: '4px' }}>
            {reservationId ? (
              <Link href={`/reserve/${reservationId}`} style={{ padding: '12px 24px', borderRadius: '14px', background: '#064E3B', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                View reservation
              </Link>
            ) : (
              <Link href="/orders" style={{ padding: '12px 24px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                View orders
              </Link>
            )}
            <Link href="/" style={{ padding: '12px 24px', borderRadius: '14px', background: '#F4F4F4', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Continue shopping
            </Link>
          </div>
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="flex items-center justify-center rounded-full" style={{ width: '72px', height: '72px', background: '#FEF2F2' }}>
            <XCircle size={40} color="#DC2626" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A' }}>Payment not confirmed</h2>
          <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', maxWidth: '340px' }}>
            We couldn&apos;t confirm your payment yet. If you were charged, it may still be processing —
            check your orders shortly. Otherwise you can try again.
          </p>
          <div className="flex items-center" style={{ gap: '10px', marginTop: '4px' }}>
            <Link href="/cart" style={{ padding: '12px 24px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Back to cart
            </Link>
            <Link href="/" style={{ padding: '12px 24px', borderRadius: '14px', background: '#F4F4F4', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={40} className="animate-spin" color="#4C1D95" />
        </div>
      }
    >
      <PaymentVerifyInner />
    </Suspense>
  );
}
