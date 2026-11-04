'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, CreditCard, Loader2, Wallet, X } from 'lucide-react';

export interface PaymentLine {
  label: string;
  value: string;
}

interface PaymentConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** e.g. "Confirm your deposit" */
  title: string;
  /** The amount being charged now, in naira. */
  amount: number;
  method: 'wallet' | 'card';
  /** Wallet balance before paying; shown with what is left after. */
  walletBalance?: number;
  /** What the money is for: tailor, order, what comes later. */
  lines?: PaymentLine[];
  /** One short line under the summary (e.g. what happens next). */
  note?: React.ReactNode;
  /**
   * Takes the payment. Resolve 'redirected' when leaving for the card page
   * (the dialog then just keeps its spinner), 'done' when the money is taken.
   * Throw with a readable message to show it in the dialog.
   */
  onConfirm: () => Promise<'done' | 'redirected'>;
  success: { title: string; body: React.ReactNode };
  /** Called when the person closes the success screen. */
  onDone?: () => void;
}

const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

/**
 * Confirm a payment, show it being taken, then confirm it went through.
 * Wallet payments are instant and can't be undone, so they always get the
 * confirm step; card payments confirm here and finish on the card page.
 */
export function PaymentConfirmDialog({
  open,
  onClose,
  title,
  amount,
  method,
  walletBalance,
  lines = [],
  note,
  onConfirm,
  success,
  onDone,
}: PaymentConfirmDialogProps) {
  // Render it only while needed (`{x && <PaymentConfirmDialog open … />}`),
  // so each payment starts fresh at the confirm step.
  const [step, setStep] = useState<'confirm' | 'paying' | 'done'>('confirm');
  const [error, setError] = useState<string | null>(null);

  // Coming back from the card page with the browser's Back button restores
  // this page from cache, still showing the spinner. Reset to confirm.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setStep('confirm');
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  if (!open || typeof document === 'undefined') return null;

  const pay = async () => {
    setStep('paying');
    setError(null);
    try {
      const result = await onConfirm();
      if (result === 'done') setStep('done');
    } catch (e: unknown) {
      setError((e as Error)?.message || 'The payment did not go through. You were not charged.');
      setStep('confirm');
    }
  };

  const close = () => {
    if (step === 'paying') return; // never leave mid-payment
    if (step === 'done') onDone?.();
    onClose();
  };

  const after =
    method === 'wallet' && typeof walletBalance === 'number' ? walletBalance - amount : null;

  const row = (label: string, value: string, strong = false) => (
    <div key={label} className="flex justify-between" style={{ gap: '12px', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: strong ? 800 : 600, textAlign: 'right' }}>{value}</span>
    </div>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-confirm-title"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 10050, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative w-full animate-fade-in"
        style={{ maxWidth: '400px', borderRadius: '20px', background: 'var(--bg-base)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', padding: '24px' }}
      >
        {step !== 'paying' && (
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute flex items-center justify-center"
            style={{ top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        )}

        {step === 'done' ? (
          <div className="flex flex-col items-center" style={{ gap: '12px', textAlign: 'center', paddingTop: '8px' }}>
            <CheckCircle2 size={48} color="#2D6A4F" />
            <h2 id="payment-confirm-title" style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {success.title}
            </h2>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{success.body}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {naira(amount)} paid{method === 'wallet' ? ' from your wallet' : ''}.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full transition-opacity hover:opacity-90"
              style={{ marginTop: '8px', padding: '12px', borderRadius: '12px', border: 'none', background: '#064E3B', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="flex items-center" style={{ gap: '10px', paddingRight: '36px' }}>
              {method === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />}
              <h2 id="payment-confirm-title" style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {title}
              </h2>
            </div>

            <div className="flex flex-col" style={{ gap: '8px', padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
              {lines.map((l) => row(l.label, l.value))}
              {row('You pay now', naira(amount), true)}
              {row('Paying with', method === 'wallet' ? 'Qlozet wallet' : 'Card')}
              {after !== null && row('Wallet after', naira(after))}
            </div>

            {note && <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{note}</p>}
            {error && (
              <p role="alert" style={{ fontSize: '12px', lineHeight: 1.5, color: '#B91C1C', margin: 0 }}>{error}</p>
            )}

            <div className="flex" style={{ gap: '8px' }}>
              <button
                type="button"
                onClick={close}
                disabled={step === 'paying'}
                className="transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'none', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={pay}
                disabled={step === 'paying'}
                className="flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{ flex: 2, gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', background: '#064E3B', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
              >
                {step === 'paying' ? (
                  <><Loader2 size={14} className="animate-spin" /> {method === 'card' ? 'Opening card page…' : 'Paying…'}</>
                ) : method === 'card' ? (
                  `Continue to pay ${naira(amount)}`
                ) : (
                  `Pay ${naira(amount)}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
