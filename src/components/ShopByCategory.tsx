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
  // Helper: pick image from filtered products, with fallback
  const pickImage = (pool: ApiProduct[], idx: number, fallback: string): string => {
    const p = pool[idx];
    if (p) {
      const img = getProductImage(p);
      if (img) return img;
    }
    return fallback;
  };

  const clothing = products.filter((p) => p.kind === 'clothing');
  const customizable = clothing.filter((p) => p.clothing?.type === 'customize');
  const accessories = products.filter((p) => p.kind === 'accessory');
  const fabrics = products.filter((p) => p.kind === 'fabric');

  return [
    {
      title: 'Ready to Wear',
      href: '/discover/ready-to-wear',
      tiles: [
        { label: 'Agbada', image: pickImage(clothing, 0, FALLBACK_IMAGES.rtw[0]), bgColor: '#F5EDE4', href: '/discover/ready-to-wear/agbada' },
        { label: 'Kaftan', image: pickImage(clothing, 1, FALLBACK_IMAGES.rtw[1]), bgColor: '#EDE7E0', href: '/discover/ready-to-wear/kaftan' },
        { label: 'Ankara', image: pickImage(clothing, 2, FALLBACK_IMAGES.rtw[2]), bgColor: '#F0E6DC', href: '/discover/ready-to-wear/ankara' },
        { label: 'Corporate', image: pickImage(clothing, 3, FALLBACK_IMAGES.rtw[3]), bgColor: '#E8E0D8', href: '/discover/ready-to-wear/corporate' },
      ],
    },
    {
      title: 'Custom',
      href: '/discover/custom',
      tiles: [
        { label: 'Bespoke Agbada', image: pickImage(customizable, 0, FALLBACK_IMAGES.custom[0]), bgColor: '#E8DDD3', href: '/discover/custom/bespoke-agbada' },
        { label: 'Bespoke Kaftan', image: pickImage(customizable, 1, FALLBACK_IMAGES.custom[1]), bgColor: '#F2EAE2', href: '/discover/custom/bespoke-kaftan' },
        { label: 'Bespoke Ankara', image: pickImage(customizable, 2, FALLBACK_IMAGES.custom[2]), bgColor: '#E5DCD4', href: '/discover/custom/bespoke-ankara' },
        { label: 'Design Studio', image: pickImage(customizable, 3, FALLBACK_IMAGES.custom[3]), bgColor: '#EDE3DA', href: '/bespoke' },
      ],
    },
    {
      title: 'Accessories',
      href: '/discover/accessories',
      tiles: [
        { label: 'Bags', image: pickImage(accessories, 0, FALLBACK_IMAGES.accessories[0]), bgColor: '#F0E8E0', href: '/discover/accessories/bags' },
        { label: 'Jewelry', image: pickImage(accessories, 1, FALLBACK_IMAGES.accessories[1]), bgColor: '#E6DED6', href: '/discover/accessories/jewelry' },
        { label: 'Headwraps', image: pickImage(accessories, 2, FALLBACK_IMAGES.accessories[2]), bgColor: '#EAE2DA', href: '/discover/accessories/headwraps' },
        { label: 'Shoes', image: pickImage(accessories, 3, FALLBACK_IMAGES.accessories[3]), bgColor: '#F4ECE4', href: '/discover/accessories/shoes' },
      ],
    },
    {
      title: 'Fabrics',
      href: '/discover/fabric',
      tiles: [
        { label: 'Ankara', image: pickImage(fabrics, 0, FALLBACK_IMAGES.fabrics[0]), bgColor: '#E8DDD3', href: '/discover/fabric/ankara-fabric' },
        { label: 'Lace', image: pickImage(fabrics, 1, FALLBACK_IMAGES.fabrics[1]), bgColor: '#F2EAE2', href: '/discover/fabric/lace' },
        { label: 'Aso-Oke', image: pickImage(fabrics, 2, FALLBACK_IMAGES.fabrics[2]), bgColor: '#E5DCD4', href: '/discover/fabric/aso-oke-fabric' },
        { label: 'Adire', image: pickImage(fabrics, 3, FALLBACK_IMAGES.fabrics[3]), bgColor: '#EDE3DA', href: '/discover/fabric/adire-fabric' },
      ],
    },
  ];
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

              {/* 2×2 Grid of tiles */}
              <div
                className="grid grid-cols-2"
                style={{ gap: '6px' }}
              >
                {category.tiles.map((tile, idx) => {
                  // Only round the outer corner of each tile in the 2×2 grid
                  const R = '24px';
                  const borderRadius = [
                    `${R} 0 0 0`,   // top-left tile → round top-left
                    `0 ${R} 0 0`,   // top-right tile → round top-right
                    `0 0 0 ${R}`,   // bottom-left tile → round bottom-left
                    `0 0 ${R} 0`,   // bottom-right tile → round bottom-right
                  ][idx] || '0';

                  return (
                    <Link
                      key={tile.label}
                      href={tile.href}
                      className="relative flex flex-col overflow-hidden group/tile transition-all"
                      style={{
                        borderRadius,
                        background: tile.bgColor,
                        aspectRatio: '1 / 1',
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
