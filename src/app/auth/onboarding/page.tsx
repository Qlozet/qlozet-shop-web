'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { QlozetLogo } from '@/components/QlozetLogo';
import { Sparkles, ArrowRight, Check, Crown, Palette, Shirt, Star, Briefcase, Zap, Scissors, ShoppingBag, type LucideIcon } from 'lucide-react';

type OnboardStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setGender, setGenderSelected } = useApp();
  const trackEvent = useTrackEvent();
  const [currentStep, setCurrentStep] = useState<OnboardStep>(1);

  // STEP 2: Gender
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  // STEP 3: Aesthetics
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [savingAesthetics, setSavingAesthetics] = useState(false);

  const aestheticsList: { id: string; label: string; icon: LucideIcon }[] = [
    { id: 'traditional', label: 'Traditional', icon: Crown },
    { id: 'ankara', label: 'Ankara Prints', icon: Palette },
    { id: 'kaftan', label: 'Kaftans', icon: Shirt },
    { id: 'evening', label: 'Evening Wear', icon: Star },
    { id: 'corporate', label: 'Corporate', icon: Briefcase },
    { id: 'streetwear', label: 'Streetwear', icon: Zap },
    { id: 'fabrics', label: 'Fabrics', icon: Scissors },
    { id: 'accessories', label: 'Accessories', icon: ShoppingBag },
  ];

  const handleToggleAesthetic = (id: string) => {
    setSelectedAesthetics(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Clean icon tile — no dummy imagery; label + icon + check when selected.
  const renderAestheticTile = (aes: { id: string; label: string; icon: LucideIcon }) => {
    const isActive = selectedAesthetics.includes(aes.id);
    const Icon = aes.icon;
    return (
      <button
        key={aes.id}
        type="button"
        onClick={() => handleToggleAesthetic(aes.id)}
        className="relative flex flex-col items-center justify-center text-center transition-all active:scale-[0.98] hover:opacity-95"
        style={{
          padding: '22px 12px',
          borderRadius: '16px',
          gap: '10px',
          cursor: 'pointer',
          border: isActive ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
          background: isActive ? 'var(--brand-brown-tint, rgba(139,90,43,0.1))' : 'var(--bg-surface-elevated)',
        }}
      >
        {isActive && (
          <span className="absolute" style={{ top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={12} color="var(--brand-fill-text)" strokeWidth={3} />
          </span>
        )}
        <Icon size={26} color={isActive ? 'var(--brand-brown)' : 'var(--text-secondary)'} strokeWidth={1.5} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{aes.label}</span>
      </button>
    );
  };

  const handleWelcomeContinue = () => {
    setCurrentStep(2);
  };

  const handleGenderContinue = () => {
    if (selectedGender) {
      setGender(selectedGender);
      setGenderSelected(true);
      // Persist gender to backend (fire-and-forget)
      api.patch('/users/me/profile', { gender: selectedGender }).catch(() => {});
      setCurrentStep(3);
    }
  };

  const handleFinishOnboarding = async () => {
    // Save aesthetic preferences to user profile (these feed the recommendation
    // engine's style vector). Await so it actually persists before we leave.
    if (selectedAesthetics.length > 0) {
      setSavingAesthetics(true);
      try {
        await api.patch('/users/me/profile', { aesthetic_preferences: selectedAesthetics });
      } catch {
        /* non-blocking — still let the user into the app */
      }
      trackEvent({
        eventType: 'preferred_aesthetic',
        properties: { aesthetics: selectedAesthetics },
      });
      setSavingAesthetics(false);
    }
    router.push('/');
  };

  const handleSkipAesthetics = () => {
    // Gender was already saved in handleGenderContinue
    router.push('/');
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP: LEFT PANEL — Hero image
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden" style={{ background: '#0B0A0F' }}>
        {/* Background images — rotate per step */}
        {[
          '/image/seun.png',
          '/image/slim-girl-1.jpg',
          '/image/bespoke-dress-1.png',
        ].map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx + 1 === currentStep ? 'opacity-40' : 'opacity-0'}`}
          >
            <Image
              src={img}
              alt="Onboarding backdrop"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
              priority={idx === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A0F] via-transparent to-[#0B0A0F]/60" />

        {/* Logo */}
        <div className="absolute left-16 top-16 z-20">
          <QlozetLogo width={90} color="#FFFFFF" />
        </div>

        {/* Step caption */}
        <div className="absolute left-16 bottom-24 right-16 z-20 flex flex-col gap-4">
          <h2
            className="font-extrabold max-w-[400px] tracking-tight leading-tight uppercase"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}
          >
            {currentStep === 1 && 'YOUR STYLE, YOUR WAY'}
            {currentStep === 2 && 'TAILORED TO YOUR TASTE'}
            {currentStep === 3 && 'CURATE YOUR FEED'}
          </h2>
          {/* Dots */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className="rounded-full transition-all duration-500"
                style={{
                  height: '10px',
                  width: s === currentStep ? '32px' : '10px',
                  background: s === currentStep ? '#462814' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT PANEL — Form Content
          ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[55%] bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col relative">

        {/* ── MOBILE VIEW ── */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col" style={{ padding: '24px' }}>

            {/* Progress Bars */}
            <div className="flex" style={{ gap: '8px', marginBottom: '28px' }}>
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  style={{
                    height: '3px',
                    flex: 1,
                    borderRadius: '3px',
                    background: currentStep >= s ? '#D4800D' : 'var(--border-glass)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* ── MOBILE STEP 1: WELCOME ── */}
            {currentStep === 1 && (
              <div className="animate-fade-in flex flex-col flex-1">
                {/* Greeting */}
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4800D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Welcome to Qlozet
                  </span>
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.15, marginBottom: '12px' }}>
                  Hi {firstName},<br />
                  <span style={{ color: 'var(--brand-brown)' }}>glad to have you!</span>
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
                  Let&apos;s personalise your experience so you see the styles, fabrics, and brands that match your taste.
                </p>

                {/* Hero Image */}
                <div className="relative flex-1 rounded-[24px] overflow-hidden" style={{ minHeight: '300px' }}>
                  <Image
                    src="/image/ankara.png"
                    alt="Ankara pattern"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Continue CTA */}
                  <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
                    <button
                      onClick={handleWelcomeContinue}
                      className="w-full flex items-center justify-center transition-all hover:opacity-90"
                      style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', gap: '8px' }}
                    >
                      LET&apos;S GO
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── MOBILE STEP 2: GENDER ── */}
            {currentStep === 2 && (
              <div className="animate-fade-in flex flex-col flex-1">
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '8px' }}>
                  Who are you shopping for?
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                  This helps us show you the most relevant products and collections.
                </p>

                <div className="flex flex-col" style={{ gap: '14px' }}>
                  {/* Man */}
                  <div
                    onClick={() => setSelectedGender('male')}
                    className="flex items-center justify-between cursor-pointer transition-all"
                    style={{
                      padding: '20px 22px',
                      borderRadius: '18px',
                      border: selectedGender === 'male' ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: selectedGender === 'male' ? 'var(--bg-surface-elevated)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <span style={{ width: '50px', height: '50px', borderRadius: '50%', background: selectedGender === 'male' ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: selectedGender === 'male' ? 'var(--brand-fill-text)' : 'var(--text-primary)', transition: 'all 0.3s' }}>♂</span>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Men</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Agbada, kaftans, suits & more</span>
                      </div>
                    </div>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedGender === 'male' ? '6px solid var(--brand-fill)' : '2px solid var(--border-glass)', transition: 'all 0.3s' }} />
                  </div>

                  {/* Woman */}
                  <div
                    onClick={() => setSelectedGender('female')}
                    className="flex items-center justify-between cursor-pointer transition-all"
                    style={{
                      padding: '20px 22px',
                      borderRadius: '18px',
                      border: selectedGender === 'female' ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: selectedGender === 'female' ? 'var(--bg-surface-elevated)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <span style={{ width: '50px', height: '50px', borderRadius: '50%', background: selectedGender === 'female' ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: selectedGender === 'female' ? 'var(--brand-fill-text)' : 'var(--text-primary)', transition: 'all 0.3s' }}>♀</span>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Women</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Dresses, ankara, iro & buba & more</span>
                      </div>
                    </div>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedGender === 'female' ? '6px solid var(--brand-fill)' : '2px solid var(--border-glass)', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <button
                  onClick={handleGenderContinue}
                  disabled={!selectedGender}
                  className="w-full flex items-center justify-center transition-all"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: selectedGender ? 'var(--brand-fill)' : 'var(--border-glass)',
                    color: 'var(--brand-fill-text)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    cursor: selectedGender ? 'pointer' : 'not-allowed',
                    marginTop: '32px',
                  }}
                >
                  CONTINUE
                </button>
              </div>
            )}

            {/* ── MOBILE STEP 3: AESTHETICS ── */}
            {currentStep === 3 && (
              <div className="animate-fade-in flex flex-col flex-1">
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '8px' }}>
                  What&apos;s your aesthetic?
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Select styles you love. This curates your recommendations and home feed.
                </p>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar" style={{ maxHeight: '380px' }}>
                  {aestheticsList.map(renderAestheticTile)}
                </div>

                <div className="flex flex-col" style={{ gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={savingAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: savingAesthetics ? 'not-allowed' : 'pointer', gap: '8px', opacity: savingAesthetics ? 0.6 : 1 }}
                  >
                    <Sparkles size={14} />
                    {savingAesthetics ? 'SAVING…' : 'FINISH'}
                  </button>
                  <button
                    onClick={handleSkipAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)]"
                    style={{ padding: '14px', borderRadius: '14px', background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── DESKTOP VIEW ── */}
        <div className="hidden lg:flex items-center justify-center w-full min-h-screen" style={{ padding: '32px' }}>

          {/* Step counter */}
          <div className="absolute top-8 left-8 flex justify-between w-full pr-16 items-center">
            <QlozetLogo width={48} color="var(--text-primary)" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentStep}/3</span>
          </div>

          <div className="w-full max-w-[500px] flex flex-col relative z-10 animate-fade-in">

            {/* Back + Progress */}
            <div className="flex items-center justify-between" style={{ marginBottom: '48px' }}>
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => (prev - 1) as OnboardStep)}
                  className="hover:underline flex items-center"
                  style={{ fontSize: '13px', color: 'var(--brand-brown)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: '6px' }}
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}
              <div className="flex" style={{ gap: '8px' }}>
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className="transition-all duration-500"
                    style={{
                      height: '4px',
                      width: s === currentStep ? '32px' : '16px',
                      borderRadius: '4px',
                      background: currentStep >= s ? 'var(--brand-fill)' : 'var(--border-glass)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ════════ DESKTOP STEP 1: WELCOME ════════ */}
            {currentStep === 1 && (
              <div className="flex flex-col animate-fade-in" style={{ gap: '24px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4800D', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '12px' }}>
                    Welcome to Qlozet
                  </span>
                  <h1
                    style={{
                      fontSize: '36px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.15,
                      marginBottom: '12px',
                    }}
                  >
                    Hi {firstName},<br />
                    <span style={{ color: 'var(--brand-brown)' }}>glad to have you!</span>
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '380px' }}>
                    Let&apos;s personalise your experience so you see the styles, fabrics, and brands that match your taste.
                  </p>
                </div>

                {/* Decorative image */}
                <div className="relative overflow-hidden" style={{ height: '220px', borderRadius: '24px' }}>
                  <Image
                    src="/image/ankara.png"
                    alt="Ankara fabric"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <button
                  onClick={handleWelcomeContinue}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'var(--brand-fill)',
                    color: 'var(--brand-fill-text)',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    gap: '8px',
                  }}
                >
                  LET&apos;S GO
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ════════ DESKTOP STEP 2: GENDER ════════ */}
            {currentStep === 2 && (
              <div className="flex flex-col animate-fade-in" style={{ gap: '24px' }}>
                <div>
                  <h1
                    style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                      marginBottom: '8px',
                    }}
                  >
                    Who are you shopping for?
                  </h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    This helps us show you the most relevant products, collections, and recommendations.
                  </p>
                </div>

                <div className="flex flex-col" style={{ gap: '14px', marginTop: '8px' }}>
                  {/* Man */}
                  <div
                    onClick={() => setSelectedGender('male')}
                    className={`flex items-center justify-between cursor-pointer transition-all duration-300`}
                    style={{
                      padding: '22px 24px',
                      borderRadius: '20px',
                      border: selectedGender === 'male' ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: selectedGender === 'male' ? 'var(--bg-surface-elevated)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '18px' }}>
                      <span style={{ width: '54px', height: '54px', borderRadius: '50%', background: selectedGender === 'male' ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: selectedGender === 'male' ? 'var(--brand-fill-text)' : 'var(--text-primary)', transition: 'all 0.3s' }}>♂</span>
                      <div>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Men</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Agbada, kaftans, suits & more</span>
                      </div>
                    </div>
                    <span className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', border: selectedGender === 'male' ? '7px solid var(--brand-fill)' : '2px solid var(--border-glass)', transition: 'all 0.3s' }} />
                  </div>

                  {/* Woman */}
                  <div
                    onClick={() => setSelectedGender('female')}
                    className={`flex items-center justify-between cursor-pointer transition-all duration-300`}
                    style={{
                      padding: '22px 24px',
                      borderRadius: '20px',
                      border: selectedGender === 'female' ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: selectedGender === 'female' ? 'var(--bg-surface-elevated)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '18px' }}>
                      <span style={{ width: '54px', height: '54px', borderRadius: '50%', background: selectedGender === 'female' ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: selectedGender === 'female' ? 'var(--brand-fill-text)' : 'var(--text-primary)', transition: 'all 0.3s' }}>♀</span>
                      <div>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Women</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Dresses, ankara, iro & buba & more</span>
                      </div>
                    </div>
                    <span className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', border: selectedGender === 'female' ? '7px solid var(--brand-fill)' : '2px solid var(--border-glass)', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <button
                  onClick={handleGenderContinue}
                  disabled={!selectedGender}
                  className="w-full flex items-center justify-center transition-all"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: selectedGender ? 'var(--brand-fill)' : 'var(--border-glass)',
                    color: selectedGender ? 'var(--brand-fill-text)' : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    cursor: selectedGender ? 'pointer' : 'not-allowed',
                    marginTop: '8px',
                  }}
                >
                  CONTINUE
                </button>
              </div>
            )}

            {/* ════════ DESKTOP STEP 3: AESTHETICS ════════ */}
            {currentStep === 3 && (
              <div className="flex flex-col animate-fade-in" style={{ gap: '20px' }}>
                <div>
                  <h1
                    style={{
                      fontSize: '32px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                      marginBottom: '8px',
                    }}
                  >
                    What&apos;s your aesthetic?
                  </h1>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Select the styles you love. This curates the recommendations shown in your feed.
                  </p>
                </div>

                {/* Aesthetics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[380px] pr-1">
                  {aestheticsList.map(renderAestheticTile)}
                </div>

                <div className="flex flex-col" style={{ gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={savingAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', border: 'none', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', cursor: savingAesthetics ? 'not-allowed' : 'pointer', gap: '8px', opacity: savingAesthetics ? 0.6 : 1 }}
                  >
                    <Sparkles size={14} />
                    {savingAesthetics ? 'SAVING…' : 'FINISH PERSONALIZATION'}
                  </button>
                  <button
                    onClick={handleSkipAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)]"
                    style={{ padding: '12px', borderRadius: '14px', background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
