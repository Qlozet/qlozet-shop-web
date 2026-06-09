'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function ReservationPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const { reservations, claimReservation, addToCart } = useApp();
  const [selectedYards, setSelectedYards] = useState(6);
  const [claimed, setClaimed] = useState(false);

  const reservation = reservations.find((r) => r.id === reservationId);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!reservation) return;
    const update = () => {
      const now = Date.now();
      const deadline = new Date(reservation.deadline).getTime();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [reservation]);

  const isExpired = reservation
    ? new Date(reservation.deadline).getTime() < Date.now() || reservation.status === 'expired'
    : false;
  const isCompleted = reservation?.status === 'completed';
  const remainingYards = reservation ? reservation.totalYards - reservation.claimedYards : 0;
  const progressPercent = reservation ? (reservation.claimedYards / reservation.totalYards) * 100 : 0;

  const handleClaim = () => {
    if (!reservation || selectedYards > remainingYards) return;
    const success = claimReservation(reservation.id, selectedYards);
    if (success) {
      addToCart({
        id: reservation.fabricId + '_res_' + Date.now(),
        title: reservation.fabricName,
        price: reservation.fabricPrice * selectedYards,
        image: reservation.fabricImage,
        kind: 'fabric',
        size: `${selectedYards} Yards`,
        color: reservation.eventName,
      });
      setClaimed(true);
    }
  };

  // ── Not Found State ──
  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '16px' }}>
        <AlertTriangle size={48} color="#999" />
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A' }}>Reservation Not Found</h2>
        <p style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>This reservation link is invalid or has been removed.</p>
        <Link
          href="/"
          className="transition-all hover:opacity-90"
          style={{ marginTop: '8px', padding: '12px 28px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FA' }}>
      <div className="w-full" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px 100px' }}>

        {/* Back Link */}
        <Link href="/" className="flex items-center" style={{ gap: '6px', padding: '20px 0 16px', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="#888" />
          <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>Back</span>
        </Link>

        {/* ── Hero Card ── */}
        <div className="rounded-[24px] overflow-hidden bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          {/* Fabric Image */}
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <Image
              src={reservation.fabricImage}
              alt={reservation.fabricName}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
            {/* Event badge */}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.2 }}>{reservation.eventName}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Hosted by {reservation.organizerName}</p>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '20px 24px 24px' }}>
            {/* Fabric Info */}
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '20px' }}>
              <div className="relative flex-shrink-0 rounded-[10px] overflow-hidden" style={{ width: '48px', height: '48px' }}>
                <Image src={reservation.fabricImage} alt="" fill style={{ objectFit: 'cover' }} sizes="48px" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{reservation.fabricName}</p>
                <p style={{ fontSize: '13px', color: '#888' }}>₦{reservation.fabricPrice.toLocaleString()} per yard</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                  {reservation.claimedYards} of {reservation.totalYards} yards claimed
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: progressPercent >= 100 ? '#065F46' : '#D4AF37' }}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full rounded-full" style={{ height: '10px', background: '#F0F0F0', overflow: 'hidden' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, progressPercent)}%`,
                    background: progressPercent >= 100
                      ? 'linear-gradient(90deg, #065F46, #059669)'
                      : 'linear-gradient(90deg, #D4AF37, #F0C040)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>{remainingYards} yards remaining</span>
                <div className="flex items-center" style={{ gap: '4px' }}>
                  <Users size={12} color="#999" />
                  <span style={{ fontSize: '11px', color: '#999' }}>{reservation.claimedYards > 0 ? Math.ceil(reservation.claimedYards / 6) : 0} guests claimed</span>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center rounded-[14px]" style={{ gap: '10px', padding: '14px', background: isExpired ? '#FEF2F2' : '#F9FAFB', border: `1px solid ${isExpired ? '#FECACA' : '#F0F0F0'}` }}>
              {isExpired ? (
                <AlertTriangle size={18} color="#DC2626" />
              ) : (
                <Clock size={18} color="#D4AF37" />
              )}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: isExpired ? '#DC2626' : '#1A1A1A' }}>
                  {isExpired ? 'Reservation Expired' : `Ends in ${timeLeft}`}
                </p>
                <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                  <CalendarDays size={11} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                  Deadline: {new Date(reservation.deadline).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Claim Section ── */}
        {!isExpired && !isCompleted && !claimed && remainingYards > 0 && (
          <div className="rounded-[24px] bg-white shadow-sm" style={{ marginTop: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>Claim Your Fabric</h3>

            {/* Yards selector */}
            <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderRadius: '14px', border: '1.5px solid #E5E5E5', background: '#FAFAFA', marginBottom: '16px' }}>
              <button
                onClick={() => setSelectedYards(Math.max(6, selectedYards - 6))}
                className="flex items-center justify-center hover:bg-gray-200 transition-colors rounded-full"
                style={{ width: '36px', height: '36px', border: 'none', background: '#EBEBEB', cursor: 'pointer' }}
              >
                <Minus size={16} color="#333" />
              </button>
              <div className="flex flex-col items-center">
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#1A1A1A' }}>{selectedYards}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>yards</span>
              </div>
              <button
                onClick={() => setSelectedYards(Math.min(remainingYards, selectedYards + 6))}
                className="flex items-center justify-center hover:bg-gray-200 transition-colors rounded-full"
                style={{ width: '36px', height: '36px', border: 'none', background: '#EBEBEB', cursor: 'pointer' }}
              >
                <Plus size={16} color="#333" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A' }}>
                ₦{(reservation.fabricPrice * selectedYards).toLocaleString()}
              </span>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={selectedYards > remainingYards}
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: '#065F46',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: 'none',
                cursor: 'pointer',
                gap: '8px',
              }}
            >
              <ShoppingCart size={16} />
              Claim & Add to Cart
            </button>
          </div>
        )}

        {/* ── Claimed Confirmation ── */}
        {claimed && (
          <div className="rounded-[24px] bg-white shadow-sm flex flex-col items-center" style={{ marginTop: '16px', padding: '32px 24px', border: '1px solid rgba(0,0,0,0.06)', gap: '12px' }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: '#ECFDF5' }}>
              <Check size={28} color="#065F46" strokeWidth={3} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Fabric Claimed!</p>
            <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>
              {selectedYards} yards of {reservation.fabricName} added to your cart.
            </p>
            <Link
              href="/cart"
              className="transition-all hover:opacity-90"
              style={{ marginTop: '4px', padding: '12px 28px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
            >
              Go to Cart
            </Link>
          </div>
        )}

        {/* ── Expired / Completed State ── */}
        {(isExpired || isCompleted) && !claimed && (
          <div className="rounded-[24px] bg-white shadow-sm flex flex-col items-center" style={{ marginTop: '16px', padding: '32px 24px', border: '1px solid rgba(0,0,0,0.06)', gap: '12px' }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: isCompleted ? '#ECFDF5' : '#FEF2F2' }}>
              {isCompleted
                ? <Check size={28} color="#065F46" strokeWidth={3} />
                : <AlertTriangle size={28} color="#DC2626" />
              }
            </div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>
              {isCompleted ? 'Fully Claimed!' : 'Reservation Ended'}
            </p>
            <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>
              {isCompleted
                ? 'All yards have been claimed for this event.'
                : 'This reservation has expired. Unclaimed yards have been returned to stock.'}
            </p>
            <Link
              href="/products"
              className="transition-all hover:opacity-90"
              style={{ marginTop: '4px', padding: '12px 28px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
            >
              Browse Fabrics
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
