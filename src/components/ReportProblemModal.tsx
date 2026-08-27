'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, Check, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

// ─── ReportProblemModal ───────────────────────────────────────
// Files a dispute against a vendor for a delivered order → POST /disputes.
// The backend only accepts disputes for completed (delivered) orders whose
// vendor payout hasn't been released yet, so this is opened from a delivered
// order's item. Admin arbitrates the outcome (refund / partial / release).

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  businessId: string;
  productName: string;
  productImage?: string;
  onSubmitted?: () => void;
}

const BROWN = '#462814';

// Customer-facing dispute reasons (the vendor-raised measurement flag is omitted).
const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'missing_items', label: 'Missing items' },
  { value: 'poor_quality', label: 'Poor quality' },
  { value: 'other', label: 'Something else' },
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  orderReference,
  businessId,
  productName,
  productImage,
  onSubmitted,
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDescription('');
      setError(null);
      setDone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!reason) {
      setError('Please choose what went wrong.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please describe the problem in a little more detail.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/disputes', {
        order_reference: orderReference,
        business_id: businessId,
        reason,
        description: description.trim(),
        evidence_urls: [],
      });
      setDone(true);
      onSubmitted?.();
      setTimeout(onClose, 1400);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr?.response?.data?.message;
      setError(
        (Array.isArray(msg) ? msg[0] : msg) ||
          'Could not submit your report. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white"
        style={{ borderRadius: '24px 24px 0 0', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ borderRadius: 'inherit' }} className="sm:rounded-[24px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ padding: '18px 20px', borderBottom: '1px solid #F0F0F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Report a problem</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#888" />
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center text-center" style={{ padding: '40px 24px', gap: '14px' }}>
              <div className="flex items-center justify-center rounded-full" style={{ width: '64px', height: '64px', background: '#0F6E4F' }}>
                <Check size={32} color="#FFF" strokeWidth={3} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Report submitted</p>
              <p style={{ fontSize: '13px', color: '#888', maxWidth: '320px' }}>
                We&apos;ve opened a case with the vendor. Our team will review the evidence and resolve it — you&apos;ll be notified of the outcome.
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ padding: '20px', gap: '16px' }}>
              {/* Product */}
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F5F3F0' }}>
                  {productImage ? (
                    <Image src={productImage} alt={productName} fill style={{ objectFit: 'cover' }} sizes="52px" />
                  ) : null}
                </div>
                <div className="flex flex-col" style={{ gap: '2px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{productName}</p>
                  <p style={{ fontSize: '11px', color: '#999' }}>Order {orderReference}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>What went wrong?</span>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {REASON_OPTIONS.map((opt) => {
                    const active = reason === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setReason(opt.value)}
                        style={{
                          padding: '9px 14px',
                          borderRadius: '100px',
                          border: active ? `1.5px solid ${BROWN}` : '1px solid #E5E5E5',
                          background: active ? 'rgba(70,40,20,0.06)' : '#FFF',
                          color: active ? BROWN : '#555',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what happened so we can resolve it quickly…"
                rows={4}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: '13px', color: '#1A1A1A', resize: 'none', outline: 'none' }}
              />

              <div className="flex items-start" style={{ gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(245,166,35,0.08)' }}>
                <AlertTriangle size={15} color="#B8860B" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '11px', color: '#7A5C00', lineHeight: 1.5 }}>
                  Opening a case pauses the vendor&apos;s payout for this order until our team resolves it.
                </span>
              </div>

              {error && (
                <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>
              )}

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ padding: '14px', borderRadius: '14px', background: BROWN, color: '#FFF', fontSize: '13px', fontWeight: 800, border: 'none', cursor: submitting ? 'wait' : 'pointer', gap: '8px' }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
