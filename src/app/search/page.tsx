'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useVendors } from '@/hooks/useVendors';
import { getProductName, getProductImage, getProductPrice, getProductOriginalPrice, getProductTag, hasDiscount } from '@/lib/api-types';
import type { ApiProduct } from '@/lib/api-types';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import {
  Search,
  List,
  Clock,
  PenLine,
  ChevronRight,
  Star,
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

// ─── LLM Demo Response ───────────────────────────────────────
interface LLMSection {
  title: string;
  subtitle: string;
  productIds: string[];
}

const LLM_RESPONSE = {
  title: 'Best African fashion pieces for your style',
  summary: 'African fashion is a beautiful blend of heritage and modern design. The best approach focuses on statement pieces: items that showcase authentic craftsmanship (hand-embroidered agbadas, bespoke kaftans), premium quality fabrics (genuine ankara, silk blends), and versatile accessories (leather bags, traditional accents).',
  sections: [
    {
      title: 'Bespoke agbada collection',
      subtitle: 'Hand-crafted luxury traditional wear for special occasions',
      productIds: ['prod_1', 'prod_2'],
    },
    {
      title: 'Premium kaftan essentials',
      subtitle: 'Modern silhouettes with traditional fabric techniques',
      productIds: ['prod_3', 'prod_4'],
    },
    {
      title: 'Fabric and accessories',
      subtitle: 'Premium textiles and leather goods to complete your look',
      productIds: ['prod_5', 'prod_6', 'prod_7', 'prod_8'],
    },
  ] as LLMSection[],
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { wishlist, toggleWishlist } = useApp();
  const trackEvent = useTrackEvent();

  // Toggle: 'search' for product results, 'ai' for LLM response
  const [viewMode, setViewMode] = useState<'search' | 'ai'>('search');
  const [showSteps, setShowSteps] = useState(false);

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
  const { vendors: allVendors, loading: vendorsLoading } = useVendors({ limit: 6 });

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
      {/* Vendor Results */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
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
                <div className="relative w-full overflow-visible bg-[#F5F5F5]" style={{ height: '110px' }}>
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
                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FFFFFF', border: '3px solid #FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
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

      {/* Item Results */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
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

  // ═══════════════════════════════════════════════════════════
  //  AI / LLM RESPONSE VIEW
  // ═══════════════════════════════════════════════════════════
  const renderAIResponse = () => (
    <div className="animate-fade-in flex flex-col mx-auto w-full" style={{ gap: '28px', maxWidth: '800px' }}>
      {/* Title */}
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>
        {LLM_RESPONSE.title}
      </h2>

      {/* Assistant steps toggle */}
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="flex items-center self-start transition-all hover:opacity-70"
        style={{ gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#D4AF37', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Assistant steps
        </span>
        <ChevronRight size={14} color="#D4AF37" style={{ transform: showSteps ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {showSteps && (
        <div className="animate-fade-in" style={{ padding: '16px 20px', borderRadius: '14px', background: '#F8F6F3', border: '1px solid rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
            Searching product catalog... → Filtering by relevance... → Categorizing results... → Generating recommendations...
          </p>
        </div>
      )}

      {/* Summary paragraph */}
      <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.75, maxWidth: '700px' }}>
        {LLM_RESPONSE.summary}
      </p>

      {/* Product sections */}
      {LLM_RESPONSE.sections.map((section, sIdx) => {
        const sectionProducts = section.productIds
          .map((id) => allProducts.find((p) => p._id === id))
          .filter(Boolean) as ApiProduct[];

        return (
          <div key={sIdx}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>
              {section.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#2D6A4F', fontWeight: 500, marginBottom: '16px' }}>
              {section.subtitle}
            </p>
            <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '14px', paddingBottom: '4px' }}>
              {sectionProducts.map((product) => (
                <div key={product._id} style={{ minWidth: '160px', maxWidth: '180px', flexShrink: 0 }}>
                  <ProductCard
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
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-[80vh] py-4 lg:py-6 animate-fade-in">
      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
        {/* History icon */}
        <button
          className="flex items-center justify-center transition-all hover:bg-[#F5F5F5] active:scale-90"
          style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <Clock size={18} color="#1A1A1A" />
        </button>

        {/* Toggle: Search / AI */}
        <div className="flex items-center" style={{ gap: '0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', background: '#FFFFFF' }}>
          <button
            onClick={() => setViewMode('search')}
            className="flex items-center justify-center transition-all"
            style={{
              width: '44px',
              height: '38px',
              background: viewMode === 'search' ? '#1A1A1A' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Search size={16} color={viewMode === 'search' ? '#FFFFFF' : '#999'} />
          </button>
          <button
            onClick={() => setViewMode('ai')}
            className="flex items-center justify-center transition-all"
            style={{
              width: '44px',
              height: '38px',
              background: viewMode === 'ai' ? '#1A1A1A' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <List size={16} color={viewMode === 'ai' ? '#FFFFFF' : '#999'} />
          </button>
        </div>

        {/* Compose icon */}
        <button
          className="flex items-center justify-center transition-all hover:bg-[#F5F5F5] active:scale-90"
          style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <PenLine size={18} color="#1A1A1A" />
        </button>
      </div>

      {/* ─── Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center" style={{ paddingBottom: '20px' }}>
        <div className="w-full" style={{ maxWidth: viewMode === 'ai' ? '800px' : undefined }}>
          {viewMode === 'search' ? renderSearchResults() : renderAIResponse()}
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
        <span className="w-8 h-8 rounded-full border-2 border-[#2C1810]/20 border-t-[#2C1810] animate-spin"></span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
