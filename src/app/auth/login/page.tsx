'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, user } = useApp();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mobile: toggle between splash and form
  const [showMobileForm, setShowMobileForm] = useState(false);

  // Slide state on the left
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: '/image/seun.png',
      caption: 'CLOTHES MADE WITH THE GOOD TASTE',
    },
    {
      image: '/image/slim-girl-1.jpg',
      caption: 'DESIGNED TO FIT YOUR AESTHETIC',
    },
    {
      image: '/image/tailorwork.png',
      caption: 'ACCESS QUALITY ON DEMAND',
    },
    {
      image: '/image/man-measurement-pose.png',
      caption: 'HAVE CLOTHES TAILORED TO YOUR SIZE',
    },
  ];

  // Rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // Simulate API Login
    setTimeout(() => {
      setIsLoading(false);
      login(email, 'Kemi Ayomi');
      router.push('/');
    }, 1200);
  };

  const handleDemoClick = () => {
    demoLogin();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F7F7' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
          MOBILE: Full-Screen Hero Splash (< lg)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden w-full min-h-screen flex flex-col relative">

        {/* If showing the splash (default on mobile) */}
        {!showMobileForm ? (
          <div className="flex-1 flex flex-col relative">
            {/* Background Image Carousel */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{ opacity: index === currentSlide ? 1 : 0 }}
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

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            {/* QLOZET Logo — top-left */}
            <div className="relative z-20" style={{ padding: '32px 24px' }}>
              <QlozetLogo width={90} color="#FFFFFF" />
            </div>

            {/* Bottom Content — caption, dots, buttons — pinned to bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 flex flex-col"
              style={{ padding: '0 24px 40px 24px', gap: '24px' }}
            >
              {/* Caption */}
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  maxWidth: '320px',
                }}
              >
                {slides[currentSlide].caption}
              </h2>

              {/* Carousel Dots */}
              <div className="flex" style={{ gap: '8px' }}>
                {slides.map((_, index) => (
                  <span
                    key={index}
                    className="rounded-full transition-all duration-500"
                    style={{
                      height: '8px',
                      width: index === currentSlide ? '8px' : '8px',
                      background: index === currentSlide ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>

              {/* CREATE PROFILE Button */}
              <Link
                href="/auth/register"
                className="w-full flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#462814',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                CREATE PROFILE
              </Link>

              {/* Already got an account? LOGIN */}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                Already got an account?{' '}
                <button
                  onClick={() => setShowMobileForm(true)}
                  style={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    fontSize: '13px',
                    padding: 0,
                  }}
                >
                  LOGIN
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Mobile Login Form View */
          <div className="flex-1 flex flex-col" style={{ background: '#F7F7F7' }}>
            {/* Ankara Header Band */}
            <div className="relative overflow-hidden" style={{ height: '120px', background: '#3A1F0B' }}>
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

            {/* Form Content */}
            <div className="flex-1 flex flex-col" style={{ padding: '32px 24px' }}>
              <button
                onClick={() => setShowMobileForm(false)}
                style={{
                  fontSize: '13px',
                  color: '#462814',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '24px',
                  alignSelf: 'flex-start',
                }}
              >
                ← Back
              </button>

              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-display)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Welcome back
              </h1>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '28px' }}>
                Enter your credentials to explore custom fits.
              </p>

              {error && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '18px' }}>
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                  <input
                    type="email"
                    placeholder="e.g. kemi.ayomi@gmail.com"
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      border: 'none',
                      borderBottom: '1px solid #E5E5E5',
                      background: 'transparent',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      outline: 'none',
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => e.target.style.borderBottomColor = '#462814'}
                    onBlur={(e) => e.target.style.borderBottomColor = '#E5E5E5'}
                    required
                  />
                </div>

                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <div className="flex justify-between items-center">
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#462814', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                    <Link
                      href="/auth/forgot"
                      style={{ fontSize: '11px', color: '#462814', fontWeight: 500, textDecoration: 'underline' }}
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 0',
                        border: 'none',
                        borderBottom: '1px solid #E5E5E5',
                        background: 'transparent',
                        fontSize: '14px',
                        color: '#1A1A1A',
                        outline: 'none',
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={(e) => e.target.style.borderBottomColor = '#462814'}
                      onBlur={(e) => e.target.style.borderBottomColor = '#E5E5E5'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#999',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
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
                    marginTop: '12px',
                  }}
                >
                  {isLoading ? (
                    <span className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', display: 'inline-block' }}></span>
                  ) : 'CONTINUE →'}
                </button>
              </form>

              {/* Demo Login */}
              <div className="relative" style={{ margin: '28px 0', textAlign: 'center' }}>
                <span style={{ position: 'absolute', inset: '0', top: '50%', transform: 'translateY(-50%)', borderTop: '1px solid #EFEFEF' }}></span>
                <span style={{ position: 'relative', background: '#F7F7F7', padding: '0 16px', fontSize: '11px', fontWeight: 600, color: '#CCC', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
              </div>

              <button
                onClick={handleDemoClick}
                className="w-full flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#F7F7F7',
                  border: '1px solid #E5E5E5',
                  color: '#1A1A1A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  gap: '10px',
                }}
              >
                <Sparkles size={14} style={{ color: '#462814' }} />
                <span>DEMO CUSTOMER LOGIN</span>
              </button>

              <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '28px' }}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" style={{ color: '#462814', fontWeight: 600, textDecoration: 'underline' }}>
                  SIGN UP
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP: Two-Panel Layout (≥ lg) — unchanged
          ═══════════════════════════════════════════════════════════════ */}

      {/* LEFT SCREEN - Visual Rotating Backdrops */}
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

        {/* Caption and Slider Dots */}
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

      {/* RIGHT SCREEN - Clean White Form Panel */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center relative"
        style={{ padding: '48px 32px', background: '#F7F7F7' }}
      >
        <div
          className="w-full animate-fade-in"
          style={{ maxWidth: '420px' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
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
              Welcome back
            </h1>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
              Enter your credentials to explore custom fits.
            </p>
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

          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '20px' }}>
            
            {/* Email Field */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="e.g. kemi.ayomi@gmail.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E5E5',
                  background: '#FAFAFA',
                  fontSize: '14px',
                  color: '#1A1A1A',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#462814'}
                onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <div className="flex justify-between items-center">
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>
                  Password
                </label>
                <Link
                  href="/auth/forgot"
                  style={{ fontSize: '12px', color: '#462814', fontWeight: 500, textDecoration: 'none' }}
                  className="hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #E5E5E5',
                    background: '#FAFAFA',
                    fontSize: '14px',
                    color: '#1A1A1A',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#462814'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Continue Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
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
              {isLoading ? (
                <span
                  className="animate-spin"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#FFFFFF',
                    display: 'inline-block',
                  }}
                ></span>
              ) : (
                'CONTINUE →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative" style={{ margin: '32px 0', textAlign: 'center' }}>
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

          {/* Demo Customer Access */}
          <button 
            onClick={handleDemoClick}
            className="w-full flex items-center justify-center transition-all hover:opacity-90"
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              color: '#1A1A1A',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              gap: '10px',
            }}
          >
            <Sparkles size={16} style={{ color: '#462814' }} />
            <span>DEMO CUSTOMER LOGIN</span>
          </button>

          {/* Sign up link */}
          <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', marginTop: '32px' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              style={{ color: '#462814', fontWeight: 600, textDecoration: 'none' }}
              className="hover:underline"
            >
              SIGN UP
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
