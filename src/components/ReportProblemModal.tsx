'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Loader2, Check, AlertTriangle, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useUpload } from '@/hooks/useUpload';

const MAX_PHOTOS = 3;

// ─── ReportProblemModal ───────────────────────────────────────
// Files a dispute against a vendor → POST /disputes. A delivered order can
// report any problem; a shipped one only that the parcel has not arrived (the
// backend checks it is genuinely overdue and says when to come back if not).
// The vendor payout must not have been released yet. Admin arbitrates the
// outcome (refund / partial / release).

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  businessId: string;
  productName: string;
  productImage?: string;
  onSubmitted?: () => void;
  /** Shipped but not delivered: only "Never arrived" can be reported. */
  notYetDelivered?: boolean;
}

// Customer-facing dispute reasons (the vendor-raised measurement flag is omitted).
const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'missing_items', label: 'Missing items' },
  { value: 'not_received', label: 'Never arrived' },
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
  notYetDelivered = false,
}) => {
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadOutfitImages, isUploading, uploadError } = useUpload();
  const reasons = notYetDelivered
    ? REASON_OPTIONS.filter((o) => o.value === 'not_received')
    : REASON_OPTIONS;
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason(notYetDelivered ? 'not_received' : '');
      setPhotos([]);
      setDescription('');
      setError(null);
      setDone(false);
    }
  }, [isOpen, notYetDelivered]);

  if (!isOpen) return null;

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    if (!list.length) return;
    const results = await uploadOutfitImages(list);
    if (results.length) setPhotos((prev) => [...prev, ...results.map((r) => r.imageUrl)]);
  };

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
        evidence_urls: photos,
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

  const content = done ? (
    <div className="flex flex-col items-center text-center" style={{ padding: '24px 0', gap: '14px' }}>
      <div className="flex items-center justify-center rounded-full" style={{ width: '64px', height: '64px', background: '#0F6E4F' }}>
        <Check size={32} color="#FFF" strokeWidth={3} />
      </div>
      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Report submitted</p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px' }}>
        We&apos;ve opened a case with the vendor. Our team will review the evidence and resolve it — you&apos;ll be notified of the outcome.
      </p>
    </div>
  ) : (
    <>
      <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '4px' }}>
        Report a Problem
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        {notYetDelivered
          ? 'Tell us about the parcel that has not arrived — we’ll take it up with the vendor and the courier.'
          : 'Tell us what happened — we’ll open a case with the vendor.'}
      </p>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        {/* Product */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}>
            {productImage ? (
              <Image src={productImage} alt={productName} fill style={{ objectFit: 'cover' }} sizes="52px" />
            ) : null}
          </div>
          <div className="flex flex-col" style={{ gap: '2px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{productName}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Order {orderReference}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>What went wrong?</span>
          <div className="flex flex-wrap" style={{ gap: '8px' }}>
            {reasons.map((opt) => {
              const active = reason === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReason(opt.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '100px',
                    border: active ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                    background: active ? 'rgba(70,40,20,0.06)' : 'var(--bg-surface-elevated)',
                    color: active ? 'var(--brand-brown)' : 'var(--text-secondary)',
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
          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', fontSize: '13px', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
        />

        {/* Photos — optional, up to 3. Of the damage, the wrong item, or a
            screenshot of tracking that has not moved. */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Photos <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>(optional, up to {MAX_PHOTOS})</span>
          </span>
          <div className="flex flex-wrap" style={{ gap: '8px' }}>
            {photos.map((url, i) => (
              <div key={url} className="relative overflow-hidden" style={{ width: '64px', height: '64px', borderRadius: '10px', background: 'var(--bg-surface-elevated)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((u) => u !== url))}
                  className="absolute top-1 right-1 flex items-center justify-center"
                  style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer' }}
                  aria-label="Remove photo"
                >
                  <X size={11} color="#FFF" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center justify-center"
                style={{ width: '64px', height: '64px', borderRadius: '10px', border: '2px dashed var(--border-glass)', background: 'none', cursor: isUploading ? 'wait' : 'pointer', gap: '4px' }}
              >
                {isUploading
                  ? <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
                  : <Upload size={16} color="var(--text-muted)" />}
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>{isUploading ? 'Uploading…' : 'Add photo'}</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
            />
          </div>
          {uploadError && <p style={{ fontSize: '11px', color: '#DC2626', margin: 0 }}>{uploadError}</p>}
        </div>

        <div className="flex items-start" style={{ gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(245,166,35,0.08)' }}>
          <AlertTriangle size={15} color="#B8860B" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '11px', color: '#B8860B', lineHeight: 1.5 }}>
            Opening a case pauses the vendor&apos;s payout for this order until our team resolves it.
          </span>
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={submitting || isUploading}
          className="w-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: submitting ? 'wait' : 'pointer', gap: '8px' }}
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </>
  );

  // Same shell as the bespoke journey modal / checkout "Deliver To": floating
  // bottom sheet with a drag handle on mobile, centred 24px-radius card on
  // desktop. Theme tokens throughout so dark mode holds.
  return createPortal(
    <>
      {/* ═══ MOBILE: Bottom Sheet ═══ */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-[100] bg-black/40 animate-fade-in" onClick={onClose} />
        <div
          className="fixed left-3 right-3 bottom-3 z-[101] bg-[var(--bg-base)] rounded-[24px] flex flex-col"
          style={{ maxHeight: '85vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
          </div>
          <button
            onClick={onClose}
            className="absolute z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
            style={{ top: '20px', right: '18px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
          >
            <X size={14} color="var(--text-secondary)" />
          </button>
          <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '20px 24px 24px' }}>
            {content}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: Centered Modal ═══ */}
      <div
        className="hidden lg:flex fixed inset-0 z-[100] items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="relative w-full animate-fade-in"
          style={{ maxWidth: '440px', margin: '20px', borderRadius: '24px', background: 'var(--bg-base)', boxShadow: '0 24px 80px rgba(0,0,0,0.15)', overflow: 'hidden', maxHeight: '86vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
          >
            <X size={14} color="var(--text-secondary)" />
          </button>
          <div style={{ padding: '32px 28px', overflowY: 'auto' }}>
            {content}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
