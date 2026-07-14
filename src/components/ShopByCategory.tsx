'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ApiProduct } from '@/lib/api-types';
import { getProductImage } from '@/lib/api-types';
import { TAXONOMY, TaxonomyNode } from '@/data/taxonomy';

// ─── Category tile definitions ──────────────────────────────────────
interface CategoryTile {
  label: string;
  image: string;
  bgColor: string;
  href: string;
}

interface CategoryColumn {
  title: string;
  href: string;
  tiles: CategoryTile[];
}

// ─── Static fallback images per category ────────────────────────────
const FALLBACK_IMAGES = {
  rtw: ['/image/bespoke-agbada-orange.webp', '/image/bespoke-kaftan-brown-1.png', '/image/bespoke-ankara-1.png', '/image/bespoke-kaftan-milk-1.png'],
  custom: ['/image/bespoke-agbada-orange.webp', '/image/bespoke-kaftan-brown-1.png', '/image/bespoke-dress-1.png', '/image/custom-outfit-1.webp'],
  accessories: ['/image/qlozet-bag.png', '/image/bag.webp', '/image/totebag.png', '/image/qlozet-bag.png'],
  fabrics: ['/image/ankara.png', '/image/fabric-1.jpg', '/image/fabric-swatch-1.jpg', '/image/fabric-swatch-2.jpg'],
};

interface ShopByCategoryProps {
  products?: ApiProduct[];
}



// Map top-level taxonomy slugs to the product pool category
const TOP_LEVEL_SECTIONS: { slug: string; title: string; fallbackKey: keyof typeof FALLBACK_IMAGES }[] = [
  { slug: 'ready-to-wear', title: 'Ready to Wear', fallbackKey: 'rtw' },
  { slug: 'custom', title: 'Custom', fallbackKey: 'custom' },
  { slug: 'accessories', title: 'Accessories', fallbackKey: 'accessories' },
  { slug: 'fabric', title: 'Fabrics', fallbackKey: 'fabrics' },
];

function buildCategories(products: ApiProduct[]): CategoryColumn[] {
  const bgColors = ['#F5EDE4', '#EDE7E0', '#F0E6DC', '#E8E0D8', '#E8DDD3', '#F2EAE2', '#E5DCD4', '#EDE3DA'];

  // Helper: check if a product matches a taxonomy node's filter
  const productMatchesFilter = (p: ApiProduct, filter?: TaxonomyNode['productFilter']): boolean => {
    if (!filter) return false;
    if (filter.kind && !filter.kind.includes(p.kind)) return false;
    if (filter.tags) {
      const productTags = (p.tags || []).map(t => t.name.toUpperCase());
      if (!filter.tags.some(t => productTags.includes(t))) return false;
    }
    if (filter.subcategory) {
      const sub = filter.subcategory.toLowerCase();
      const pt = (p.clothing?.taxonomy?.product_type || p.accessory?.taxonomy?.product_type || p.fabric?.taxonomy?.product_type || '').toLowerCase();
      const cats = (p.clothing?.taxonomy?.categories || p.accessory?.taxonomy?.categories || p.fabric?.taxonomy?.categories || []).map(c => c.toLowerCase());
      const name = (p.clothing?.name || p.accessory?.name || p.fabric?.name || '').toLowerCase();
      const pattern = (p.fabric?.pattern || '').toLowerCase();
      if (!(pt.includes(sub) || cats.some(c => c.includes(sub)) || name.includes(sub) || pattern.includes(sub) || sub.includes(pt))) return false;
    }
    if (filter.collection) {
      if (!p.collections?.some(c => typeof c === 'string' && c.toLowerCase().includes(filter.collection!.toLowerCase()))) return false;
    }
    return true;
  };

  // Find a product image that matches a taxonomy node
  const findImageForNode = (node: TaxonomyNode, pool: ApiProduct[]): string | undefined => {
    const match = pool.find(p => productMatchesFilter(p, node.productFilter));
    return match ? getProductImage(match) : undefined;
  };

  const cols: CategoryColumn[] = [];

  for (const section of TOP_LEVEL_SECTIONS) {
    const topNode = TAXONOMY.find(n => n.slug === section.slug);
    if (!topNode || !topNode.children?.length) continue;

    const tiles: CategoryTile[] = [];
    const fallbacks = FALLBACK_IMAGES[section.fallbackKey];

    for (let i = 0; i < topNode.children.length && tiles.length < 4; i++) {
      const child = topNode.children[i];
      const href = `/discover/${section.slug}/${child.slug}`;
      const img = findImageForNode(child, products) || child.image || fallbacks[i % fallbacks.length];

      if (img) {
        tiles.push({
          label: child.label,
          image: img,
          bgColor: bgColors[tiles.length % bgColors.length],
          href,
        });
      }
    }

    if (tiles.length > 0) {
      cols.push({
        title: section.title,
        href: `/discover/${section.slug}`,
        tiles,
      });
    }
  }

  return cols;
}

export function ShopByCategory({ products = [] }: ShopByCategoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = buildCategories(products);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Section header */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        <h3
          style={{
            fontSize: '12px',
            fontWeight: 900,
            color: '#1A1A1A',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Shop by Category
        </h3>
        <div style={{ height: '1px', flex: 1, background: '#EBEBEB' }} />
      </div>

      {/* Scrollable row */}
      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar"
          style={{ gap: '20px', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <div
              key={category.title}
              className="flex flex-col flex-shrink-0"
              style={{ width: '360px', gap: '0' }}
            >
              {/* Category Title */}
              <Link
                href={category.href}
                className="flex items-center group/title transition-all"
                style={{
                  gap: '4px',
                  textDecoration: 'none',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#1A1A1A',
                    fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                  }}
                >
                  {category.title}
                </span>
                <ChevronRight
                  size={16}
                  color="#1A1A1A"
                  className="transition-transform group-hover/title:translate-x-1"
                />
              </Link>

              {/* Dynamic Grid of tiles */}
              <div
                className={`grid gap-[6px] ${
                  category.tiles.length === 4 ? 'grid-cols-2 grid-rows-2' :
                  category.tiles.length === 3 ? 'grid-cols-2 grid-rows-2' :
                  category.tiles.length === 2 ? 'grid-cols-1 grid-rows-2' :
                  'grid-cols-1 grid-rows-1'
                }`}
                style={{ height: '360px' }}
              >
                {category.tiles.map((tile, idx) => {
                  const len = category.tiles.length;
                  const R = '24px';
                  let borderRadius = '0';

                  if (len === 1) borderRadius = R;
                  else if (len === 2) {
                    if (idx === 0) borderRadius = `${R} ${R} 0 0`;
                    if (idx === 1) borderRadius = `0 0 ${R} ${R}`;
                  } else if (len === 3) {
                    if (idx === 0) borderRadius = `${R} ${R} 0 0`;
                    if (idx === 1) borderRadius = `0 0 0 ${R}`;
                    if (idx === 2) borderRadius = `0 0 ${R} 0`;
                  } else { // len === 4
                    if (idx === 0) borderRadius = `${R} 0 0 0`;
                    if (idx === 1) borderRadius = `0 ${R} 0 0`;
                    if (idx === 2) borderRadius = `0 0 0 ${R}`;
                    if (idx === 3) borderRadius = `0 0 ${R} 0`;
                  }

                  const isStretch = len === 3 && idx === 0;

                  return (
                    <Link
                      key={tile.label}
                      href={tile.href}
                      className={`relative flex flex-col overflow-hidden group/tile transition-all ${isStretch ? 'col-span-2' : ''}`}
                      style={{
                        borderRadius,
                        background: tile.bgColor,
                        textDecoration: 'none',
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative flex-1 overflow-hidden">
                        <Image
                          src={tile.image}
                          alt={tile.label}
                          fill
                          className="object-cover object-top group-hover/tile:scale-110 transition-transform duration-500"
                          sizes="136px"
                        />
                      </div>

                      {/* Label at bottom */}
                      <div
                        className="absolute bottom-0 left-0 right-0"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                          padding: '20px 10px 8px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                            letterSpacing: '0.02em',
                          }}
                        >
                          {tile.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll right button (desktop only) */}
        <button
          onClick={scrollRight}
          className="absolute z-10 hidden lg:flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
          style={{
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5E5E5',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <ChevronRight size={18} color="#1A1A1A" />
        </button>
      </div>
    </div>
  );
}
