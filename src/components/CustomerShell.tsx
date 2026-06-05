'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Footer } from '@/components/Footer';
import { QlozetLogo } from '@/components/QlozetLogo';
import { 
  Home, 
  Compass, 
  Sparkles, 
  Heart, 
  ShoppingCart, 
  User, 
  Search, 
  X,
  LogOut,
  ArrowRight,
  Image as ImageIcon,
  Scissors,
  Package,
  ChevronDown,
  Wand2
} from 'lucide-react';

interface CustomerShellProps {
  children: React.ReactNode;
}

const SEARCH_SUGGESTIONS = [
  "A comfortable wedding attire hot weather",
  "Cargo pants",
  "Silk agbada"
];

export const CustomerShell: React.FC<CustomerShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, cart, gender, setGender } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isAuthPage = pathname.startsWith('/auth');
  const isSearchPage = pathname.startsWith('/search');

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">{children}</div>;
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/products?search=${encodeURIComponent(suggestion)}`);
    setIsSearchFocused(false);
  };

  // Bottom tab items for mobile
  const mobileTabItems = [
    { href: '/', label: 'HOME', icon: Home, match: pathname === '/' },
    { href: '/products', label: 'DISCOVER', icon: Compass, match: pathname.startsWith('/products') },
    { href: '/bespoke', label: 'BESPOKE', icon: Scissors, match: pathname.startsWith('/bespoke') },
    { href: '/cart', label: 'CART', icon: ShoppingCart, match: pathname === '/cart' },
    { href: user ? '/profile' : '/auth/login', label: 'PROFILE', icon: User, match: pathname === '/profile' },
  ];

  const isStudio = pathname.startsWith('/bespoke/studio');

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white text-[#1a1a1a] font-body hide-scrollbar">
        
        {/* ── Mobile Top Bar ── */}
        {!isStudio && (
        <header
          className="flex items-center justify-between flex-shrink-0 sticky top-0 z-50 bg-white/95 backdrop-blur-md"
          style={{ padding: '20px 16px 12px 16px', borderBottom: '1px solid #F2F2F2' }}
        >
          {/* Left — Gender Toggle */}
          <button
            onClick={() => setGender(gender === 'male' ? 'female' : 'male')}
            className="flex items-center"
            style={{ gap: '4px', fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {gender === 'male' ? 'MEN' : 'WOMEN'}
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          {/* Center — QLOZET Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <QlozetLogo width={42} color="#2C1810" />
          </Link>

          {/* Right — Action Icons */}
          <div className="flex items-center" style={{ gap: '16px' }}>
            <Link href="/wishlist" className="relative text-[#1A1A1A]">
              <Heart size={20} strokeWidth={1.8} />
            </Link>
          </div>
        </header>
        )}

        {/* ── Mobile Content ── */}
        <main className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingBottom: isStudio ? '0' : '72px' }}>
          <div style={{ padding: isStudio ? '0' : '24px 20px 20px 20px' }}>
            {children}
          </div>
          {!isSearchPage && !isStudio && (
            <div style={{ padding: '20px' }}>
              <Footer />
            </div>
          )}
        </main>

        {/* ── Floating Search Button — above bottom bar, right side ── */}
        {!isStudio && (
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="fixed z-50 flex items-center justify-center transition-all active:scale-90"
          style={{
            bottom: '90px',
            right: '20px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: isSearchPage ? '#2C1810' : '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            border: isSearchPage ? 'none' : '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
          }}
        >
          {isSearchPage
            ? <Wand2 size={20} strokeWidth={2} color="#FFFFFF" />
            : <Search size={20} strokeWidth={2} color="#1A1A1A" />
          }
        </button>
        )}

        {/* ── Mobile Search Overlay ── */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
            {/* Search Header */}
            <div className="flex items-center" style={{ padding: '20px 16px', gap: '12px', borderBottom: '1px solid #F2F2F2' }}>
              <form
                onSubmit={handleSearchSubmit}
                className="flex-1 flex items-center rounded-full"
                style={{ padding: '10px 16px', gap: '10px', background: isSearchPage ? '#F0EDE8' : '#F5F5F5' }}
              >
                {isSearchPage
                  ? <Wand2 size={18} strokeWidth={2} color="#D4AF37" />
                  : <Search size={18} strokeWidth={2} color="#999" />
                }
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSearchPage ? 'Ask anything about fashion...' : 'What are you looking for?'}
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#111] placeholder-[#999]"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none', padding: 0 }}
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-[#999]">
                    <X size={16} />
                  </button>
                )}
              </form>
              <button
                onClick={() => setMobileSearchOpen(false)}
                style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '24px 20px' }}>
              <div className="flex flex-col" style={{ gap: '16px' }}>
                <span className="text-[12px] font-extrabold text-[#1A1A1A] tracking-wide uppercase">Suggestions</span>
                <div className="flex flex-col" style={{ gap: '10px' }}>
                  {SEARCH_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => { handleSuggestionClick(suggestion); setMobileSearchOpen(false); }}
                      className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#333] text-[13px] font-medium rounded-full transition-colors text-left"
                      style={{ padding: '12px 20px' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#F5F5F5] rounded-[16px]" style={{ padding: '16px 20px', marginTop: '28px' }}>
                <p className="text-[11.5px] text-[#888] leading-[1.6] font-semibold text-left">
                  Learn more on how we use your data to give you a personalized experience. Recommendations are for information purposes only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Bottom Tab Bar ── */}
        {!isStudio && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white flex items-center justify-around"
          style={{ height: '64px', borderRadius: '50px', margin: '0 12px 10px 12px', boxShadow: '0 -2px 20px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {mobileTabItems.map((tab) => {
            const IconComp = tab.icon;
            return (
              <Link
                key={tab.href + tab.label}
                href={tab.href}
                className="flex flex-col items-center justify-center relative"
                style={{ gap: '4px', flex: 1 }}
              >
                <div className="relative">
                  <IconComp
                    size={20}
                    strokeWidth={tab.match ? 0 : 1.8}
                    fill={tab.match ? '#2C1810' : 'none'}
                    color={tab.match ? '#2C1810' : '#AAAAAA'}
                  />
                  {tab.label === 'CART' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#FF2E63] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: tab.match ? 800 : 600,
                    color: tab.match ? '#2C1810' : '#AAAAAA',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ lg) — unchanged
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-[#F0F0F0] text-[#1a1a1a] font-body" style={{ padding: '24px 24px 24px 0' }}>
        
        {/* 1. SIDEBAR (Left Navigation) - On grey background */}
        <aside className="w-[100px] flex-shrink-0 flex flex-col items-center justify-between py-8" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <QlozetLogo width={46} color="#2C1810" />
          </Link>

          {/* Navigation Icons */}
          <nav className="flex flex-col gap-6">
            <Link 
              href="/" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname === '/' ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <Home size={22} fill={pathname === '/' ? 'currentColor' : 'none'} strokeWidth={pathname === '/' ? 0 : 2} />
            </Link>
            
            <Link 
              href="/products" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname.startsWith('/products') ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <Compass size={22} fill={pathname.startsWith('/products') ? 'currentColor' : 'none'} strokeWidth={pathname.startsWith('/products') ? 0 : 2} />
            </Link>

            <Link 
              href="/bespoke" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname.startsWith('/bespoke') ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <ImageIcon size={22} fill={pathname.startsWith('/bespoke') ? 'currentColor' : 'none'} strokeWidth={pathname.startsWith('/bespoke') ? 0 : 2} />
            </Link>

            <Link 
              href="/wishlist" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname === '/wishlist' ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <Heart size={22} fill={pathname === '/wishlist' ? 'currentColor' : 'none'} strokeWidth={pathname === '/wishlist' ? 0 : 2} />
            </Link>

            <Link 
              href="/cart" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all relative ${pathname === '/cart' ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <ShoppingCart size={22} fill={pathname === '/cart' ? 'currentColor' : 'none'} strokeWidth={pathname === '/cart' ? 0 : 2} />
              {cartCount > 0 && (
                <span className="absolute 0 top-1 right-1 bg-[#FF2E63] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* User Account / Profile */}
          <div className="flex flex-col gap-6 items-center">
            <Link 
              href={user ? '/profile' : '/auth/login'} 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname === '/profile' ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <User size={22} fill={pathname === '/profile' ? 'currentColor' : 'none'} strokeWidth={pathname === '/profile' ? 0 : 2} />
            </Link>
          </div>
        </aside>

        {/* Main Structural Container - Big White Card */}
        <div className={`flex-1 bg-white rounded-[40px] shadow-xl flex flex-col ${isStudio ? 'overflow-hidden' : 'overflow-y-auto'} relative border border-gray-200 hide-scrollbar`}>
          <main className={`flex-1 flex flex-col w-full h-full min-h-min ${isStudio ? 'overflow-hidden' : ''}`} style={{ padding: isStudio ? '0' : '40px' }}>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            {!isSearchPage && !isStudio && (
              <div className="w-full" style={{ marginTop: 'auto', paddingTop: '80px' }}>
                <Footer />
              </div>
            )}
          </main>

          {/* ── Sticky Search Bar — fixed at bottom center of this container ── */}
          {!isStudio && (
          <div
            className="sticky z-40 flex justify-center"
            style={{
              bottom: '24px',
              padding: '0 40px',
              pointerEvents: 'none',
            }}
          >
            <div className="w-full max-w-[600px] relative" style={{ pointerEvents: 'auto' }}>
              
              {/* Drop-Up Suggestions — appears ABOVE the search bar */}
              <div
                className={`absolute left-0 w-full bg-white rounded-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col transition-all origin-bottom ${isSearchFocused ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 translate-y-2 pointer-events-none'}`}
                style={{ bottom: '100%', marginBottom: '12px', padding: '24px', gap: '20px', transitionDuration: '0.35s' }}
              >
                <div className="flex flex-col text-left" style={{ gap: '12px' }}>
                  <span className="text-[13px] font-extrabold text-[#111111] tracking-wide ml-2">Suggestions</span>
                  <div className="flex flex-col items-start" style={{ gap: '10px' }}>
                    {SEARCH_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#333333] text-[13px] font-medium rounded-full transition-colors text-left"
                        style={{ padding: '10px 20px' }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F2F2F2] rounded-[16px]" style={{ padding: '16px 20px', marginTop: '8px' }}>
                  <p className="text-[11.5px] text-[#888888] leading-[1.6] font-semibold text-left">
                    Learn more on how we use your data to give you a personalized experience. Recommendation are information purposes only.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className={`w-full bg-white rounded-full flex items-center transition-all duration-300 ${isSearchFocused ? 'shadow-[0_4px_30px_rgba(0,0,0,0.12)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}`}
                style={{ padding: '6px 6px 6px 24px', border: '1px solid #EBEBEB' }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="What fit looking for today ?"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#111111] placeholder-[#999]"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
                />
                <button
                  type="submit"
                  className="w-[40px] h-[40px] rounded-full bg-[#381F10] text-white flex items-center justify-center hover:bg-[#201007] transition-transform active:scale-95 shrink-0"
                  style={{ marginLeft: '12px' }}
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
          )}
        </div>

      </div>
    </>
  );
};
