'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserMinus, Check } from 'lucide-react';
import { vendorCatalog } from '@/data/vendors';
import { cardStyle, sectionTitle } from '../styles';

// Demo: user follows some vendors
const FOLLOWED_VENDOR_IDS = ['vendor_1', 'vendor_2', 'vendor_3', 'vendor_4', 'vendor_5'];

export default function Following() {
  const [followedIds, setFollowedIds] = useState<string[]>(FOLLOWED_VENDOR_IDS);

  const followedVendors = vendorCatalog.filter((v) => followedIds.includes(v.id));
  const suggestedVendors = vendorCatalog.filter((v) => !followedIds.includes(v.id)).slice(0, 4);

  const handleToggle = (vendorId: string) => {
    setFollowedIds((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  // ─── Reusable Vendor Row ──────────────────────────────────────
  const VendorRow = ({
    vendor,
    isFollowed,
    showBorder = true,
  }: {
    vendor: (typeof vendorCatalog)[0];
    isFollowed: boolean;
    showBorder?: boolean;
  }) => (
    <div
      className="flex items-center justify-between transition-colors hover:bg-gray-50/50"
      style={{
        padding: '14px 20px',
        borderBottom: showBorder ? '1px solid #F5F5F5' : 'none',
      }}
    >
      {/* Left: Logo + Name + Promo */}
      <Link
        href={`/vendor/${vendor.id}`}
        className="flex items-center flex-1 min-w-0"
        style={{ gap: '14px', textDecoration: 'none' }}
      >
        {/* Circular logo with ring */}
        <div
          className="flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: `2px solid ${vendor.themeColor || '#E0E0E0'}`,
          }}
        >
          {vendor.logoStyle === 'image' && vendor.logoImage ? (
            <Image
              src={vendor.logoImage}
              alt={vendor.name}
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
              {vendor.logoInitials}
            </span>
          )}
        </div>

        {/* Name + promo */}
        <div className="flex flex-col min-w-0">
          <span
            className="truncate"
            style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}
          >
            {vendor.name}
          </span>
          {vendor.promo ? (
            <span style={{ fontSize: '12px', color: '#999', lineHeight: 1.4 }}>
              <span style={{ color: '#D4800D', fontWeight: 600 }}>{vendor.promo.label}</span>{' '}
              {vendor.promo.condition}
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: '#BBB', fontWeight: 500 }}>
              {vendor.followers.toLocaleString()} followers
            </span>
          )}
        </div>
      </Link>

      {/* Right: Follow/Following button */}
      {isFollowed ? (
        <button
          onClick={() => handleToggle(vendor.id)}
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
          onClick={() => handleToggle(vendor.id)}
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

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* ── Following List ─────────────────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Following</h3>
        <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, padding: '0 20px 12px' }}>
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
              key={vendor.id}
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
                key={vendor.id}
                vendor={vendor}
                isFollowed={followedIds.includes(vendor.id)}
                showBorder={idx < suggestedVendors.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
