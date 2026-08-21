'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ApiBusinessPublic } from '@/lib/api-types';

interface FollowingBarProps {
  followedVendorIds: string[];
  vendors: ApiBusinessPublic[];
}

export function FollowingBar({ followedVendorIds, vendors }: FollowingBarProps) {
  const followedVendors = vendors.filter((v) =>
    followedVendorIds.includes(v._id)
  );

  // Don't render if no followed vendors
  if (followedVendors.length === 0) return null;

  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {/* Header row */}
      <div className="flex items-center" style={{ gap: '10px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Following
        </span>
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
        {followedVendors.map((vendor) => {
          const logoInitials = vendor.business_name.slice(0, 2).toUpperCase();
          return (
            <Link
              key={vendor._id}
              href={`/vendor/${vendor._id}`}
              className="relative flex-shrink-0 flex items-center justify-center overflow-hidden transition-all hover:shadow-md active:scale-95"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-glass)',
                textDecoration: 'none',
              }}
              title={vendor.business_name}
            >
              {vendor.business_logo_url ? (
                <Image
                  src={vendor.business_logo_url}
                  alt={vendor.business_name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    fontFamily: "var(--font-display), 'Outfit', sans-serif",
                  }}
                >
                  {logoInitials}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
