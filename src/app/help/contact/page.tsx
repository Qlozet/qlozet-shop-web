'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// Contact support — creates a personal customer ticket (POST /tickets).
// Admins pick it up in the console's existing support inbox.

const ISSUE_TYPES = [
  'Order problem',
  'Delivery or shipping',
  'Return or refund',
  'Payment or wallet',
  'Bespoke design or quote',
  'Measurements',
  'Account or login',
  'Something else',
];

export default function ContactSupportPage() {
  const router = useRouter();
  const { user } = useApp();

  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    if (!description.trim()) {
      setError('Tell us what happened — a sentence or two is enough.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/tickets', {
        issue_type: issueType,
        description: description.trim(),
      });
      router.push('/help/tickets?submitted=1');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Could not send your message. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-in mx-auto" style={{ gap: '20px', maxWidth: '560px' }}>
      <Link
        href="/help"
        className="flex items-center transition-opacity hover:opacity-70"
        style={{ gap: '8px', textDecoration: 'none', width: 'fit-content' }}
      >
        <ArrowLeft size={16} color="var(--text-secondary)" />
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Help Center
        </span>
      </Link>

      <div className="flex flex-col" style={{ gap: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Contact Support</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Tell us what&apos;s wrong and our team will get back to you. You can follow
          the conversation in <Link href="/help/tickets" style={{ color: 'var(--brand-brown)' }}>My Tickets</Link>.
        </p>
      </div>

      {!user ? (
        <div
          className="flex flex-col items-start"
          style={{ gap: '12px', padding: '20px', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }}
        >
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Sign in so we can find your account and reply to you.
          </p>
          <Link
            href="/auth/login"
            style={{
              padding: '12px 24px', borderRadius: '12px', background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '16px' }}>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What is this about?
            </label>
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {ISSUE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIssueType(t)}
                  className="transition-all hover:-translate-y-0.5"
                  style={{
                    padding: '9px 16px', borderRadius: '100px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    border: issueType === t ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                    background: issueType === t ? 'var(--bg-surface-elevated)' : 'var(--bg-base)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What happened?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Include your order reference if it's about an order — it helps us fix things faster."
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '16px', resize: 'vertical',
                border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
                fontSize: '13px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#DC2626' }}>⚠ {error}</p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              gap: '8px', padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: 'var(--brand-fill)', color: 'var(--brand-fill-text)',
              fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {submitting ? 'Sending…' : 'Send to Support'}
          </button>
        </div>
      )}
    </div>
  );
}
