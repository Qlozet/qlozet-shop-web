'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { QlozetLogo } from '@/components/QlozetLogo';
import { 
  Percent, 
  Bell, 
  ShoppingBag, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

type OnboardStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState<OnboardStep>(1);

  // STEP 1 States (Notifications)
  const [notifPreferences, setNotifPreferences] = useState({
    discounts: true,
    features: false,
    collections: true,
  });

  // STEP 2 States (Target Gender)
  const [selectedGender, setSelectedGender] = useState<'man' | 'woman' | null>(null);

  // STEP 3 States (Aesthetics Grid)
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);

  const aestheticsList = [
    { id: 'traditional', label: 'Traditional Agbada', image: '/image/agbada-outfit.png' },
    { id: 'ankara', label: 'Ankara Prints', image: '/image/ankara.png' },
    { id: 'kaftan', label: 'Turkish Kaftans', image: '/image/bespoke-kaftan-brown-1.png' },
    { id: 'evening', label: 'Bespoke Evening Gowns', image: '/image/bespoke-dress-1.png' },
    { id: 'corporate', label: 'Corporate Minimalist', image: '/image/bespoke-kaftan-milk-1.png' },
    { id: 'fabrics', label: 'Lace & Cotton Fabrics', image: '/image/fabric-1.jpg' },
  ];

  const handleToggleAesthetic = (id: string) => {
    setSelectedAesthetics(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleStep1Continue = () => {
    setCurrentStep(2);
  };

  const handleStep2Continue = () => {
    if (selectedGender) {
      setCurrentStep(3);
    }
  };

  const handleFinishOnboarding = () => {
    // Save selections if needed, and route home
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0A0F] text-white">
      
      {/* LEFT SCREEN - Custom Tribal Geometric Motif & Brand Identity */}
      <div className="hidden lg:block w-[40%] bg-[#261103] relative overflow-hidden">
        {/* Render geometric CSS background */}
        <div className="tribal-pattern-bg" style={{ opacity: 0.35 }}></div>

        {/* QLOZET Logo */}
        <div className="absolute left-16 top-16 z-20">
          <QlozetLogo width={90} color="#FFFFFF" />
        </div>

        {/* Floating background details */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121118] via-transparent to-transparent"></div>
      </div>

      {/* RIGHT SCREEN - Clean White Theme Selection Wizard */}
      <div className="w-full lg:w-[60%] bg-white text-[#121118] flex flex-col lg:items-center lg:justify-center relative" style={{ padding: '0' }}>
        
        {/* ── MOBILE VIEW ── */}
        <div className="lg:hidden flex flex-col min-h-screen">
          {/* Mobile Content */}
          <div className="flex-1 flex flex-col" style={{ padding: '24px' }}>

            {/* Progress Bars */}
            <div className="flex" style={{ gap: '8px', marginBottom: '28px' }}>
              <span style={{ height: '3px', flex: 1, borderRadius: '3px', background: currentStep >= 1 ? '#D4800D' : '#E5E5E5', transition: 'background 0.3s' }} />
              <span style={{ height: '3px', flex: 1, borderRadius: '3px', background: currentStep >= 2 ? '#D4800D' : '#E5E5E5', transition: 'background 0.3s' }} />
              <span style={{ height: '3px', flex: 1, borderRadius: '3px', background: currentStep >= 3 ? '#D4800D' : '#E5E5E5', transition: 'background 0.3s' }} />
            </div>

            {/* ── MOBILE STEP 1 ── */}
            {currentStep === 1 && (
              <div className="animate-fade-in flex flex-col flex-1">
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#462814', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px' }}>
                  HI THERE WELCOME TO QLOZET
                </h1>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                  Let&apos;s take a few minutes to make altire personalized to you
                </p>

                {/* Ankara Pattern Image */}
                <div className="relative flex-1 rounded-[20px] overflow-hidden" style={{ minHeight: '280px' }}>
                  <Image
                    src="/image/ankara.png"
                    alt="Ankara pattern"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* CONTINUE button overlaying bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
                    <button
                      onClick={handleStep1Continue}
                      className="w-full flex items-center justify-center transition-all"
                      style={{ padding: '15px', borderRadius: '12px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── MOBILE STEP 2 ── */}
            {currentStep === 2 && (
              <div className="animate-fade-in flex flex-col flex-1">
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#462814', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px' }}>
                  What products do you use?
                </h1>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '24px' }}>
                  To tailor your catalog feed, tell us what gender line you browse.
                </p>

                <div className="flex flex-col" style={{ gap: '12px' }}>
                  <div onClick={() => setSelectedGender('man')} className="flex items-center justify-between cursor-pointer" style={{ padding: '18px 20px', borderRadius: '16px', border: selectedGender === 'man' ? '2px solid #462814' : '1px solid #E5E5E5', background: selectedGender === 'man' ? '#462814/5' : 'transparent' }}>
                    <div className="flex items-center" style={{ gap: '14px' }}>
                      <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>♂</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>Man</span>
                    </div>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedGender === 'man' ? '6px solid #462814' : '2px solid #DDD' }} />
                  </div>
                  <div onClick={() => setSelectedGender('woman')} className="flex items-center justify-between cursor-pointer" style={{ padding: '18px 20px', borderRadius: '16px', border: selectedGender === 'woman' ? '2px solid #462814' : '1px solid #E5E5E5', background: selectedGender === 'woman' ? '#462814/5' : 'transparent' }}>
                    <div className="flex items-center" style={{ gap: '14px' }}>
                      <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>♀</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>Woman</span>
                    </div>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedGender === 'woman' ? '6px solid #462814' : '2px solid #DDD' }} />
                  </div>
                </div>

                <button onClick={handleStep2Continue} disabled={!selectedGender} className="w-full flex items-center justify-center transition-all" style={{ padding: '15px', borderRadius: '12px', background: selectedGender ? '#462814' : '#D4C9C0', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: selectedGender ? 'pointer' : 'not-allowed', marginTop: '28px' }}>
                  CONTINUE
                </button>
              </div>
            )}

            {/* ── MOBILE STEP 3 ── */}
            {currentStep === 3 && (
              <div className="animate-fade-in flex flex-col flex-1">
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#462814', fontFamily: 'var(--font-display)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '12px' }}>
                  What is your aesthetic?
                </h1>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, marginBottom: '20px' }}>
                  Select your favorite visual styles to curate your main feed.
                </p>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar" style={{ maxHeight: '400px' }}>
                  {aestheticsList.map((aes) => {
                    const isActive = selectedAesthetics.includes(aes.id);
                    return (
                      <div key={aes.id} onClick={() => handleToggleAesthetic(aes.id)} className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: '3/4', borderRadius: '14px', border: isActive ? '2px solid #462814' : '1px solid #E5E5E5' }}>
                        <Image src={aes.image} alt={aes.label} fill style={{ objectFit: 'cover' }} />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent" style={{ padding: '10px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{aes.label}</span>
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#462814', fontWeight: 800, fontSize: '14px' }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button onClick={handleFinishOnboarding} className="w-full flex items-center justify-center transition-all" style={{ padding: '15px', borderRadius: '12px', background: '#462814', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', marginTop: '20px', gap: '8px' }}>
                  <Sparkles size={14} />
                  FINISH PERSONALIZATION
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── DESKTOP VIEW ── */}
        <div className="hidden lg:flex items-center justify-center w-full" style={{ padding: '32px' }}>
        
        {/* Mobile Header — only on desktop now since mobile has its own */}
        <div className="absolute top-8 left-8 flex justify-between w-full pr-16 items-center">
          <QlozetLogo width={48} color="#121118" />
          <span className="text-xs font-extrabold text-[#9A95B6]">{currentStep}/3</span>
        </div>

        <div className="w-full max-w-[500px] flex flex-col relative z-10 animate-fade-in">
          
          {/* Header Progress indicator */}
          <div className="hidden lg:flex items-center justify-between mb-12">
            {/* Back button */}
            {currentStep > 1 ? (
              <button 
                onClick={() => setCurrentStep((prev) => (prev - 1) as OnboardStep)}
                className="text-xs text-[#8B5A2B] hover:underline font-bold flex items-center gap-1.5"
              >
                ➔ Back
              </button>
            ) : (
              <div></div>
            )}
            <span className="text-xs font-extrabold text-[#9A95B6] uppercase tracking-widest">{currentStep}/3</span>
          </div>

          {/* Progress Bars */}
          <div className="flex gap-2.5 mb-10">
            <span className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-[#4A2306]' : 'bg-[#121118]/10'}`} />
            <span className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-[#4A2306]' : 'bg-[#121118]/10'}`} />
            <span className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${currentStep >= 3 ? 'bg-[#4A2306]' : 'bg-[#121118]/10'}`} />
          </div>

          {/* ================= STEP 1: NOTIFICATIONS ================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-[#4A2306] uppercase tracking-wide font-display">
                  We would like to keep you updated
                </h1>
                <p className="text-sm text-[#5D5975] leading-relaxed">
                  We would like to send you notifications about the app. You can always disable it later in settings.
                </p>
              </div>

              {/* Notification Toggles List */}
              <div className="flex flex-col gap-4 mt-4">
                
                {/* 1. Discounts Toggle */}
                <div 
                  onClick={() => setNotifPreferences(prev => ({ ...prev, discounts: !prev.discounts }))}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${notifPreferences.discounts ? 'bg-[#4A2306]/5 border-[#4A2306]/20' : 'bg-transparent border-[#121118]/10 hover:bg-[#121118]/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-[#FF2E63]/10 text-[#FF2E63] flex items-center justify-center">
                      <Percent size={18} />
                    </span>
                    <span className="text-sm font-semibold text-[#121118]">
                      You&apos;ll be notified on our best discounts
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${notifPreferences.discounts ? 'bg-[#4A2306] border-[#4A2306] text-white' : 'border-[#121118]/25 text-transparent'}`}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                </div>

                {/* 2. Releases Toggle */}
                <div 
                  onClick={() => setNotifPreferences(prev => ({ ...prev, features: !prev.features }))}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${notifPreferences.features ? 'bg-[#4A2306]/5 border-[#4A2306]/20' : 'bg-transparent border-[#121118]/10 hover:bg-[#121118]/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                      <Bell size={18} />
                    </span>
                    <span className="text-sm font-semibold text-[#121118]">
                      You&apos;ll be notified on the latest feature releases
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${notifPreferences.features ? 'bg-[#4A2306] border-[#4A2306] text-white' : 'border-[#121118]/25 text-transparent'}`}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                </div>

                {/* 3. Collections Toggle */}
                <div 
                  onClick={() => setNotifPreferences(prev => ({ ...prev, collections: !prev.collections }))}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${notifPreferences.collections ? 'bg-[#4A2306]/5 border-[#4A2306]/20' : 'bg-transparent border-[#121118]/10 hover:bg-[#121118]/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center">
                      <ShoppingBag size={18} />
                    </span>
                    <span className="text-sm font-semibold text-[#121118]">
                      You&apos;ll be notified on the best collections available
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${notifPreferences.collections ? 'bg-[#4A2306] border-[#4A2306] text-white' : 'border-[#121118]/25 text-transparent'}`}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                </div>

              </div>

              <button 
                onClick={handleStep1Continue}
                className="w-full bg-[#4A2306] hover:bg-[#612F08] text-white font-bold py-4 rounded-xl shadow-lg mt-6 transition-all duration-300 uppercase tracking-widest text-xs"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* ================= STEP 2: PRODUCT TARGET ================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-[#4A2306] uppercase tracking-wide font-display">
                  What products do you use?
                </h1>
                <p className="text-sm text-[#5D5975] leading-relaxed">
                  To get the most out of this app and tailor your catalog feed, tell us what gender line you browse.
                </p>
              </div>

              {/* Man vs Woman Pills */}
              <div className="flex flex-col gap-4 mt-6">
                
                {/* Man pill */}
                <div 
                  onClick={() => setSelectedGender('man')}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${selectedGender === 'man' ? 'bg-[#4A2306]/5 border-[#4A2306] shadow-sm' : 'bg-transparent border-[#121118]/10 hover:bg-[#121118]/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-full bg-[#121118]/5 text-[#4A2306] flex items-center justify-center font-bold text-xl">
                      ♂
                    </span>
                    <span className="text-base font-bold text-[#121118]">
                      Man
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${selectedGender === 'man' ? 'border-[#4A2306] bg-[#4A2306]' : 'border-[#121118]/25'}`}>
                    {selectedGender === 'man' && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
                  </span>
                </div>

                {/* Woman pill */}
                <div 
                  onClick={() => setSelectedGender('woman')}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${selectedGender === 'woman' ? 'bg-[#4A2306]/5 border-[#4A2306] shadow-sm' : 'bg-transparent border-[#121118]/10 hover:bg-[#121118]/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-full bg-[#121118]/5 text-[#4A2306] flex items-center justify-center font-bold text-xl">
                      ♀
                    </span>
                    <span className="text-base font-bold text-[#121118]">
                      Woman
                    </span>
                  </div>
                  <span className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${selectedGender === 'woman' ? 'border-[#4A2306] bg-[#4A2306]' : 'border-[#121118]/25'}`}>
                    {selectedGender === 'woman' && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
                  </span>
                </div>

              </div>

              <button 
                onClick={handleStep2Continue}
                className={`w-full font-bold py-4 rounded-xl shadow-lg mt-8 transition-all duration-300 uppercase tracking-widest text-xs ${selectedGender ? 'bg-[#4A2306] text-white hover:bg-[#612F08]' : 'bg-[#121118]/10 text-[#9A95B6] cursor-not-allowed'}`}
                disabled={!selectedGender}
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* ================= STEP 3: AESTHETIC QUIZ ================= */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-[#4A2306] uppercase tracking-wide font-display">
                  What is your aesthetic?
                </h1>
                <p className="text-xs text-[#5D5975] leading-relaxed">
                  Select your favorite visual styles. This curates the recommendations shown in your main feed shelf.
                </p>
              </div>

              {/* Aesthetics Visual Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mt-2 overflow-y-auto max-h-[350px] pr-2">
                {aestheticsList.map((aes) => {
                  const isActive = selectedAesthetics.includes(aes.id);
                  return (
                    <div 
                      key={aes.id}
                      onClick={() => handleToggleAesthetic(aes.id)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:scale-102 ${isActive ? 'border-[#4A2306]' : 'border-[#121118]/10'}`}
                    >
                      {/* Image */}
                      <Image 
                        src={aes.image} 
                        alt={aes.label} 
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      {/* Card Overlay text */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2.5 text-[10px] font-bold text-white uppercase tracking-wider text-center">
                        {aes.label}
                      </div>

                      {/* White Active Check Overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center animate-fade-in">
                          <span className="w-9 h-9 rounded-full bg-white text-[#4A2306] flex items-center justify-center shadow-lg font-extrabold">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleFinishOnboarding}
                className="w-full bg-[#4A2306] hover:bg-[#612F08] text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>FINISH PERSONALIZATION</span>
              </button>
            </div>
          )}

        </div>
        </div>
      </div>

    </div>
  );
}
