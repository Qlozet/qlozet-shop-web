'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { QlozetLogo } from '@/components/QlozetLogo';
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  Forgot password — code-based reset
//  Step 1: enter email → backend emails a 6-digit code
//  Step 2: enter the code → verified (not consumed) by the backend
//  Step 3: set a new password → consumes the code
// ═══════════════════════════════════════════════════════════════

const BRAND = '#462814';

type Step = 'email' | 'code' | 'password' | 'done';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid #E5E5E5',
  background: '#FAFAFA',
  fontSize: '14px',
  color: '#1A1A1A',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Resend cooldown (mirrors the backend's 60s cooldown).
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    setError('');
    setNotice('');
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setNotice('If an account exists for that email, a reset code is on its way.');
      setCooldown(60);
      setStep('code');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const verifyCode = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-reset-code', { email: email.trim(), code: code.trim() });
      setStep('password');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  }, [email, code]);

  const resetPassword = useCallback(async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not reset your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, code, password, confirm]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') sendCode();
    else if (step === 'code') verifyCode();
    else if (step === 'password') resetPassword();
  };

  const heading =
    step === 'email' ? 'Reset your password'
    : step === 'code' ? 'Enter your code'
    : step === 'password' ? 'Create a new password'
    : 'Password updated';

  const sub =
    step === 'email' ? "Enter your email and we'll send you a 6-digit code."
    : step === 'code' ? `We sent a 6-digit code to ${email}. It expires in 15 minutes.`
    : step === 'password' ? 'Choose a strong password you haven’t used before.'
    : 'You can now sign in with your new password.';

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#F7F7F7' }}>
      <div
        className="w-full"
        style={{ maxWidth: '420px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #EDEDED', padding: '32px 28px' }}
      >
        {/* Logo */}
        <div className="flex justify-center" style={{ marginBottom: '22px' }}>
          <QlozetLogo color={BRAND} />
        </div>

        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center" style={{ marginBottom: '22px', gap: '10px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(70,40,20,0.07)', color: BRAND }}
          >
            {step === 'done' ? <CheckCircle2 size={24} /> : step === 'code' ? <ShieldCheck size={24} /> : <Mail size={24} />}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', margin: 0 }}>{heading}</h1>
          <p style={{ fontSize: '13.5px', color: '#777', margin: 0, lineHeight: 1.5 }}>{sub}</p>
        </div>

        {error && (
          <div style={{ fontSize: '13px', color: '#B4232A', background: 'rgba(180,35,42,0.06)', border: '1px solid rgba(180,35,42,0.15)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {notice && step === 'code' && (
          <div style={{ fontSize: '13px', color: BRAND, background: 'rgba(70,40,20,0.05)', border: '1px solid rgba(70,40,20,0.12)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}>
            {notice}
          </div>
        )}

        {step === 'done' ? (
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full flex items-center justify-center transition-all hover:opacity-90"
            style={{ padding: '15px', borderRadius: '12px', background: BRAND, color: '#FFF', border: 'none', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer' }}
          >
            BACK TO SIGN IN →
          </button>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col" style={{ gap: '16px' }}>
            {step === 'email' && (
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = BRAND)}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                  required
                  autoFocus
                />
              </div>
            )}

            {step === 'code' && (
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>6-digit code</label>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.5em', fontSize: '18px', fontWeight: 700 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={(e) => (e.target.style.borderColor = BRAND)}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                  required
                  autoFocus
                />
                <div className="flex items-center justify-center" style={{ gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12.5px', color: '#999' }}>Didn&apos;t get it?</span>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={cooldown > 0 || isLoading}
                    style={{ fontSize: '12.5px', fontWeight: 600, color: cooldown > 0 ? '#BBB' : BRAND, background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', padding: 0 }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>
              </div>
            )}

            {step === 'password' && (
              <>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      style={{ ...inputStyle, padding: '14px 48px 14px 16px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = BRAND)}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    style={inputStyle}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = BRAND)}
                    onBlur={(e) => (e.target.style.borderColor = '#E5E5E5')}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center transition-all hover:opacity-90"
              style={{ padding: '15px', borderRadius: '12px', background: BRAND, color: '#FFF', border: 'none', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', marginTop: '4px' }}
            >
              {isLoading ? (
                <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }} />
              ) : step === 'email' ? 'SEND CODE →' : step === 'code' ? 'CONTINUE →' : 'RESET PASSWORD →'}
            </button>
          </form>
        )}

        {/* Back link */}
        {step !== 'done' && (
          <div className="flex justify-center" style={{ marginTop: '22px' }}>
            {step === 'email' ? (
              <Link href="/auth/login" style={{ fontSize: '13px', color: '#777', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }} className="hover:underline">
                <ArrowLeft size={15} /> Back to sign in
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { setError(''); setStep(step === 'password' ? 'code' : 'email'); }}
                style={{ fontSize: '13px', color: '#777', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                className="hover:underline"
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
