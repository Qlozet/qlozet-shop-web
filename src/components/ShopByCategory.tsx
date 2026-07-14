'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ApiProduct } from '@/lib/api-types';
import { getProductImage } from '@/lib/api-types';

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
  // Helper: pick image from filtered products matching the keywords, return undefined if none
  const pickMatchingImage = (pool: ApiProduct[], keywords: string[]): string | undefined => {
    const p = pool.find(item => {
      const type = (item.clothing?.taxonomy?.product_type || item.clothing?.taxonomy?.categories?.[0] || item.accessory?.taxonomy?.product_type || item.fabric?.taxonomy?.product_type || item.clothing?.name || item.accessory?.name || item.fabric?.name || '').toLowerCase();
      const collections = (item.collections || []).join(' ').toLowerCase();
      const tags = (item.tags || []).map(t => t.name).join(' ').toLowerCase();
      const searchStr = `${type} ${collections} ${tags}`;
      return keywords.some(k => searchStr.includes(k.toLowerCase()));
    });
    return p ? getProductImage(p) : undefined;
  };

  const clothing = products.filter((p) => p.kind === 'clothing');
  const customizable = clothing.filter((p) => p.clothing?.type === 'customize');
  const nonCustomizable = clothing.filter((p) => p.clothing?.type === 'non_customize');
  const accessories = products.filter((p) => p.kind === 'accessory');
  const fabrics = products.filter((p) => p.kind === 'fabric');

  const cols = [
    {
      title: 'Ready to Wear',
      href: '/discover/ready-to-wear',
      tiles: [
        { label: 'Agbada', image: pickMatchingImage(nonCustomizable, ['agbada']), bgColor: '#F5EDE4', href: '/discover/ready-to-wear/agbada' },
        { label: 'Kaftan', image: pickMatchingImage(nonCustomizable, ['kaftan']), bgColor: '#EDE7E0', href: '/discover/ready-to-wear/kaftan' },
        { label: 'Ankara', image: pickMatchingImage(nonCustomizable, ['ankara']), bgColor: '#F0E6DC', href: '/discover/ready-to-wear/ankara' },
        { label: 'Corporate', image: pickMatchingImage(nonCustomizable, ['corporate', 'suit', 'dress']), bgColor: '#E8E0D8', href: '/discover/ready-to-wear/corporate' },
      ].filter((t): t is CategoryTile => t.image !== undefined),
    },
    {
      title: 'Custom',
      href: '/discover/custom',
      tiles: [
        { label: 'Agbada', image: pickMatchingImage(customizable, ['agbada']), bgColor: '#E8DDD3', href: '/discover/custom/agbada' },
        { label: 'Kaftan', image: pickMatchingImage(customizable, ['kaftan']), bgColor: '#F2EAE2', href: '/discover/custom/kaftan' },
        { label: 'Ankara', image: pickMatchingImage(customizable, ['ankara']), bgColor: '#E5DCD4', href: '/discover/custom/ankara' },
        { label: 'Dress', image: pickMatchingImage(customizable, ['dress']), bgColor: '#EDE3DA', href: '/discover/custom/dress' },
      ].filter((t): t is CategoryTile => t.image !== undefined),
    },
    {
      title: 'Accessories',
      href: '/discover/accessories',
      tiles: [
        { label: 'Bags', image: pickMatchingImage(accessories, ['bag']), bgColor: '#F0E8E0', href: '/discover/accessories/bags' },
        { label: 'Jewelry', image: pickMatchingImage(accessories, ['jewelry', 'necklace', 'bracelet']), bgColor: '#E6DED6', href: '/discover/accessories/jewelry' },
        { label: 'Headwraps', image: pickMatchingImage(accessories, ['headwrap', 'gele']), bgColor: '#EAE2DA', href: '/discover/accessories/headwraps' },
        { label: 'Shoes', image: pickMatchingImage(accessories, ['shoe']), bgColor: '#F4ECE4', href: '/discover/accessories/shoes' },
      ].filter((t): t is CategoryTile => t.image !== undefined),
    },
    {
      title: 'Fabrics',
      href: '/discover/fabric',
      tiles: [
        { label: 'Ankara', image: pickMatchingImage(fabrics, ['ankara']), bgColor: '#E8DDD3', href: '/discover/fabric/ankara-fabric' },
        { label: 'Lace', image: pickMatchingImage(fabrics, ['lace']), bgColor: '#F2EAE2', href: '/discover/fabric/lace' },
        { label: 'Aso-Oke', image: pickMatchingImage(fabrics, ['aso-oke']), bgColor: '#E5DCD4', href: '/discover/fabric/aso-oke-fabric' },
        { label: 'Adire', image: pickMatchingImage(fabrics, ['adire']), bgColor: '#EDE3DA', href: '/discover/fabric/adire-fabric' },
      ].filter((t): t is CategoryTile => t.image !== undefined),
    },
  ];

  return cols.filter((c) => c.tiles.length > 0);
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
