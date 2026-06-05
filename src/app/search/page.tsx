'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { productCatalog } from '@/data/products';
import {
  Search,
  List,
  Clock,
  PenLine,
  ChevronRight,
  Star,
} from 'lucide-react';
import Image from 'next/image';

// ─── Vendor data ──────────────────────────────────────────────
const DEMO_VENDORS = [
  { id: 'v1', name: 'POPWAVE', rating: 4.4, reviews: 500, image: '/image/ankara.png', logo: '' },
  { id: 'v2', name: 'EBELEWE BROWN', rating: 4.4, reviews: 500, image: '/image/bespoke-agbada-lime.webp', logo: 'EB' },
  { id: 'v3', name: 'AFRICANA COUTURE', rating: 4.4, reviews: 500, image: '/image/bespoke-agbada-orange.webp', logo: '' },
  { id: 'v4', name: 'GARM ISLAND', rating: 4.4, reviews: 500, image: '/image/bespoke-kaftan-brown-1.png', logo: 'GI' },
  { id: 'v5', name: 'QLOZET', rating: 4.4, reviews: 500, image: '/image/qlozet-bag.png', logo: '' },
  { id: 'v6', name: 'ROCK HOUSE', rating: 4.4, reviews: 500, image: '/image/bag.webp', logo: '' },
];

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

  // Toggle: 'search' for product results, 'ai' for LLM response
  const [viewMode, setViewMode] = useState<'search' | 'ai'>('search');
  const [showSteps, setShowSteps] = useState(false);

  // Filter products by query
  const filteredProducts = query
    ? productCatalog.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.kind.toLowerCase().includes(query.toLowerCase()) ||
          p.tag.toLowerCase().includes(query.toLowerCase())
      )
    : productCatalog;

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
          {DEMO_VENDORS.map((vendor) => (
            <div key={vendor.id} className="flex flex-col items-center flex-shrink-0" style={{ width: '130px', gap: '10px' }}>
              {/* Vendor image */}
              <div className="relative w-full overflow-hidden bg-[#F5F5F5]" style={{ height: '140px', borderRadius: '14px' }}>
                <Image src={vendor.image} alt={vendor.name} fill style={{ objectFit: 'cover' }} />
                {/* Logo overlay */}
                {vendor.logo && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '8px', fontWeight: 800, color: '#1A1A1A' }}>
                    {vendor.logo}
                  </div>
                )}
              </div>
              {/* Vendor info */}
              <div className="text-center">
                <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{vendor.name}</p>
                <div className="flex items-center justify-center" style={{ gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>{vendor.rating}</span>
                  <Star size={10} color="#D4AF37" fill="#D4AF37" />
                  <span style={{ fontSize: '10px', color: '#999' }}>({vendor.reviews})</span>
                </div>
              </div>
            </div>
          ))}
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
              key={product.id}
              id={product.id}
              imageUrl={product.image}
              title={product.title}
              brand={product.brand}
              price={product.price}
              originalPrice={product.originalPrice}
              tag={product.tag}
              isFavorite={wishlist.includes(product.id)}
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
          .map((id) => productCatalog.find((p) => p.id === id))
          .filter(Boolean) as typeof productCatalog;

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
                <div key={product.id} style={{ minWidth: '160px', maxWidth: '180px', flexShrink: 0 }}>
                  <ProductCard
                    id={product.id}
                    imageUrl={product.image}
                    title={product.title}
                    brand={product.brand}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    tag={product.tag}
                    isFavorite={wishlist.includes(product.id)}
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
