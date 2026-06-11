'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { Mail, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';

type RegisterStep = 'email' | 'personal' | 'password' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const { login, user } = useApp();

  // Signup Steps Wizard
  const [step, setStep] = useState<RegisterStep>('email');

  // Form Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP Inputs (4 cells)
  const [otp, setOtp] = useState(['', '', '', '']);

  // UI helpers
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Verification Checklist
  const hasMinLen = password.length >= 8;
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  // Rotating slide background (matches login)
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { image: '/image/seun.png', caption: 'CLOTHES MADE WITH THE GOOD TASTE' },
    { image: '/image/slim-girl-1.jpg', caption: 'DESIGNED TO FIT YOUR AESTHETIC' },
    { image: '/image/tailorwork.png', caption: 'ACCESS QUALITY ON DEMAND' },
    { image: '/image/man-measurement-pose.png', caption: 'HAVE CLOTHES TAILORED TO YOUR SIZE' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (user && step !== 'otp') {
      router.push('/');
    }
  }, [user, router, step]);

  // Step progress
  const stepLabels: RegisterStep[] = ['email', 'personal', 'password', 'otp'];
  const stepIndex = stepLabels.indexOf(step);

  // Common input style
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
    fontFamily: 'var(--font-body)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#462814';
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#E5E5E5';

  // Form Handler Step 1 (Email Input)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('personal');
    }, 800);
  };

  // Form Handler Step 2 (Personal Info)
  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !dob) {
      setError('Please fill in all personal details.');
      return;
    }
    setError('');
    setStep('password');
  };

  // Form Handler Step 3 (Password Staging)
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch) {
      setError('Password requirements not satisfied.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  // Form Handler Step 4 (OTP Verification)
  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next cell automatically
    if (val && index < 3) {
      const nextEl = document.getElementById(`otp-${index + 1}`) || document.getElementById(`otp-m-${index + 1}`);
      if (nextEl) nextEl.focus();
    }

    // Auto-submit when all 4 digits are filled
    if (newOtp.every(cell => cell !== '')) {
      setTimeout(() => {
        setError('');
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          login(email, fullName);
          router.push('/auth/onboarding');
        }, 1200);
      }, 300);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevEl = document.getElementById(`otp-${index - 1}`);
      if (prevEl) {
        prevEl.focus();
      }
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(cell => !cell)) {
      setError('Please enter the full 4-digit code.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      login(email, fullName);
      router.push('/auth/onboarding');
    }, 1200);
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F7F7' }}>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE VIEW (< lg)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden w-full min-h-screen flex flex-col" style={{ background: '#F7F7F7' }}>

        {/* Ankara Header Band — hidden on OTP step */}
        {step !== 'otp' && (
          <div className="relative overflow-hidden flex-shrink-0" style={{ height: '110px', background: '#3A1F0B' }}>
            <Image
              src="/image/ankara.png"
              alt="Ankara pattern"
              fill
              style={{ objectFit: 'cover', opacity: 0.6 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <QlozetLogo width={72} color="#FFFFFF" />
            </div>
          </div>
        )}

        {/* Mobile Form Content */}
        <div className="flex-1 flex flex-col" style={{ padding: '24px' }}>

          {/* Step Progress (for non-OTP steps) */}
          {step !== 'otp' && (
            <div className="flex items-center" style={{ gap: '6px', marginBottom: '24px' }}>
              {stepLabels.map((_, i) => (
                <div
                  key={i}
                  className="transition-all duration-500"
                  style={{
                    height: '3px',
                    flex: 1,
                    background: i <= stepIndex ? '#D4800D' : '#E5E5E5',
                    borderRadius: '3px',
                  }}
                />
              ))}
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* ─── STEP 1: EMAIL ─── */}
          {step === 'email' && (
            <div className="animate-fade-in flex flex-col flex-1">
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '8px' }}>
                HI THERE WELCOME TO QLOZET
              </h1>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                Let&apos;s take a few minutes to make altire personalized to you
              </p>

              <form onSubmit={handleEmailSubmit} className="flex flex-col" style={{ gap: '16px' }}>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                  <input type="email" placeholder="ciroma_chukwu@gmail.com" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                {/* Social Signup */}
                <div className="flex flex-col" style={{ gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => { setEmail('ciroma_chukwu@gmail.com'); setStep('personal'); }} className="w-full flex items-center justify-center" style={{ padding: '13px', borderRadius: '12px', background: 'transparent', border: '1px solid #E5E5E5', fontSize: '12px', fontWeight: 600, color: '#1A1A1A', cursor: 'pointer', gap: '10px' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.8l2.4-2.4C17.3 1.5 14.9.5 12.24.5c-5.8 0-10.5 4.7-10.5 10.5s4.7 10.5 10.5 10.5c5.5 0 10-4 10-10.5c0-.6-.1-1.2-.2-1.715z"/></svg>
                    SIGNUP with Google
                  </button>
                  <button type="button" onClick={() => { setEmail('ciroma_chukwu@gmail.com'); setStep('personal'); }} className="w-full flex items-center justify-center" style={{ padding: '13px', borderRadius: '12px', background: 'transparent', border: '1px solid #E5E5E5', fontSize: '12px', fontWeight: 600, color: '#1A1A1A', cursor: 'pointer', gap: '10px' }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.74-1.2 1.88-1.05 3 .1.07 2.34-.16 3-.45"/></svg>
                    SIGNUP with Apple
                  </button>
                </div>

                <button type="submit" className="w-full flex items-center justify-center transition-all" style={{ padding: '15px', borderRadius: '12px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', marginTop: '8px' }}>
                  {isLoading ? <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span> : 'CONTINUE'}
                </button>
              </form>

              <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '28px' }}>
                Already got an account?{' '}
                <Link href="/auth/login" style={{ color: '#1A1A1A', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>LOGIN</Link>
              </p>
            </div>
          )}

          {/* ─── STEP 2: PERSONAL INFO ─── */}
          {step === 'personal' && (
            <div className="animate-fade-in">
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '4px' }}>Personal Details</h1>
              <button onClick={() => setStep('email')} style={{ fontSize: '20px', color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '24px', display: 'block' }}>
                <ArrowLeft size={20} />
              </button>

              <form onSubmit={handlePersonalSubmit} className="flex flex-col" style={{ gap: '16px' }}>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input type="text" placeholder="Kemi Ayomi" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                  <input type="tel" placeholder="08112345677" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</label>
                  <input type="text" placeholder="13c Hallen Estate, Abuja" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</label>
                  <input type="text" placeholder="May 20, 1995" style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={dob} onChange={(e) => setDob(e.target.value)} required />
                </div>
                <button type="submit" className="w-full flex items-center justify-center" style={{ padding: '15px', borderRadius: '12px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', marginTop: '12px' }}>CONTINUE</button>
              </form>
            </div>
          )}

          {/* ─── STEP 3: CREATE PASSWORD ─── */}
          {step === 'password' && (
            <div className="animate-fade-in">
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: '4px' }}>Create Password</h1>
              <button onClick={() => setStep('personal')} style={{ fontSize: '20px', color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '24px', display: 'block' }}>
                <ArrowLeft size={20} />
              </button>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col" style={{ gap: '16px' }}>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} placeholder="••••••••••••" style={{ width: '100%', padding: '12px 40px 12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
                  <div className="relative">
                    <input type={showConfPass ? 'text' : 'password'} placeholder="••••••••••••" style={{ width: '100%', padding: '12px 40px 12px 0', border: 'none', borderBottom: '1px solid #E5E5E5', background: 'transparent', fontSize: '14px', color: '#1A1A1A', outline: 'none' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowConfPass(!showConfPass)} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
                      {showConfPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="flex flex-col" style={{ gap: '10px', margin: '8px 0' }}>
                  {[
                    { met: hasMinLen, label: 'Password must contain at least 8 characters' },
                    { met: hasSymbol, label: 'Password must contain a symbol or character' },
                    { met: hasNumber, label: 'Password must contain a number' },
                    { met: passwordsMatch, label: 'Password must match' },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center" style={{ gap: '10px' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: rule.met ? 'none' : '1.5px solid #DDD', background: rule.met ? '#462814' : '#E5E5E5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {rule.met && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </span>
                      <span style={{ fontSize: '12px', color: rule.met ? '#1A1A1A' : '#AAA', fontWeight: rule.met ? 500 : 400 }}>{rule.label}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch} className="w-full flex items-center justify-center" style={{ padding: '15px', borderRadius: '12px', background: (!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch) ? '#D4C9C0' : '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: (!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch) ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
                  {isLoading ? <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span> : 'SIGN UP'}
                </button>
              </form>
            </div>
          )}

          {/* ─── STEP 4: OTP VERIFICATION ─── */}
          {step === 'otp' && (
            <div className="animate-fade-in flex flex-col items-center" style={{ paddingTop: '20px' }}>
              <button onClick={() => setStep('password')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '48px' }}>
                <ArrowLeft size={22} color="#1A1A1A" />
              </button>

              {/* Mail Icon */}
              <div className="flex items-center justify-center relative" style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FFF5F0', border: '1px solid #FFE4D6', margin: '0 auto 24px' }}>
                <Mail size={28} style={{ color: '#462814' }} />
                <span style={{ position: 'absolute', top: '14px', right: '14px', width: '12px', height: '12px', background: '#DC2626', borderRadius: '50%', border: '2px solid #FFFFFF' }}></span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>You&apos;ve got mail</h1>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, textAlign: 'center', maxWidth: '280px', marginBottom: '32px' }}>
                We sent an email to <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{email}</span> please type the verification code you see.
              </p>

              <form onSubmit={handleOtpSubmit} className="flex flex-col items-center w-full" style={{ gap: '28px' }}>
                {/* 4 OTP underline inputs */}
                <div className="flex justify-center" style={{ gap: '16px' }}>
                  {otp.map((cell, idx) => (
                    <input
                      key={idx}
                      id={`otp-m-${idx}`}
                      type="text"
                      style={{
                        width: '56px',
                        height: '48px',
                        border: 'none',
                        borderBottom: cell ? '2px solid #1A1A1A' : '2px solid #E5E5E5',
                        background: 'transparent',
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#1A1A1A',
                        textAlign: 'center',
                        outline: 'none',
                        fontFamily: 'var(--font-display)',
                      }}
                      value={cell}
                      onChange={(e) => {
                        handleOtpChange(e.target.value, idx);
                        // Auto-focus next on mobile
                        if (e.target.value && idx < 3) {
                          const nextEl = document.getElementById(`otp-m-${idx + 1}`);
                          if (nextEl) nextEl.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                          const prevEl = document.getElementById(`otp-m-${idx - 1}`);
                          if (prevEl) prevEl.focus();
                        }
                      }}
                      maxLength={1}
                      required
                    />
                  ))}
                </div>

                <button type="button" onClick={() => setStep('otp')} style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Verify from email
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP: Left Panel (≥ lg) — unchanged
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden" style={{ background: '#0B0A0F' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-40 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
            style={{ transition: 'opacity 1s ease-in-out, transform 1s ease-in-out' }}
          >
            <Image
              src={slide.image}
              alt="Model backdrop"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
              priority={index === 0}
            />
          </div>
        ))}
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0F] via-transparent to-[#0B0A0F]/60"></div>

        {/* QLOZET Logo */}
        <div className="absolute left-16 top-16 z-20">
          <QlozetLogo width={90} color="#FFFFFF" />
        </div>

        {/* Caption */}
        <div className="absolute left-16 bottom-24 right-16 z-20 flex flex-col gap-6">
          <h2
            className="font-extrabold max-w-[400px] tracking-tight leading-tight uppercase"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}
          >
            {slides[currentSlide].caption}
          </h2>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <span
                key={index}
                className="rounded-full transition-all duration-500"
                style={{
                  height: '10px',
                  width: index === currentSlide ? '32px' : '10px',
                  background: index === currentSlide ? '#462814' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP: Right Panel — Form */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center relative"
        style={{ padding: '48px 32px', background: '#F7F7F7' }}
      >
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <QlozetLogo width={48} color="#1A1A1A" />
        </div>

        <div className="w-full animate-fade-in" style={{ maxWidth: '420px' }}>

          {/* Step Progress Indicator */}
          <div className="flex items-center" style={{ gap: '6px', marginBottom: '36px' }}>
            {stepLabels.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  height: '4px',
                  flex: 1,
                  background: i <= stepIndex ? '#462814' : '#EBEBEB',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>

          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {/* ================= STEP 1: EMAIL SIGNUP ================= */}
          {step === 'email' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    marginBottom: '8px',
                  }}
                >
                  Shop the Right Way
                </h1>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
                  Get started and customize your traditional fits.
                </p>
              </div>

              {/* Social Signup Buttons */}
              <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
                <button 
                  onClick={() => {
                    setEmail('ciroma_chukwu@gmail.com');
                    setStep('personal');
                  }}
                  className="w-full flex items-center justify-center transition-all hover:bg-gray-50"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#F7F7F7',
                    border: '1px solid #E5E5E5',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    cursor: 'pointer',
                    gap: '10px',
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.8l2.4-2.4C17.3 1.5 14.9.5 12.24.5c-5.8 0-10.5 4.7-10.5 10.5s4.7 10.5 10.5 10.5c5.5 0 10-4 10-10.5c0-.6-.1-1.2-.2-1.715z"/></svg>
                  <span>SIGNUP with Google</span>
                </button>
                <button 
                  onClick={() => {
                    setEmail('ciroma_chukwu@gmail.com');
                    setStep('personal');
                  }}
                  className="w-full flex items-center justify-center transition-all hover:bg-gray-50"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: '#F7F7F7',
                    border: '1px solid #E5E5E5',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    cursor: 'pointer',
                    gap: '10px',
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.74-1.2 1.88-1.05 3 .1.07 2.34-.16 3-.45"/></svg>
                  <span>SIGNUP with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative" style={{ margin: '24px 0', textAlign: 'center' }}>
                <span style={{ position: 'absolute', inset: '0', top: '50%', transform: 'translateY(-50%)', borderTop: '1px solid #EFEFEF' }}></span>
                <span
                  style={{
                    position: 'relative',
                    background: '#F7F7F7',
                    padding: '0 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#CCC',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  or
                </span>
              </div>

              <form onSubmit={handleEmailSubmit} className="flex flex-col" style={{ gap: '20px' }}>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Email</label>
                  <input 
                    type="email" 
                    placeholder="ciroma_chukwu@gmail.com" 
                    style={inputStyle}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: '#462814',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  {isLoading ? (
                    <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span>
                  ) : 'SIGNUP with email'}
                </button>
              </form>

              <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', marginTop: '32px' }}>
                Already got an account?{' '}
                <Link href="/auth/login" style={{ color: '#462814', fontWeight: 600, textDecoration: 'none' }} className="hover:underline">
                  LOGIN
                </Link>
              </p>
            </div>
          )}

          {/* ================= STEP 2: PERSONAL INFO ================= */}
          {step === 'personal' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setStep('email')}
                style={{
                  fontSize: '13px',
                  color: '#462814',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '24px',
                }}
                className="hover:underline"
              >
                ← Back
              </button>

              <div style={{ marginBottom: '32px' }}>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    marginBottom: '8px',
                  }}
                >
                  Personal Details
                </h1>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
                  Enter your details to create your bespoke profile.
                </p>
              </div>

              <form onSubmit={handlePersonalSubmit} className="flex flex-col" style={{ gap: '18px' }}>
                {/* Full Name */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Kemi Ayomi" 
                    style={inputStyle}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="08112345677" 
                    style={inputStyle}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Address</label>
                  <input 
                    type="text" 
                    placeholder="13c Hallen Estate, Abuja, Nigeria" 
                    style={inputStyle}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                </div>

                {/* DOB */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Date of Birth</label>
                  <input 
                    type="text" 
                    placeholder="May 20, 1995" 
                    style={inputStyle}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: '#462814',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  CONTINUE
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 3: CREATE PASSWORD ================= */}
          {step === 'password' && (
            <div className="animate-fade-in">
              <button 
                onClick={() => setStep('personal')}
                style={{
                  fontSize: '13px',
                  color: '#462814',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '24px',
                }}
                className="hover:underline"
              >
                ← Back
              </button>

              <div style={{ marginBottom: '32px' }}>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    marginBottom: '8px',
                  }}
                >
                  Create Password
                </h1>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
                  Protect your customized fitting room profile.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col" style={{ gap: '18px' }}>
                {/* Password */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Password</label>
                  <div className="relative">
                    <input 
                      type={showPass ? 'text' : 'password'} 
                      placeholder="••••••••••••" 
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfPass ? 'text' : 'password'} 
                      placeholder="••••••••••••" 
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfPass(!showConfPass)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                    >
                      {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Rules Checklist */}
                <div className="flex flex-col" style={{ gap: '10px', margin: '8px 0' }}>
                  {[
                    { met: hasMinLen, label: 'Password must contain at least 8 characters' },
                    { met: hasSymbol, label: 'Password must contain a symbol or character' },
                    { met: hasNumber, label: 'Password must contain a number' },
                    { met: passwordsMatch, label: 'Passwords must match' },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center" style={{ gap: '10px' }}>
                      <span
                        className="flex items-center justify-center transition-all"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: rule.met ? 'none' : '1.5px solid #DDD',
                          background: rule.met ? '#2D8A4E' : 'transparent',
                          flexShrink: 0,
                        }}
                      >
                        {rule.met && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                      </span>
                      <span style={{ fontSize: '12px', color: rule.met ? '#1A1A1A' : '#AAA', fontWeight: rule.met ? 500 : 400, transition: 'color 0.2s' }}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: (!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch) ? '#D4C9C0' : '#462814',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: (!hasMinLen || !hasSymbol || !hasNumber || !passwordsMatch) ? 'not-allowed' : 'pointer',
                    marginTop: '4px',
                  }}
                >
                  {isLoading ? (
                    <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span>
                  ) : 'SIGN UP'}
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 4: OTP VERIFICATION ================= */}
          {step === 'otp' && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              
              {/* Mail Indicator Icon */}
              <div
                className="flex items-center justify-center relative"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#FFF5F0',
                  border: '1px solid #FFE4D6',
                  margin: '0 auto 24px',
                }}
              >
                <Mail size={28} style={{ color: '#462814' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    width: '12px',
                    height: '12px',
                    background: '#2D8A4E',
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF',
                  }}
                ></span>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    marginBottom: '8px',
                  }}
                >
                  You&apos;ve got mail
                </h1>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto' }}>
                  We sent an email to <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{email}</span>. Please type the verification code you see.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="flex flex-col" style={{ gap: '28px' }}>
                {/* 4 Cells grid */}
                <div className="flex justify-center" style={{ gap: '12px' }}>
                  {otp.map((cell, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      style={{
                        width: '56px',
                        height: '64px',
                        borderRadius: '14px',
                        border: cell ? '2px solid #462814' : '1px solid #E5E5E5',
                        background: '#FAFAFA',
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#1A1A1A',
                        textAlign: 'center',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        fontFamily: 'var(--font-display)',
                      }}
                      value={cell}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onFocus={(e) => { e.target.style.borderColor = '#462814'; e.target.style.boxShadow = '0 0 0 3px rgba(70,40,20,0.08)'; }}
                      onBlur={(e) => { e.target.style.borderColor = cell ? '#462814' : '#E5E5E5'; e.target.style.boxShadow = 'none'; }}
                      maxLength={1}
                      required
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: '#462814',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  {isLoading ? (
                    <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span>
                  ) : 'VERIFY CODE'}
                </button>
              </form>

              <button 
                onClick={() => setStep('otp')}
                style={{
                  fontSize: '13px',
                  color: '#462814',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '24px',
                }}
                className="hover:underline"
              >
                Verify from email
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
