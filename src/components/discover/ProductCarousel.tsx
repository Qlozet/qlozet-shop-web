'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import type { ApiProduct } from '@/lib/api-types';
import {
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductImage,
  getProductTag,
  hasDiscount,
} from '@/lib/api-types';

interface ProductCarouselProps {
  title: string;
  products: ApiProduct[];
  href?: string;
}

export function ProductCarousel({ title, products, href }: ProductCarouselProps) {
  const { wishlist, toggleWishlist } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
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
          {title}
        </h3>
        <ChevronRight size={14} color="#1A1A1A" />
      </div>

      {/* Scrollable product row */}
      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar snap-x"
          style={{ gap: '16px', paddingBottom: '4px' }}
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 snap-start" style={{ width: '214px' }}>
              <ProductCard
                id={product._id}
                imageUrl={getProductImage(product)}
                title={getProductName(product)}
                brand={typeof product.business === 'object' ? product.business?.business_name ?? '' : ''}
                price={getProductPrice(product)}
                originalPrice={hasDiscount(product) ? getProductOriginalPrice(product) : undefined}
                tag={getProductTag(product)}
                isFavorite={wishlist.includes(product._id)}
                onFavoriteToggle={() => toggleWishlist(product._id)}
              />
            </div>
          ))}
        </div>

        {/* Scroll button */}
        {products.length > 4 && (
          <button
            onClick={scrollRight}
            className="absolute z-10 hidden lg:flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
            style={{
              right: '-8px',
              top: '40%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <ChevronRight size={16} color="#1A1A1A" />
          </button>
        )}
      </div>
    </div>
  );
}
