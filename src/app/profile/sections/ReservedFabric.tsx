'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ShoppingBag, Trash2, AlertTriangle } from 'lucide-react';
import { cardStyle, sectionTitle } from '../styles';

// ─── Demo reserved fabric data ─────────────────────────────────
interface ReservedFabric {
  id: string;
  productId: string;
  title: string;
  image: string;
  brand: string;
  price: number;
  yards: number;
  reservedAt: string;    // ISO date
  expiresAt: string;     // ISO date
  status: 'active' | 'expiring-soon' | 'expired';
}

const DEMO_RESERVATIONS: ReservedFabric[] = [
  {
    id: 'res_1',
    productId: 'prod_5',
    title: 'Ankara Wax Print — Geometric Tribal',
    image: '/image/ankara.png',
    brand: 'AFRICANA FABRICS',
    price: 4500,
    yards: 6,
    reservedAt: '2026-06-08T10:30:00Z',
    expiresAt: '2026-06-15T10:30:00Z',
    status: 'active',
  },
  {
    id: 'res_2',
    productId: 'prod_6',
    title: 'Gold Brocade Lace',
    image: '/image/fabric-1.jpg',
    brand: 'AFRICANA FABRICS',
    price: 12000,
    yards: 4,
    reservedAt: '2026-06-05T14:00:00Z',
    expiresAt: '2026-06-12T14:00:00Z',
    status: 'expiring-soon',
  },
  {
    id: 'res_3',
    productId: 'prod_15',
    title: 'Aso-Oke Handwoven Fabric',
    image: '/image/fabric-swatch-1.jpg',
    brand: 'ASO-OKE HERITAGE',
    price: 18000,
    yards: 3,
    reservedAt: '2026-05-28T09:00:00Z',
    expiresAt: '2026-06-04T09:00:00Z',
    status: 'expired',
  },
];

// ─── Helpers ────────────────────────────────────────────────────
function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function getStatusStyle(status: ReservedFabric['status']) {
  switch (status) {
    case 'active':
      return { bg: 'rgba(16,185,129,0.08)', color: '#10B981', label: 'Reserved' };
    case 'expiring-soon':
      return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Expiring Soon' };
    case 'expired':
      return { bg: 'rgba(239,68,68,0.06)', color: '#EF4444', label: 'Expired' };
  }
}

export default function ReservedFabric() {
  const [reservations, setReservations] = useState<ReservedFabric[]>(DEMO_RESERVATIONS);

  const activeCount = reservations.filter((r) => r.status !== 'expired').length;
  const expiredCount = reservations.filter((r) => r.status === 'expired').length;

  const handleRelease = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Summary Card */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Reserved Fabric</h3>
        <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, padding: '0 20px 12px' }}>
          Fabrics you&apos;ve placed on hold. Reservations last 7 days before expiring.
        </p>

        {/* Stats */}
        <div
          className="flex items-center justify-around"
          style={{ padding: '14px 20px', borderTop: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5' }}
        >
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A' }}>{reservations.length}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#F0F0F0' }} />
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>{activeCount}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active</span>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#F0F0F0' }} />
          <div className="flex flex-col items-center">
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444' }}>{expiredCount}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expired</span>
          </div>
        </div>
      </div>

      {/* Reservation Cards */}
      {reservations.length === 0 && (
        <div style={cardStyle}>
          <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px' }}>
            <div
              className="flex items-center justify-center"
              style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F5F5F5', marginBottom: '14px' }}
            >
              <ShoppingBag size={22} color="#CCC" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#999' }}>No reserved fabrics</span>
            <Link
              href="/discover"
              style={{ fontSize: '12px', fontWeight: 700, color: '#462814', marginTop: '8px', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Browse fabrics
            </Link>
          </div>
        </div>
      )}

      {reservations.map((res) => {
        const statusStyle = getStatusStyle(res.status);
        const timeLeft = getTimeLeft(res.expiresAt);
        const isExpired = res.status === 'expired';

        return (
          <div key={res.id} style={{ ...cardStyle, opacity: isExpired ? 0.7 : 1 }}>
            <div className="flex" style={{ padding: '16px 20px', gap: '16px' }}>
              {/* Fabric thumbnail */}
              <Link
                href={`/products/${res.productId}`}
                className="relative flex-shrink-0 overflow-hidden"
                style={{ width: '80px', height: '100px', borderRadius: '12px', background: '#F5F5F5' }}
              >
                <Image
                  src={res.image}
                  alt={res.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="80px"
                />
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0" style={{ gap: '6px' }}>
                <Link href={`/products/${res.productId}`} className="truncate" style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', textDecoration: 'none' }}>
                  {res.title}
                </Link>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {res.brand}
                </span>

                {/* Price + yards */}
                <div className="flex items-center" style={{ gap: '12px', marginTop: '2px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#1A1A1A' }}>
                    ₦{(res.price * res.yards).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#999', background: '#F5F5F5', padding: '2px 8px', borderRadius: '100px' }}>
                    {res.yards} yards
                  </span>
                </div>

                {/* Status + Timer */}
                <div className="flex items-center flex-wrap" style={{ gap: '8px', marginTop: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: statusStyle.color,
                      background: statusStyle.bg,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {statusStyle.label}
                  </span>
                  {!isExpired && (
                    <span className="flex items-center" style={{ gap: '4px', fontSize: '11px', fontWeight: 600, color: res.status === 'expiring-soon' ? '#F59E0B' : '#999' }}>
                      <Clock size={12} />
                      {timeLeft}
                    </span>
                  )}
                  {res.status === 'expiring-soon' && (
                    <AlertTriangle size={13} color="#F59E0B" />
                  )}
                </div>
              </div>
            </div>

            {/* Action row */}
            <div
              className="flex items-center"
              style={{ padding: '12px 20px', borderTop: '1px solid #F8F8F8', gap: '10px' }}
            >
              {!isExpired ? (
                <>
                  <Link
                    href={`/products/${res.productId}`}
                    className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      background: '#462814',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      gap: '6px',
                    }}
                  >
                    <ShoppingBag size={14} />
                    Buy Now
                  </Link>
                  <button
                    onClick={() => handleRelease(res.id)}
                    className="flex items-center justify-center transition-all hover:bg-red-50 active:scale-90"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1px solid #F0F0F0',
                      background: '#FFFFFF',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={14} />
                    Release
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleRelease(res.id)}
                  className="flex-1 flex items-center justify-center transition-all hover:bg-red-50 active:scale-95"
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #F0F0F0',
                    background: '#FFFFFF',
                    color: '#999',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
