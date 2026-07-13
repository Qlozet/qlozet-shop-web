'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { vendorCatalog } from '@/data/vendors';

interface FollowingBarProps {
  followedVendorIds: string[];
}

export function FollowingBar({ followedVendorIds }: FollowingBarProps) {
  const followedVendors = vendorCatalog.filter((v) =>
    followedVendorIds.includes(v.id)
  );

  // Don't render if no followed vendors
  if (followedVendors.length === 0) return null;

  // Simulate update count (vendors with promos = "updates")
  const updateCount = followedVendors.filter((v) => v.promo).length;

  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {/* Header row */}
      <div className="flex items-center" style={{ gap: '10px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 900,
            color: '#1A1A1A',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Following
        </span>

        {updateCount > 0 && (
          <Link
            href="/profile?tab=following"
            className="flex items-center transition-opacity hover:opacity-70"
            style={{ gap: '4px', textDecoration: 'none' }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#E53935',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#555',
              }}
            >
              {updateCount} Update{updateCount > 1 ? 's' : ''}
            </span>
            <ChevronRight size={12} color="#555" />
          </Link>
        )}
      </div>

      {/* Vendor logo row */}
      <div
        className="flex overflow-x-auto hide-scrollbar"
        style={{
          gap: '10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '2px',
        }}
      >
        {followedVendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendor/${vendor.id}`}
            className="relative flex-shrink-0 flex items-center justify-center overflow-hidden transition-all hover:shadow-md active:scale-95"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#FFFFFF',
              border: '1px solid #EBEBEB',
              textDecoration: 'none',
            }}
            title={vendor.name}
          >
            {vendor.logoStyle === 'image' && vendor.logoImage ? (
              <Image
                src={vendor.logoImage}
                alt={vendor.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#1A1A1A',
                  fontFamily: "var(--font-display), 'Outfit', sans-serif",
                }}
              >
                {vendor.logoInitials}
              </span>
            )}

            {/* Update dot */}
            {vendor.promo && (
              <span
                className="absolute"
                style={{
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#E53935',
                  border: '2px solid #FFFFFF',
                }}
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
