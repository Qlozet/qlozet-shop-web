'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserMinus, Check, Heart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useVendors } from '@/hooks/useVendors';
import type { ApiBusinessPublic } from '@/lib/api-types';
import { cardStyle, sectionTitle } from '../styles';

export default function Following() {
  const { followedVendors: followedIds, toggleFollowVendor } = useApp();
  const { vendors: allVendors, loading } = useVendors({ limit: 20 });

  const followedVendors = allVendors.filter((v) => followedIds.includes(v._id));
  const suggestedVendors = allVendors.filter((v) => !followedIds.includes(v._id)).slice(0, 4);

  // ─── Reusable Vendor Row ──────────────────────────────────────
  const VendorRow = ({
    vendor,
    isFollowed,
    showBorder = true,
  }: {
    vendor: ApiBusinessPublic;
    isFollowed: boolean;
    showBorder?: boolean;
  }) => {
    const vendorName = vendor.business_name;
    const vendorLogo = vendor.business_logo_url;
    const logoInitials = vendorName.slice(0, 2).toUpperCase();
    const themeColor = vendor.theme_color || '#E0E0E0';

    return (
      <div
        className="flex items-center justify-between transition-colors hover:bg-gray-50/50"
        style={{
          padding: '14px 20px',
          borderBottom: showBorder ? '1px solid #F5F5F5' : 'none',
        }}
      >
        {/* Left: Logo + Name */}
        <Link
          href={`/vendor/${vendor._id}`}
          className="flex items-center flex-1 min-w-0"
          style={{ gap: '14px', textDecoration: 'none' }}
        >
          <div
            className="flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: `2px solid ${themeColor}`,
            }}
          >
            {vendorLogo ? (
              <Image
                src={vendorLogo}
                alt={vendorName}
                width={48}
                height={48}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#1A1A1A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {logoInitials}
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className="truncate"
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#1A1A1A',
                fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
              }}
            >
              {vendorName}
            </span>
            <span style={{ fontSize: '12px', color: '#BBB', fontWeight: 500 }}>
              {vendor.description?.slice(0, 40) || `${vendor.total_ratings ?? 0} ratings`}
            </span>
          </div>
        </Link>

        {/* Right: Follow/Following button */}
        {isFollowed ? (
          <button
            onClick={() => toggleFollowVendor(vendor._id)}
            className="flex items-center justify-center transition-all hover:opacity-80 active:scale-90 flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F0F0F0',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Check size={16} color="#1A1A1A" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={() => toggleFollowVendor(vendor._id)}
            className="flex items-center justify-center transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{
              padding: '8px 20px',
              borderRadius: '100px',
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            FOLLOW
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* ── Section Header Card ───────────────────────────────── */}
      <div style={{ ...cardStyle, padding: '28px' }}>
        <Heart size={28} color="#462814" strokeWidth={1.5} />
        <h3 style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#1A1A1A',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginTop: '12px',
          fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
        }}>
          Following
        </h3>
      </div>

      {/* ── Following List ─────────────────────────────────────── */}
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, padding: '20px 20px 12px' }}>
          Vendors and brands you follow.
        </p>

        <div className="flex flex-col">
          {followedVendors.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F5F5F5', marginBottom: '14px' }}
              >
                <UserMinus size={22} color="#CCC" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#999' }}>You&apos;re not following anyone yet</span>
              <Link href="/discover" style={{ fontSize: '12px', fontWeight: 700, color: '#462814', marginTop: '8px', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Discover vendors
              </Link>
            </div>
          )}

          {followedVendors.map((vendor, idx) => (
            <VendorRow
              key={vendor._id}
              vendor={vendor}
              isFollowed={true}
              showBorder={idx < followedVendors.length - 1}
            />
          ))}
        </div>
      </div>

      {/* ── Suggested Vendors ──────────────────────────────────── */}
      {suggestedVendors.length > 0 && (
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Suggested for you</h3>

          <div className="flex flex-col">
            {suggestedVendors.map((vendor, idx) => (
              <VendorRow
                key={vendor._id}
                vendor={vendor}
                isFollowed={followedIds.includes(vendor._id)}
                showBorder={idx < suggestedVendors.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
