'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { GenderToggle } from '@/components/GenderToggle';
import {
  resolveSlug,
  buildBreadcrumbs,
  HERO_BANNERS,
} from '@/data/taxonomy';
import { useProducts } from '@/hooks/useProducts';
import type { ApiProduct } from '@/lib/api-types';
import { DiscoverBreadcrumb } from '@/components/discover/DiscoverBreadcrumb';
import { DiscoverHeroBanners } from '@/components/discover/DiscoverHeroBanners';
import { CollectionChips } from '@/components/discover/CollectionChips';
import { ProductCarousel } from '@/components/discover/ProductCarousel';

export default function DiscoverSlugPage() {
  const params = useParams();
  const { gender, setGender } = useApp();
  const [showFilter, setShowFilter] = useState(false);
  const [activeProductType, setActiveProductType] = useState<string | null>(null);
  const [selectedChildSlug, setSelectedChildSlug] = useState<string | null>(null);

  // Parse slug
  const rawSlug = params?.slug;
  const slugParts: string[] = Array.isArray(rawSlug)
    ? rawSlug
    : rawSlug
      ? [rawSlug]
      : [];

  // Resolve taxonomy
  const { nodes, current } = resolveSlug(slugParts);
  const breadcrumbs = buildBreadcrumbs(slugParts);
  const depth = slugParts.length;

  // Determine what to show
  const hasChildren = current?.children && current.children.length > 0;
  const parentPath = slugParts.slice(0, -1).join('/');
  const currentSlug = slugParts[slugParts.length - 1];

  // At depth 1 with children, the selected child determines what products to fetch
  const selectedChild = (depth === 1 && hasChildren && selectedChildSlug)
    ? current!.children!.find(c => c.slug === selectedChildSlug)
    : null;

  // Fetch products from API
  // At depth 1: use selected child's filter if a tab is chosen, otherwise fetch the parent's products
  const activeNode = selectedChild || current;
  const searchHint = activeNode?.productFilter?.subcategory || activeNode?.productFilter?.collection || activeNode?.label?.toLowerCase() || '';
  const kindFilter = activeNode?.productFilter?.kind?.[0];
  const { products: apiProducts } = useProducts({
    search: searchHint,
    kind: kindFilter,
    size: 50,
  });

  // Filter products based on the active node
  let products = [...apiProducts];

  // For clothing sections, further filter by clothing type
  if (depth === 1 && selectedChild) {
    products = products.filter((p) => {
      // Match subcategory against product taxonomy
      const sub = selectedChild.productFilter?.subcategory?.toLowerCase() || '';
      if (!sub) return true;
      const pt = (p.clothing?.taxonomy?.product_type || p.accessory?.taxonomy?.product_type || p.fabric?.taxonomy?.product_type || '').toLowerCase();
      const cats = (p.clothing?.taxonomy?.categories || p.accessory?.taxonomy?.categories || p.fabric?.taxonomy?.categories || []).map(c => c.toLowerCase());
      const name = (p.clothing?.name || p.accessory?.name || p.fabric?.name || '').toLowerCase();
      return pt.includes(sub) || cats.some(c => c.includes(sub)) || name.includes(sub) || sub.includes(pt);
    });
  }

  // Apply product type filter if set
  if (activeProductType) {
    products = products.filter((p) => p.kind?.toLowerCase().includes(activeProductType.toLowerCase()));
  }

  const getTrending = (ps: ApiProduct[], limit = 8) => ps.slice(0, limit);
  const getTopRated = (ps: ApiProduct[], limit = 8) => [...ps].reverse().slice(0, limit);
  const getWhatsNew = (ps: ApiProduct[], limit = 8) => ps.slice(Math.max(0, ps.length - limit));

  // Build chips from children or siblings
  let chips: { label: string; href: string; slug: string }[] = [];
  if (hasChildren) {
    chips = current!.children!.map((child) => ({
      label: child.label,
      href: `/discover/${slugParts.join('/')}/${child.slug}`,
      slug: child.slug,
    }));
  } else if (depth >= 2) {
    const parentNode = nodes[nodes.length - 2];
    if (parentNode?.children) {
      chips = parentNode.children.map((sibling) => ({
        label: sibling.label,
        href: `/discover/${parentPath}/${sibling.slug}`,
        slug: sibling.slug,
      }));
    }
  }

  // Product type filter chips (at deeper levels with filterChips)
  const filterChips = current?.filterChips || [];
  const showProductTypeChips = filterChips.length > 0;

  // Page title
  const pageTitle = current?.label || slugParts[slugParts.length - 1]?.toUpperCase() || 'DISCOVER';

  // Whether to show product carousels
  // At depth 1: only show products if a child tab is selected
  // At depth 2+: always show products
  const showProducts = depth >= 2 || (depth === 1 && selectedChildSlug !== null);

  // 404-like fallback
  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ gap: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1A1A1A' }}>Category not found</h1>
        <p style={{ fontSize: '14px', color: '#888' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '28px' }}>

      {/* Gender Toggle — desktop only */}
      <div className="hidden lg:block">
        <GenderToggle gender={gender} onToggle={setGender} />
      </div>

      {/* Page Title */}
      <div className="text-center">
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
          style={{ fontSize: '22px', marginBottom: '8px' }}
        >
          {pageTitle}
        </h1>
        <DiscoverBreadcrumb items={breadcrumbs} />
      </div>

      {/* Collection / Sibling Chips — at depth 1, act as filter tabs */}
      {chips.length > 0 && (
        depth === 1 ? (
          <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '8px' }}>
            {chips.map((chip) => (
              <button
                key={chip.slug}
                onClick={() => setSelectedChildSlug(selectedChildSlug === chip.slug ? null : chip.slug)}
                className="flex-shrink-0 transition-all"
                style={{
                  height: '38px',
                  padding: '0 20px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: selectedChildSlug === chip.slug ? '#FFFFFF' : '#1A1A1A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: selectedChildSlug === chip.slug ? '#1A1A1A' : '#F4F4F4',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : (
          <CollectionChips
            chips={chips}
            activeSlug={hasChildren ? undefined : currentSlug}
          />
        )
      )}

      {/* Hero Banners — only at depth 1 when no tab selected */}
      {depth === 1 && !selectedChildSlug && <DiscoverHeroBanners banners={HERO_BANNERS} />}

      {/* Prompt to select a tab at depth 1 */}
      {depth === 1 && !selectedChildSlug && (
        <div className="flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#888', textAlign: 'center' }}>
            Select a product type above to browse
          </p>
        </div>
      )}

      {/* Product Type Filter Chips — at deeper levels */}
      {showProductTypeChips && (
        <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '8px' }}>
          <button
            onClick={() => setShowFilter(true)}
            className="flex-shrink-0 flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1.5px solid #E5E5E5',
              background: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveProductType(activeProductType === chip ? null : chip)}
              className="flex-shrink-0 transition-all"
              style={{
                height: '36px',
                padding: '0 18px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                color: activeProductType === chip ? '#FFFFFF' : '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: activeProductType === chip ? '#1A1A1A' : '#F4F4F4',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Product Carousels — only show when a tab is selected (depth 1) or always (depth 2+) */}
      {showProducts && (
        <>
          <ProductCarousel title="Trending" products={getTrending(products)} />
          <ProductCarousel title="Top Rated" products={getTopRated(products)} />

          {/* Show What's New only at root category level */}
          {depth <= 1 && (
            <ProductCarousel title="What's New" products={getWhatsNew(products)} />
          )}

          {/* Extra top rated row for visual density */}
          {products.length > 4 && (
            <ProductCarousel title="Top Rated" products={getTopRated(products).reverse()} />
          )}
        </>
      )}

      {/* ══════ FILTER BOTTOM SHEET (reused vendor pattern) ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${showFilter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowFilter(false)}
          />

          {/* Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col transition-all duration-500 ease-out ${showFilter ? 'translate-y-0 lg:translate-x-0 opacity-100' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'}`}
            style={{
              maxHeight: '70vh',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {/* Drag Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.12)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>Filter & Sort</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.04)' }}
              >
                <X size={18} color="#1A1A1A" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '0 24px 24px' }}>
              {/* Sort */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Sort by</p>
                <div className="flex flex-col gap-1">
                  {['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'].map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left transition-colors hover:bg-gray-50"
                      style={{ color: '#1A1A1A', fontSize: '14px', fontWeight: 500, padding: '12px 16px', borderRadius: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brand</p>
                <div className="flex flex-wrap gap-2">
                  {['AFRICANA COUTURE', 'GARM ISLAND', 'FRUCHÉ', 'EJIRO AMOS TAFIRI'].map((brand) => (
                    <button
                      key={brand}
                      className="transition-all"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        cursor: 'pointer',
                      }}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {['Under ₦50K', '₦50K - ₦100K', '₦100K - ₦200K', 'Over ₦200K'].map((range) => (
                    <button
                      key={range}
                      className="transition-all"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        cursor: 'pointer',
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Availability</p>
                <div className="flex flex-wrap gap-2">
                  {['In-stock', 'On sale', 'New arrivals'].map((opt) => (
                    <button
                      key={opt}
                      className="transition-all"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="shrink-0" style={{ padding: '0 24px 24px' }}>
              <button
                onClick={() => setShowFilter(false)}
                className="w-full text-sm font-bold transition-colors hover:opacity-90"
                style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#1A1A1A', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
