'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Wand2,
  LayoutGrid
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

  // Track top search visibility on Home page gender selection screen
  const [isTopSearchVisible, setIsTopSearchVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== '/') {
      setIsTopSearchVisible(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const setupObserver = () => {
      const el = document.getElementById('homepage-top-search');
      const container = scrollContainerRef.current;
      if (el && container) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setIsTopSearchVisible(entry.isIntersecting);
          },
          { 
            root: container,
            threshold: 0 
          }
        );
        observer.observe(el);
      } else {
        timeoutId = setTimeout(setupObserver, 100);
      }
    };

    setupObserver();

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  const isAuthPage = pathname.startsWith('/auth');
  const isSearchPage = pathname.startsWith('/search');
  const isStudio = pathname.startsWith('/bespoke/studio');
  const isVendorPage = pathname.startsWith('/vendor');
  const isProductDetailPage = /^\/products\/[^/]+$/.test(pathname);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart bounce animation on count change
  const prevCartCount = useRef(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(t);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">{children}</div>;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isSearchPage) {
        // On search page: dispatch event so the page can route to search or AI
        window.dispatchEvent(new CustomEvent('shell-search', { detail: searchQuery.trim() }));
        setSearchQuery('');
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchFocused(false);
  };

  // Bottom tab items for mobile
  const mobileTabItems = [
    { href: '/', label: 'HOME', icon: Home, match: pathname === '/' },
    { href: '/discover', label: 'DISCOVER', icon: LayoutGrid, match: pathname.startsWith('/discover') },
    { href: '/bespoke', label: 'BESPOKE', icon: Scissors, match: pathname.startsWith('/bespoke') },
    { href: '/cart', label: 'CART', icon: ShoppingCart, match: pathname === '/cart' },
    { href: user ? '/profile' : '/auth/login', label: 'PROFILE', icon: User, match: pathname === '/profile' },
  ];


  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          MOBILE LAYOUT (< lg)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="lg:hidden flex flex-col min-h-screen font-body hide-scrollbar"
        style={{ background: isVendorPage ? '#1a1206' : 'var(--bg-surface)', color: 'var(--text-primary)' }}
      >
        
        {/* ── Mobile Top Bar ── */}
        {!isStudio && !isVendorPage && (
        <header
          className="flex items-center justify-between flex-shrink-0 sticky top-0 z-50 backdrop-blur-md"
          style={{ padding: '20px 20px 12px 20px', borderBottom: '1px solid var(--border-glass)', background: 'var(--glass-bg)' }}
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
        <main className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingBottom: isStudio ? '0' : isSearchPage ? '140px' : '72px' }}>
          <div style={{ padding: isStudio || isVendorPage ? '0' : '24px 20px 20px 20px' }}>
            {children}
          </div>
          {!isSearchPage && !isStudio && !isVendorPage && (
            <div style={{ padding: '20px' }}>
              <Footer />
            </div>
          )}
        </main>

        {/* ── Floating Search Button — navigates to /search on non-search pages ── */}
        {!isStudio && !isSearchPage && (
        <button
          onClick={() => router.push('/search')}
          className="fixed z-50 flex items-center justify-center transition-all active:scale-90"
          style={{
            bottom: '90px',
            right: '20px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
          }}
        >
          <Search size={20} strokeWidth={2} color="#1A1A1A" />
        </button>
        )}

        {/* ── Bottom Search Bar — only on /search page, above tab bar ── */}
        {isSearchPage && !isStudio && (
          <div
            className="fixed left-0 right-0 z-50"
            style={{ bottom: '84px' }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center"
              style={{
                padding: '8px 8px 8px 18px',
                gap: '8px',
                margin: '0 12px',
                background: '#FFFFFF',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Search size={18} strokeWidth={2} color="#AAAAAA" className="flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about fashion..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#1A1A1A] placeholder-[#999]"
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none', padding: 0, minWidth: 0 }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="flex-shrink-0" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <X size={16} color="#AAAAAA" />
                </button>
              )}
              <button
                type="submit"
                className="flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#2C1810',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowRight size={18} strokeWidth={2.5} color="#FFFFFF" />
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile Bottom Tab Bar ── */}
        {!isStudio && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
          style={{ height: '64px', borderRadius: '50px', margin: '0 12px 10px 12px', boxShadow: 'var(--shadow-md)', paddingBottom: 'env(safe-area-inset-bottom)', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}
        >
          {mobileTabItems.map((tab) => {
            const IconComp = tab.icon;
            return (
              <Link
                key={tab.href + tab.label}
                href={tab.href}
                className="flex items-center justify-center"
                style={{ flex: 1, padding: '8px 0' }}
              >
                <div className="relative flex items-center justify-center">
                  {tab.label === 'CART' && cartCount > 0 ? (
                    <div
                      className="flex items-center justify-center relative"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#2C1810',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: cartBounce ? 'scale(1.25)' : 'scale(1)',
                      }}
                    >
                      <ShoppingCart size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                      <span
                        className="absolute flex items-center justify-center font-bold"
                        style={{
                          top: '-4px', right: '-4px',
                          width: '16px', height: '16px',
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          fontSize: '9px',
                          color: '#2C1810',
                          lineHeight: 1,
                          border: '2px solid #2C1810',
                        }}
                      >
                        {cartCount}
                      </span>
                    </div>
                  ) : (
                    <IconComp
                      size={24}
                      strokeWidth={tab.match ? 0 : 1.6}
                      fill={tab.match ? '#2C1810' : 'none'}
                      color={tab.match ? '#2C1810' : '#AAAAAA'}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥ lg) — unchanged
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-screen overflow-hidden font-body" style={{ padding: '24px 24px 24px 0', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        
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
              href="/discover" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname.startsWith('/discover') ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <LayoutGrid size={22} fill={pathname.startsWith('/discover') ? 'currentColor' : 'none'} strokeWidth={pathname.startsWith('/discover') ? 0 : 2} />
            </Link>

            <Link 
              href="/bespoke" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname.startsWith('/bespoke') ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <Scissors size={22} fill={pathname.startsWith('/bespoke') ? 'currentColor' : 'none'} strokeWidth={pathname.startsWith('/bespoke') ? 0 : 2} />
            </Link>

            <Link 
              href="/wishlist" 
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${pathname === '/wishlist' ? 'text-[#2C1810]' : 'text-gray-400 hover:text-[#2C1810]'}`}
            >
              <Heart size={22} fill={pathname === '/wishlist' ? 'currentColor' : 'none'} strokeWidth={pathname === '/wishlist' ? 0 : 2} />
            </Link>

            <Link 
              href="/cart" 
              className="flex items-center justify-center transition-all"
              style={{ padding: '3px' }}
            >
              {cartCount > 0 ? (
                <div
                  className="flex items-center justify-center relative"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#2C1810',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: cartBounce ? 'scale(1.25)' : 'scale(1)',
                  }}
                >
                  <ShoppingCart size={20} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  <span
                    className="absolute flex items-center justify-center font-bold"
                    style={{
                      top: '-3px', right: '-3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      fontSize: '10px',
                      color: '#2C1810',
                      lineHeight: 1,
                      border: '2px solid #2C1810',
                    }}
                  >
                    {cartCount}
                  </span>
                </div>
              ) : (
                <div className="p-3">
                  <ShoppingCart size={22} fill={pathname === '/cart' ? 'currentColor' : 'none'} strokeWidth={pathname === '/cart' ? 0 : 2} color={pathname === '/cart' ? '#2C1810' : '#9CA3AF'} />
                </div>
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
        <div
          ref={scrollContainerRef}
          className={`flex-1 ${isVendorPage ? 'bg-[#1a1206] border-none' : 'border'} rounded-[40px] shadow-xl flex flex-col ${isStudio ? 'overflow-hidden' : 'overflow-y-auto'} relative hide-scrollbar`}
          style={isVendorPage ? undefined : { background: 'var(--bg-surface)', borderColor: 'var(--border-glass)' }}
        >
          <main className={`flex-1 flex flex-col w-full h-full min-h-min ${isStudio ? 'overflow-hidden' : ''}`} style={{ padding: isStudio || isVendorPage ? '0' : '40px' }}>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            {!isSearchPage && !isStudio && !isVendorPage && (
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
              opacity: isTopSearchVisible ? 0 : 1,
              transform: isTopSearchVisible ? 'translateY(100px)' : 'translateY(0)',
              transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="w-full max-w-[600px] relative" style={{ pointerEvents: isTopSearchVisible ? 'none' : 'auto' }}>
              
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
                className={`w-full rounded-full flex items-center transition-all duration-300 ${isSearchFocused ? 'shadow-[0_4px_30px_rgba(0,0,0,0.12)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.06)]'}`}
                style={{ padding: '6px 6px 6px 24px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface)' }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="What are you looking for today?"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium placeholder-[#999]"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none' }}
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
