'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import { getProductName, getProductImage, getProductPrice, getProductOriginalPrice, getProductTag, hasDiscount } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { useAskFashion } from '@/hooks/useRecommendations';
import { Markdown } from '@/components/Markdown';
import {
  Search,
  List,
  Clock,
  PenLine,
  ChevronRight,
  Star,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// ─── Helpers ──────────────────────────────────────────────────
function darkenHex(hex: string, amount: number = 0.65): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

// ─── Vendor data — use live vendors ───────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const { wishlist, toggleWishlist } = useApp();
  const trackEvent = useTrackEvent();
  const { ask, response: aiResponse, loading: aiLoading, error: aiError, reset: resetAI, history: chatHistory } = useAskFashion();

  // Toggle: 'search' for product results, 'ai' for AI response
  const [viewMode, setViewMode] = useState<'search' | 'ai'>('search');
  const [showSteps, setShowSteps] = useState(false);

  // When toggling to AI mode with an existing query, fire ask once
  const handleSetViewMode = (mode: 'search' | 'ai') => {
    setViewMode(mode);
    if (mode === 'ai' && query && chatHistory.length === 0) {
      ask(query);
    }
  };

  // Track search event when query changes
  useEffect(() => {
    if (query) {
      trackEvent({
        eventType: 'search',
        metadata: { query },
        context: { surface: 'search_page' },
      });
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const { products: allProducts, loading: productsLoading } = useProducts({ search: query || undefined, size: 50 });
  // Vendors reflect the same search as the items: matched by their own fields
  // or by having products that match the query.
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 6, search: query || undefined });

  // Map vendors for display
  const DEMO_VENDORS = allVendors.slice(0, 6).map((v) => ({
    id: v._id,
    name: v.business_name,
    rating: v.average_rating ?? 0,
    reviews: v.total_ratings ?? 0,
    image: v.cover_image_url || '/image/bespoke-agbada-orange.webp',
    logoImage: v.business_logo_url,
    logoInitials: v.business_name.slice(0, 2).toUpperCase(),
    themeColor: v.theme_color || '#2C1810',
  }));

  const filteredProducts = allProducts;

  // ═══════════════════════════════════════════════════════════
  //  SEARCH RESULTS VIEW
  // ═══════════════════════════════════════════════════════════
  const renderSearchResults = () => (
    <div className="animate-fade-in flex flex-col" style={{ gap: '32px' }}>
      {/* Vendor Results — only shown when the search matches vendors */}
      {(vendorsLoading || DEMO_VENDORS.length > 0) && (
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Vendors Results
        </h2>
        <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '16px', paddingBottom: '4px' }}>
          {DEMO_VENDORS.map((vendor) => {
            const tcClean2 = vendor.themeColor.replace('#', '');
            const tcR2 = parseInt(tcClean2.substring(0, 2), 16);
            const tcG2 = parseInt(tcClean2.substring(2, 4), 16);
            const tcB2 = parseInt(tcClean2.substring(4, 6), 16);
            const brightness2 = (tcR2 * 299 + tcG2 * 587 + tcB2 * 114) / 1000;
            const isLightTheme2 = brightness2 > 180;

            const bgThemeColor = isLightTheme2 ? darkenHex(vendor.themeColor, 0.05) : darkenHex(vendor.themeColor, 0.70);
            const textColor = isLightTheme2 ? '#1a1a1a' : '#ffffff';
            const secondaryColor = isLightTheme2 ? 'rgba(26,26,26,0.85)' : 'rgba(255,255,255,0.85)';
            const tertiaryColor = isLightTheme2 ? 'rgba(26,26,26,0.6)' : 'rgba(255,255,255,0.6)';

            return (
              <Link
                key={vendor.id}
                href={`/vendor/${vendor.id}`}
                className="flex flex-col flex-shrink-0 transition-transform hover:-translate-y-1"
                style={{
                  width: '170px',
                  textDecoration: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  background: 'transparent',
                }}
              >
                {/* Vendor image wrapper */}
                <div className="relative w-full overflow-visible bg-[var(--bg-surface-elevated)]" style={{ height: '110px' }}>
                  <Image
                    src={vendor.image}
                    alt={vendor.name}
                    fill
                    style={{
                      objectFit: 'cover',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                    }}
                    sizes="170px"
                  />
                  
                  {/* Logo overlay */}
                  <div
                    className="absolute flex items-center justify-center overflow-hidden"
                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-base)', border: '3px solid var(--bg-base)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
                  >
                    {vendor.logoImage ? (
                      <div className="relative w-full h-full">
                        <Image src={vendor.logoImage} alt={vendor.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 900, color: vendor.themeColor, fontFamily: 'Outfit, sans-serif' }}>
                        {vendor.logoInitials}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vendor info bottom container (with the theme color) */}
                <div
                  className="text-center flex flex-col items-center"
                  style={{
                    background: bgThemeColor,
                    padding: '28px 12px 14px',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                    gap: '4px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: textColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'Outfit, sans-serif',
                      margin: 0,
                    }}
                  >
                    {vendor.name}
                  </p>
                  <div className="flex items-center justify-center" style={{ gap: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: secondaryColor,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {vendor.rating}
                    </span>
                    <Star size={10} color="#D4AF37" fill="#D4AF37" />
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: tertiaryColor,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      ({vendor.reviews})
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      )}

      {/* Item Results */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Item Results
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 lg:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              imageUrl={getProductImage(product)}
              title={getProductName(product)}
              brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
              price={getProductPrice(product)}
              originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
              tag={getProductTag(product)}
              isFavorite={wishlist.includes(product._id)}
              onFavoriteToggle={(id) => toggleWishlist(id as string)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════
  //  AI / ASK RESPONSE VIEW (Chat Thread)
  // ═════════════════════════════════════════════════════════
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length, aiLoading]);

  // Listen for search submissions from the bottom bar (CustomerShell)
  useEffect(() => {
    const handleShellSearch = (e: Event) => {
      const query = (e as CustomEvent).detail as string;
      if (!query) return;
      if (viewMode === 'ai') {
        // AI mode: send to Ask
        ask(query);
      } else {
        // Search mode: update URL for product search
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    };
    window.addEventListener('shell-search', handleShellSearch);
    return () => window.removeEventListener('shell-search', handleShellSearch);
  }, [viewMode, ask, router]);

  const renderAIResponse = () => {
    const aiProducts = aiResponse?.products ?? [];
    const hasHistory = chatHistory.length > 0;

    return (
      <div className="flex flex-col h-full" style={{ minHeight: '60vh' }}>
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '16px' }}>
          {/* Empty state */}
          {!hasHistory && !aiLoading && (
            <div className="flex flex-col items-center justify-center" style={{ gap: '12px', padding: '60px 20px' }}>
              <PenLine size={24} color="#D4AF37" />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Ask me anything about fashion!<br />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>e.g. &quot;Show me agbada styles under 100k&quot;</span>
              </p>
            </div>
          )}

          {/* Conversation thread */}
          {hasHistory && (
            <div className="flex flex-col mx-auto w-full" style={{ gap: '20px', maxWidth: '800px' }}>
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.role === 'user' ? '85%' : '95%',
                  }}
                >
                  {msg.role === 'user' ? (
                    /* User message bubble */
                    <div style={{
                      background: 'var(--brand-fill)',
                      color: 'var(--brand-fill-text)',
                      padding: '12px 18px',
                      borderRadius: '20px 20px 4px 20px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    /* Assistant message */
                    <div style={{
                      background: 'var(--bg-surface-elevated)',
                      padding: '14px 18px',
                      borderRadius: '20px 20px 20px 4px',
                      fontSize: '14px',
                      lineHeight: 1.75,
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                    }}>
                      <Markdown content={msg.content} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {aiLoading && (
            <div className="animate-fade-in flex items-center" style={{ gap: '8px', padding: '16px 0', maxWidth: '800px', margin: '0 auto' }}>
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '4px' }}>Thinking...</span>
            </div>
          )}

          {/* Error */}
          {aiError && (
            <div className="animate-fade-in flex items-center" style={{ gap: '8px', padding: '12px 0', maxWidth: '800px', margin: '0 auto' }}>
              <p style={{ fontSize: '14px', color: '#CC3333' }}>{aiError}</p>
              <button
                onClick={() => { resetAI(); }}
                style={{ fontSize: '13px', color: '#D4AF37', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Products from latest response */}
          {aiProducts.length > 0 && !aiLoading && (
            <div className="animate-fade-in mx-auto w-full" style={{ maxWidth: '800px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Recommended for you
              </h3>
              <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '14px', paddingBottom: '4px' }}>
                {aiProducts.map((item: any) => {
                  const product = item.product || item;
                  const productId = product._id || item.itemId;
                  return (
                    <div key={productId} style={{ minWidth: '160px', maxWidth: '180px', flexShrink: 0 }}>
                      <ProductCard
                        id={productId}
                        imageUrl={getProductImage(product)}
                        title={getProductName(product)}
                        brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
                        price={getProductPrice(product)}
                        originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
                        tag={getProductTag(product)}
                        isFavorite={wishlist.includes(productId)}
                        onFavoriteToggle={(id) => toggleWishlist(id as string)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-[80vh] py-4 lg:py-6 animate-fade-in">
      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
        {/* History icon */}
        <button
          className="flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
          style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
        >
          <Clock size={18} color="var(--text-primary)" />
        </button>

        {/* Toggle: Search / AI */}
        <div className="flex items-center" style={{ gap: '0', borderRadius: '12px', border: '1px solid var(--border-glass)', overflow: 'hidden', background: 'var(--bg-base)' }}>
          <button
            onClick={() => handleSetViewMode('search')}
            className="flex items-center justify-center transition-all"
            style={{
              width: '44px',
              height: '38px',
              background: viewMode === 'search' ? 'var(--brand-fill)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Search size={16} color={viewMode === 'search' ? 'var(--brand-fill-text)' : 'var(--text-muted)'} />
          </button>
          <button
            onClick={() => handleSetViewMode('ai')}
            className="flex items-center justify-center transition-all"
            style={{
              width: '44px',
              height: '38px',
              background: viewMode === 'ai' ? 'var(--brand-fill)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <List size={16} color={viewMode === 'ai' ? 'var(--brand-fill-text)' : 'var(--text-muted)'} />
          </button>
        </div>

        {/* Compose icon — new conversation */}
        <button
          onClick={() => { resetAI(); }}
          className="flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
          style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
        >
          <PenLine size={18} color="var(--text-primary)" />
        </button>
      </div>

      {/* ─── Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center" style={{ paddingBottom: '20px' }}>
        <div className="w-full" style={{ maxWidth: viewMode === 'ai' ? '800px' : undefined }}>
          {!query ? (
            /* ─── Suggestions — shown when no query yet ─── */
            <div className="flex flex-col items-center animate-fade-in" style={{ gap: '32px', paddingTop: '40px' }}>
              <div className="flex flex-col items-center" style={{ gap: '8px' }}>
                <Wand2 size={28} color="#D4AF37" strokeWidth={1.5} />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>
                  What are you looking for?
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                  Search for products or ask our AI stylist anything about fashion
                </p>
              </div>

              <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '400px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Try asking
                </span>
                {[
                  "A comfortable wedding attire for hot weather",
                  "Show me red dresses under 50k",
                  "Cargo pants",
                  "Silk agbada for a naming ceremony",
                  "Ankara styles for a date night",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(suggestion)}`)}
                    className="flex items-center transition-colors text-left"
                    style={{
                      padding: '14px 20px',
                      gap: '12px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Search size={14} color="var(--text-muted)" className="flex-shrink-0" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            viewMode === 'search' ? renderSearchResults() : renderAIResponse()
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-[var(--border-glass)] border-t-[var(--brand-brown)] animate-spin"></span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
