'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, CalendarDays, Users, Copy, Check, Minus, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// ═══════════════════════════════════════════════════════════════
//  ReserveFabricModal
//  Allows organizers to reserve fabric for events.
//  Step 1: Form (event name, yards, deadline)
//  Step 2: Confirmation with shareable link
// ═══════════════════════════════════════════════════════════════

type Step = 'form' | 'confirmed';

interface ReserveFabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabricId: string;
  fabricName: string;
  fabricImage: string;
  fabricPrice: number;
}

export const ReserveFabricModal: React.FC<ReserveFabricModalProps> = ({
  isOpen,
  onClose,
  fabricId,
  fabricName,
  fabricImage,
  fabricPrice,
}) => {
  const { user, createReservation } = useApp();
  const [step, setStep] = useState<Step>('form');
  const [eventName, setEventName] = useState('');
  const [yards, setYards] = useState(12);
  const [deadline, setDeadline] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [copied, setCopied] = useState(false);

  const reservationFee = Math.round(fabricPrice * yards * 0.1);
  const totalFabricCost = fabricPrice * yards;

  const handleClose = () => {
    setStep('form');
    setEventName('');
    setYards(12);
    setDeadline('');
    setCopied(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!eventName.trim() || !deadline || yards < 6) return;
    const id = createReservation({
      fabricId,
      fabricName,
      fabricImage,
      fabricPrice,
      eventName: eventName.trim(),
      totalYards: yards,
      deadline: new Date(deadline).toISOString(),
      organizerName: user?.name || 'Guest',
    });
    setReservationId(id);
    setStep('confirmed');
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/reserve/${reservationId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const minDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // min 3 days from now

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {step === 'form' ? 'Reserve Fabric' : 'Reserved!'}
          </h3>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            {step === 'form' ? 'Lock fabric for your event guests' : 'Share the link with your guests'}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '8px 24px 24px' }}>

        {/* ── Form Step ── */}
        {step === 'form' && (
          <div className="flex flex-col" style={{ gap: '20px' }}>
            {/* Fabric Preview */}
            <div className="flex items-center rounded-[16px] overflow-hidden" style={{ background: '#F5F5F5', gap: '14px', padding: '12px' }}>
              <div className="relative flex-shrink-0 rounded-[12px] overflow-hidden" style={{ width: '56px', height: '56px' }}>
                <Image src={fabricImage} alt={fabricName} fill style={{ objectFit: 'cover' }} sizes="56px" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{fabricName}</p>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>₦{fabricPrice.toLocaleString()} per yard</p>
              </div>
            </div>

            {/* Event Name */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Event Name</label>
              <input
                type="text"
                placeholder="e.g. Adebayo Wedding"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="transition-all focus:ring-0"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E5E5E5',
                  fontSize: '14px',
                  background: '#FAFAFA',
                  outline: 'none',
                }}
              />
            </div>

            {/* Yards Selector */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Yards to Reserve</label>
              <div className="flex items-center justify-between" style={{ padding: '10px 16px', borderRadius: '14px', border: '1.5px solid #E5E5E5', background: '#FAFAFA' }}>
                <button
                  onClick={() => setYards(Math.max(6, yards - 6))}
                  className="flex items-center justify-center hover:bg-gray-200 transition-colors rounded-full"
                  style={{ width: '36px', height: '36px', border: 'none', background: '#EBEBEB', cursor: 'pointer' }}
                >
                  <Minus size={16} color="#333" />
                </button>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#1A1A1A' }}>{yards}</span>
                  <span style={{ fontSize: '11px', color: '#888' }}>yards</span>
                </div>
                <button
                  onClick={() => setYards(yards + 6)}
                  className="flex items-center justify-center hover:bg-gray-200 transition-colors rounded-full"
                  style={{ width: '36px', height: '36px', border: 'none', background: '#EBEBEB', cursor: 'pointer' }}
                >
                  <Plus size={16} color="#333" />
                </button>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                <CalendarDays size={14} className="inline mr-1" style={{ verticalAlign: '-2px' }} />
                Reservation Deadline
              </label>
              <input
                type="date"
                min={minDate}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="transition-all"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #E5E5E5',
                  fontSize: '14px',
                  background: '#FAFAFA',
                  outline: 'none',
                  colorScheme: 'light',
                }}
              />
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-[16px]" style={{ background: '#F9FAFB', padding: '16px', border: '1px solid #F0F0F0' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Total fabric value</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>₦{totalFabricCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Reservation fee (10%)</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>₦{reservationFee.toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-gray-200" />
              <div className="flex items-center justify-between" style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>You pay now</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#065F46' }}>₦{reservationFee.toLocaleString()}</span>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
              Guests pay the fabric price when they claim. Unclaimed yards return to stock after the deadline.
            </p>
          </div>
        )}

        {/* ── Confirmation Step ── */}
        {step === 'confirmed' && (
          <div className="flex flex-col items-center" style={{ gap: '20px', paddingTop: '8px' }}>
            {/* Success Icon */}
            <div className="flex items-center justify-center rounded-full" style={{ width: '72px', height: '72px', background: '#ECFDF5' }}>
              <Check size={36} color="#065F46" strokeWidth={3} />
            </div>

            <div className="text-center">
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>{eventName}</p>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{yards} yards reserved \u00B7 ₦{fabricPrice.toLocaleString()}/yard</p>
            </div>

            {/* Share Link */}
            <div className="w-full rounded-[16px]" style={{ background: '#F5F5F5', padding: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Share this link</p>
              <div className="flex items-center" style={{ gap: '8px' }}>
                <div className="flex-1 rounded-[10px] overflow-hidden" style={{ background: '#FFF', border: '1px solid #E5E5E5', padding: '12px 14px' }}>
                  <p style={{ fontSize: '12px', color: '#333', wordBreak: 'break-all' }}>{shareUrl}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: copied ? '#065F46' : '#1A1A1A',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={18} color="#FFF" /> : <Copy size={18} color="#FFF" />}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="w-full flex items-start rounded-[14px]" style={{ background: '#FFF7E6', padding: '14px', gap: '10px', border: '1px solid #F5E6C8' }}>
              <Users size={18} color="#D4AF37" className="flex-shrink-0" style={{ marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: '#8B7A47', lineHeight: 1.5 }}>
                Share this link with your guests. They&apos;ll be able to select their yards and pay directly. Any unclaimed fabric returns to stock after your deadline.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step === 'form' && (
        <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={handleClose}
            className="flex-1 transition-colors hover:bg-gray-200"
            style={{ padding: '14px', borderRadius: '14px', background: '#F4F4F4', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!eventName.trim() || !deadline || yards < 6}
            className="flex-1 transition-colors hover:opacity-90 disabled:opacity-40"
            style={{ padding: '14px', borderRadius: '14px', background: '#065F46', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Reserve · ₦{reservationFee.toLocaleString()}
          </button>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="shrink-0" style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={handleClose}
            className="w-full transition-colors hover:opacity-90"
            style={{ padding: '14px', borderRadius: '14px', background: '#1A1A1A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet — portalled ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleClose}
          />
          <div
            className={`fixed left-3 right-3 bottom-3 z-[100] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
            style={{ maxHeight: '80vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
            </div>
            {panelContent}
          </div>
        </div>,
        document.body
      )}

      {/* ══════ DESKTOP: Floating card — portalled ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
          style={{ right: '48px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[420px] bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {panelContent}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
