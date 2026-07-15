'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ApiProduct } from '@/lib/api-types';
import { getProductImage } from '@/lib/api-types';
import { TAXONOMY } from '@/data/taxonomy';

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

function buildCategories(products: ApiProduct[]): CategoryColumn[] {
  const bgColors = ['#F5EDE4', '#EDE7E0', '#F0E6DC', '#E8E0D8', '#E8DDD3', '#F2EAE2', '#E5DCD4', '#EDE3DA'];

  // Split products by kind and clothing type
  const clothing = products.filter(p => p.kind === 'clothing');
  const nonCustomizable = clothing.filter(p => p.clothing?.type === 'non_customize');
  const customizable = clothing.filter(p => p.clothing?.type === 'customize');
  const accessories = products.filter(p => p.kind === 'accessory');
  const fabrics = products.filter(p => p.kind === 'fabric');

  // Extract unique product-type tiles from a pool of real products
  const extractTiles = (pool: ApiProduct[], parentSlug: string, max: number): CategoryTile[] => {
    const seen = new Map<string, { label: string; image: string }>();

    for (const p of pool) {
      if (seen.size >= max) break;

      let label = '';

      if (p.kind === 'clothing') {
        // Use product_type (e.g. "Dress", "Suit", "Traditional")
        // If product_type is generic like "Traditional", prefer categories[0] (e.g. "Kaftan", "Agbada")
        const pt = p.clothing?.taxonomy?.product_type || '';
        const cat = p.clothing?.taxonomy?.categories?.[0] || '';
        if (pt.toLowerCase() === 'traditional' && cat) {
          label = cat;
        } else {
          label = pt || cat || '';
        }
      } else if (p.kind === 'accessory') {
        // For accessories, categories[0] is the real type (e.g. "Bags", "Hat", "Belts")
        // product_type is often just "accessory" which is useless
        const pt = p.accessory?.taxonomy?.product_type || '';
        const cat = p.accessory?.taxonomy?.categories?.[0] || '';
        label = (pt.toLowerCase() !== 'accessory' && pt) ? pt : (cat || p.accessory?.name || '');
      } else if (p.kind === 'fabric') {
        // For fabric, extract the material from the name (last word)
        // e.g. "Crimson Orange Ankara" → "Ankara", "Blue Sea Linen" → "Linen"
        const name = p.fabric?.name || '';
        const words = name.trim().split(/\s+/);
        label = words[words.length - 1] || name;
      }

      if (!label) continue;

      // Normalize: capitalize first letter of each word
      label = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

      const key = label.toLowerCase();
      if (!seen.has(key)) {
        const img = getProductImage(p);
        if (img) {
          seen.set(key, { label, image: img });
        }
      }
    }

    // Build tiles, finding matching taxonomy route for each
    const parentNode = TAXONOMY.find(n => n.slug === parentSlug);
    const children = parentNode?.children || [];

    return Array.from(seen.values()).map((item, i) => {
      // Try to find a matching taxonomy child for a valid route
      const matchingChild = children.find(child => {
        const sub = child.productFilter?.subcategory?.toLowerCase() || '';
        return item.label.toLowerCase().includes(sub) || sub.includes(item.label.toLowerCase());
      });

      return {
        label: item.label,
        image: item.image,
        bgColor: bgColors[i % bgColors.length],
        href: matchingChild
          ? `/discover/${parentSlug}/${matchingChild.slug}`
          : `/discover/${parentSlug}`,
      };
    });
  };

  // Build all columns from real data
  const cols: CategoryColumn[] = [];

  const rtwTiles = extractTiles(nonCustomizable, 'ready-to-wear', 4);
  if (rtwTiles.length > 0) cols.push({ title: 'Ready to Wear', href: '/discover/ready-to-wear', tiles: rtwTiles });

  const customTiles = extractTiles(customizable, 'custom', 4);
  if (customTiles.length > 0) cols.push({ title: 'Custom', href: '/discover/custom', tiles: customTiles });

  const accTiles = extractTiles(accessories, 'accessories', 4);
  if (accTiles.length > 0) cols.push({ title: 'Accessories', href: '/discover/accessories', tiles: accTiles });

  const fabTiles = extractTiles(fabrics, 'fabric', 4);
  if (fabTiles.length > 0) cols.push({ title: 'Fabrics', href: '/discover/fabric', tiles: fabTiles });

  return cols;
}

export function ShopByCategory({ products = [] }: ShopByCategoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = buildCategories(products);

  if (categories.length === 0) return null;

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
                          className="object-cover object-center group-hover/tile:scale-110 transition-transform duration-500"
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
