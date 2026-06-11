'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VendorCard } from '@/components/VendorCard';
import { type Vendor } from '@/data/vendors';
import { type Product } from '@/data/products';

interface VendorCarouselProps {
  title: string;
  vendors: Vendor[];
  allProducts: Product[];
}

export function VendorCarousel({ title, vendors, allProducts }: VendorCarouselProps) {
  const { followedVendors, toggleFollowVendor } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (vendors.length === 0) return null;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Section Header */}
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

      {/* Scrollable Vendor Row */}
      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar snap-x"
          style={{ gap: '16px', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vendors.map((vendor) => {
            const vendorProducts = allProducts.filter((p) =>
              vendor.productIds.includes(p.id)
            );
            return (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                products={vendorProducts}
                isFollowing={followedVendors.includes(vendor.id)}
                onToggleFollow={() => toggleFollowVendor(vendor.id)}
              />
            );
          })}
        </div>

        {/* Scroll right button */}
        {vendors.length > 3 && (
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
        )}
      </div>
    </div>
  );
}
