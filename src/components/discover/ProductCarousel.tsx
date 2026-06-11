'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { type Product } from '@/data/products';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  href?: string; // Optional "see all" link
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
          style={{ gap: '12px', paddingBottom: '4px' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 snap-start" style={{ width: '214px' }}>
              <ProductCard
                id={product.id}
                imageUrl={product.image}
                title={product.title}
                brand={product.brand}
                price={`₦${product.price.toLocaleString()}`}
                originalPrice={product.originalPrice ? `₦${product.originalPrice.toLocaleString()}` : undefined}
                tag={product.tag}
                isFavorite={wishlist.includes(product.id)}
                onFavoriteToggle={() => toggleWishlist(product.id)}
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
