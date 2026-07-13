'use client';

import React, { useRef, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { VendorCard } from '@/components/VendorCard';
import type { ApiBusinessPublic, ApiProduct } from '@/lib/api-types';

interface VendorCarouselProps {
  title: string;
  vendors: ApiBusinessPublic[];
  allProducts: ApiProduct[];
}

export function VendorCarousel({ title, vendors, allProducts }: VendorCarouselProps) {
  const { followedVendors, toggleFollowVendor } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build vendor → products lookup
  const vendorProductMap = useMemo(() => {
    const map = new Map<string, ApiProduct[]>();
    for (const p of allProducts) {
      const bizId = typeof p.business === 'string' ? p.business : p.business?._id;
      if (!bizId) continue;
      if (!map.has(bizId)) map.set(bizId, []);
      map.get(bizId)!.push(p);
    }
    return map;
  }, [allProducts]);

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
        <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
            const vendorProducts = vendorProductMap.get(vendor._id) ?? [];
            return (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                products={vendorProducts}
                isFollowing={followedVendors.includes(vendor._id)}
                onToggleFollow={() => toggleFollowVendor(vendor._id)}
              />
            );
          })}
        </div>

        {/* Scroll right button */}
        {vendors.length > 3 && (
          <button
            onClick={scrollRight}
            className="absolute z-10 hidden lg:flex items-center justify-center transition-opacity opacity-0 group-hover/row:opacity-100"
            style={{ right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E5E5', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <ChevronRight size={18} color="#1A1A1A" />
          </button>
        )}
      </div>
    </div>
  );
}
