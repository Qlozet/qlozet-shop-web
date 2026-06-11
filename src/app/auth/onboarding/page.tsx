'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

type OnboardStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setGender, setGenderSelected } = useApp();
  const [currentStep, setCurrentStep] = useState<OnboardStep>(1);

  // STEP 2: Gender
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  // STEP 3: Aesthetics
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);

  const aestheticsList = [
    { id: 'traditional', label: 'Traditional', image: '/image/agbada-outfit.png' },
    { id: 'ankara', label: 'Ankara Prints', image: '/image/ankara.png' },
    { id: 'kaftan', label: 'Kaftans', image: '/image/bespoke-kaftan-brown-1.png' },
    { id: 'evening', label: 'Evening Wear', image: '/image/bespoke-dress-1.png' },
    { id: 'corporate', label: 'Corporate', image: '/image/bespoke-kaftan-milk-1.png' },
    { id: 'streetwear', label: 'Streetwear', image: '/image/bespoke-ankara-2.png' },
    { id: 'fabrics', label: 'Fabrics', image: '/image/fabric-1.jpg' },
    { id: 'accessories', label: 'Accessories', image: '/image/qlozet-bag.png' },
  ];

  const handleToggleAesthetic = (id: string) => {
    setSelectedAesthetics(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleWelcomeContinue = () => {
    setCurrentStep(2);
  };

  const handleGenderContinue = () => {
    if (selectedGender) {
      setGender(selectedGender);
      setGenderSelected(true);
      setCurrentStep(3);
    }
  };

  const handleFinishOnboarding = () => {
    router.push('/');
  };

  const handleSkipAesthetics = () => {
    router.push('/');
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F7F7' }}>

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
      <div className="w-full lg:w-[55%] bg-white text-[#121118] flex flex-col relative">

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
                    background: currentStep >= s ? '#D4800D' : '#E5E5E5',
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
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', lineHeight: 1.15, marginBottom: '12px' }}>
                  Hi {firstName},<br />
                  <span style={{ color: '#462814' }}>glad to have you!</span>
                </h1>
                <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7, marginBottom: '24px' }}>
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
                      style={{ padding: '16px', borderRadius: '14px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', gap: '8px' }}
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
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '8px' }}>
                  Who are you shopping for?
                </h1>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '28px' }}>
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
                      border: selectedGender === 'male' ? '2px solid #462814' : '1px solid #E5E5E5',
                      background: selectedGender === 'male' ? '#FBF6F2' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <span style={{ width: '50px', height: '50px', borderRadius: '50%', background: selectedGender === 'male' ? '#462814' : '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: selectedGender === 'male' ? '#FFFFFF' : '#1A1A1A', transition: 'all 0.3s' }}>♂</span>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', display: 'block' }}>Men</span>
                        <span style={{ fontSize: '11px', color: '#AAA', fontWeight: 500 }}>Agbada, kaftans, suits & more</span>
                      </div>
                    </div>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedGender === 'male' ? '6px solid #462814' : '2px solid #DDD', transition: 'all 0.3s' }} />
                  </div>

                  {/* Woman */}
                  <div
                    onClick={() => setSelectedGender('female')}
                    className="flex items-center justify-between cursor-pointer transition-all"
                    style={{
                      padding: '20px 22px',
                      borderRadius: '18px',
                      border: selectedGender === 'female' ? '2px solid #462814' : '1px solid #E5E5E5',
                      background: selectedGender === 'female' ? '#FBF6F2' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <span style={{ width: '50px', height: '50px', borderRadius: '50%', background: selectedGender === 'female' ? '#462814' : '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: selectedGender === 'female' ? '#FFFFFF' : '#1A1A1A', transition: 'all 0.3s' }}>♀</span>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', display: 'block' }}>Women</span>
                        <span style={{ fontSize: '11px', color: '#AAA', fontWeight: 500 }}>Dresses, ankara, iro & buba & more</span>
                      </div>
                    </div>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: selectedGender === 'female' ? '6px solid #462814' : '2px solid #DDD', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <button
                  onClick={handleGenderContinue}
                  disabled={!selectedGender}
                  className="w-full flex items-center justify-center transition-all"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: selectedGender ? '#462814' : '#D4C9C0',
                    color: '#FFFFFF',
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
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '8px' }}>
                  What&apos;s your aesthetic?
                </h1>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, marginBottom: '20px' }}>
                  Select styles you love. This curates your recommendations and home feed.
                </p>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar" style={{ maxHeight: '380px' }}>
                  {aestheticsList.map((aes) => {
                    const isActive = selectedAesthetics.includes(aes.id);
                    return (
                      <div
                        key={aes.id}
                        onClick={() => handleToggleAesthetic(aes.id)}
                        className="relative overflow-hidden cursor-pointer transition-all"
                        style={{
                          aspectRatio: '3/4',
                          borderRadius: '16px',
                          border: isActive ? '2px solid #462814' : '1px solid #E5E5E5',
                        }}
                      >
                        <Image src={aes.image} alt={aes.label} fill style={{ objectFit: 'cover' }} />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent" style={{ padding: '12px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{aes.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#462814', fontWeight: 800, fontSize: '16px' }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col" style={{ gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ padding: '16px', borderRadius: '14px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', gap: '8px' }}
                  >
                    <Sparkles size={14} />
                    FINISH
                  </button>
                  <button
                    onClick={handleSkipAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:bg-gray-50"
                    style={{ padding: '14px', borderRadius: '14px', background: 'transparent', color: '#999', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
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
            <QlozetLogo width={48} color="#121118" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentStep}/3</span>
          </div>

          <div className="w-full max-w-[500px] flex flex-col relative z-10 animate-fade-in">

            {/* Back + Progress */}
            <div className="flex items-center justify-between" style={{ marginBottom: '48px' }}>
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => (prev - 1) as OnboardStep)}
                  className="hover:underline flex items-center"
                  style={{ fontSize: '13px', color: '#462814', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: '6px' }}
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
                      background: currentStep >= s ? '#462814' : '#EBEBEB',
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
                      color: '#1A1A1A',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.15,
                      marginBottom: '12px',
                    }}
                  >
                    Hi {firstName},<br />
                    <span style={{ color: '#462814' }}>glad to have you!</span>
                  </h1>
                  <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.7, maxWidth: '380px' }}>
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
                    background: '#462814',
                    color: '#FFFFFF',
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
                      color: '#1A1A1A',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                      marginBottom: '8px',
                    }}
                  >
                    Who are you shopping for?
                  </h1>
                  <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.7 }}>
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
                      border: selectedGender === 'male' ? '2px solid #462814' : '1px solid #EBEBEB',
                      background: selectedGender === 'male' ? '#FBF6F2' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '18px' }}>
                      <span style={{ width: '54px', height: '54px', borderRadius: '50%', background: selectedGender === 'male' ? '#462814' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: selectedGender === 'male' ? '#FFFFFF' : '#1A1A1A', transition: 'all 0.3s' }}>♂</span>
                      <div>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: '#1A1A1A', display: 'block' }}>Men</span>
                        <span style={{ fontSize: '12px', color: '#AAA', fontWeight: 500 }}>Agbada, kaftans, suits & more</span>
                      </div>
                    </div>
                    <span className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', border: selectedGender === 'male' ? '7px solid #462814' : '2px solid #DDD', transition: 'all 0.3s' }} />
                  </div>

                  {/* Woman */}
                  <div
                    onClick={() => setSelectedGender('female')}
                    className={`flex items-center justify-between cursor-pointer transition-all duration-300`}
                    style={{
                      padding: '22px 24px',
                      borderRadius: '20px',
                      border: selectedGender === 'female' ? '2px solid #462814' : '1px solid #EBEBEB',
                      background: selectedGender === 'female' ? '#FBF6F2' : 'transparent',
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '18px' }}>
                      <span style={{ width: '54px', height: '54px', borderRadius: '50%', background: selectedGender === 'female' ? '#462814' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: selectedGender === 'female' ? '#FFFFFF' : '#1A1A1A', transition: 'all 0.3s' }}>♀</span>
                      <div>
                        <span style={{ fontSize: '17px', fontWeight: 700, color: '#1A1A1A', display: 'block' }}>Women</span>
                        <span style={{ fontSize: '12px', color: '#AAA', fontWeight: 500 }}>Dresses, ankara, iro & buba & more</span>
                      </div>
                    </div>
                    <span className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', border: selectedGender === 'female' ? '7px solid #462814' : '2px solid #DDD', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <button
                  onClick={handleGenderContinue}
                  disabled={!selectedGender}
                  className="w-full flex items-center justify-center transition-all"
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: selectedGender ? '#462814' : '#EBEBEB',
                    color: selectedGender ? '#FFFFFF' : '#BBB',
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
                      color: '#1A1A1A',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                      marginBottom: '8px',
                    }}
                  >
                    What&apos;s your aesthetic?
                  </h1>
                  <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7 }}>
                    Select the styles you love. This curates the recommendations shown in your feed.
                  </p>
                </div>

                {/* Aesthetics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[380px] pr-1">
                  {aestheticsList.map((aes) => {
                    const isActive = selectedAesthetics.includes(aes.id);
                    return (
                      <div
                        key={aes.id}
                        onClick={() => handleToggleAesthetic(aes.id)}
                        className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                        style={{
                          aspectRatio: '3/4',
                          borderRadius: '16px',
                          border: isActive ? '2px solid #462814' : '1px solid #EBEBEB',
                        }}
                      >
                        <Image src={aes.image} alt={aes.label} fill style={{ objectFit: 'cover' }} />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent" style={{ padding: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{aes.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center animate-fade-in">
                            <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#462814', fontWeight: 800, fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col" style={{ gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full flex items-center justify-center transition-all hover:opacity-90"
                    style={{ padding: '16px', borderRadius: '14px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', gap: '8px' }}
                  >
                    <Sparkles size={14} />
                    FINISH PERSONALIZATION
                  </button>
                  <button
                    onClick={handleSkipAesthetics}
                    className="w-full flex items-center justify-center transition-all hover:bg-gray-50"
                    style={{ padding: '12px', borderRadius: '14px', background: 'transparent', color: '#999', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
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
