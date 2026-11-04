'use client';

import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { cardStyle } from '../styles';

/**
 * Sell on Qlozet: open a store on this same account. The store gets its own
 * account behind the scenes (its own orders, wallet and team), but the same
 * email, phone number and password, so there is nothing new to remember.
 * Only someone who signed up with Google has no password yet; the backend
 * says so and the password field appears.
 */

const VENDOR_APP = process.env.NEXT_PUBLIC_VENDOR_URL || 'https://vendor.qlozet.app';

const errMsg = (err: unknown, fallback: string) => {
  const m = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(m) ? m[0] : m) || fallback;
};

const inputBox: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px solid var(--border-glass)',
  background: 'var(--bg-base)',
  padding: '14px 20px',
};
const inputLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '6px',
};
const inputText: React.CSSProperties = {
  width: '100%',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  background: 'none',
  border: 'none',
  outline: 'none',
};

export default function OpenStore() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyHasStore, setAlreadyHasStore] = useState(false);
  const [done, setDone] = useState<{ url: string; message: string } | null>(null);

  const submit = async () => {
    if (name.trim().length < 2) {
      setError('Enter your store name (at least 2 characters).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.post('/auth/open-store', {
        business_name: name.trim(),
        ...(needsPassword ? { password } : {}),
      });
      const body = res.data ?? {};
      const data = body.data?.vendor_login_url ? body.data : body.data?.data ?? body;
      setDone({
        url: data?.vendor_login_url || `${VENDOR_APP}/auth/sign-in`,
        message: body.message || 'Your store is ready.',
      });
    } catch (err) {
      const msg = errMsg(err, 'Could not open your store. Please try again.');
      if (/set a password/i.test(msg)) setNeedsPassword(true);
      if (/already have a store/i.test(msg)) setAlreadyHasStore(true);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in" style={cardStyle}>
        <div className="flex flex-col items-center" style={{ padding: '32px 20px', gap: '12px', textAlign: 'center' }}>
          <CheckCircle2 size={44} color="#2D6A4F" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Your store is ready
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, maxWidth: '360px' }}>
            {done.message} Add your products and verify your business there; your shopping
            account here stays as it is.
          </p>
          <a
            href={done.url}
            className="w-full transition-opacity hover:opacity-90"
            style={{ marginTop: '8px', display: 'block', padding: '14px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', maxWidth: '360px' }}
          >
            Go to the vendor app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      <div style={cardStyle}>
        <div style={{ padding: '24px 20px' }}>
          <Store size={28} color="var(--brand-brown)" strokeWidth={1.5} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '12px' }}>
            Sell on Qlozet
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', marginTop: '8px' }}>
            Open a store with this same email, phone number and password. Your store has its
            own orders, wallet and team; your shopping stays here as it is.
          </p>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: '12px' }}>
        <div style={inputBox}>
          <label htmlFor="open-store-name" style={inputLabel}>Store name</label>
          <input
            id="open-store-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your brand or store name"
            maxLength={120}
            style={inputText}
          />
        </div>

        {needsPassword && (
          <div style={inputBox}>
            <label htmlFor="open-store-password" style={inputLabel}>Password for your store</label>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <input
                id="open-store-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters, upper and lower case, a number"
                autoComplete="new-password"
                style={inputText}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0' }}>
              You signed up with Google, so the vendor app needs a password.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" style={{ fontSize: '12px', lineHeight: 1.5, color: '#B91C1C', margin: 0 }}>
          {error}
          {alreadyHasStore && (
            <>
              {' '}
              <a href={`${VENDOR_APP}/auth/sign-in`} style={{ color: 'inherit', fontWeight: 700 }}>
                Open the vendor app
              </a>
            </>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving || name.trim().length < 2 || (needsPassword && password.length < 8)}
        className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: saving ? 'wait' : 'pointer' }}
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? 'Opening your store…' : 'Open my store'}
      </button>
    </div>
  );
}
