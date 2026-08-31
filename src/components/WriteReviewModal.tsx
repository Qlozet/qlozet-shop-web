'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Star, X, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';

// ─── WriteReviewModal ─────────────────────────────────────────
// Star rating (1–5) + optional comment → POST /products/:id/rate.
// The backend only accepts reviews for products the customer has purchased and
// received (delivered/completed), so this is opened from a delivered order or
// the PDP for a product the customer owns.

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  /** Pre-fill when editing an existing review. */
  initialRating?: number;
  initialComment?: string;
  /** Called after a successful submit so the caller can refresh. */
  onSubmitted?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  initialRating = 0,
  initialComment = '',
  onSubmitted,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setError(null);
      setDone(false);
    }
  }, [isOpen, initialRating, initialComment]);

  if (!isOpen) return null;

  const submit = async () => {
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/products/${productId}/rate`, {
        value: rating,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      onSubmitted?.();
      setTimeout(onClose, 1100);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not submit your review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const shown = hover || rating;
  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  const content = done ? (
    <div className="flex flex-col items-center text-center" style={{ padding: '24px 0', gap: '14px' }}>
      <div className="flex items-center justify-center rounded-full" style={{ width: '64px', height: '64px', background: '#0F6E4F' }}>
        <Check size={32} color="#FFF" strokeWidth={3} />
      </div>
      <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Thank you!</p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your review has been posted.</p>
    </div>
  ) : (
    <>
      <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '4px' }}>
        Write a Review
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        How was it? Your review helps other shoppers.
      </p>

      <div className="flex flex-col" style={{ gap: '18px' }}>
        {/* Product */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}>
            {productImage ? (
              <Image src={productImage} alt={productName} fill style={{ objectFit: 'cover' }} sizes="52px" />
            ) : null}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{productName}</p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center" style={{ gap: '6px' }}>
          <div className="flex items-center" style={{ gap: '6px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <Star
                  size={34}
                  fill={s <= shown ? '#F5A623' : 'none'}
                  stroke={s <= shown ? '#F5A623' : 'var(--border-glass)'}
                />
              </button>
            ))}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: shown ? '#F5A623' : 'var(--text-muted)', height: '16px' }}>
            {LABELS[shown] || 'Tap to rate'}
          </span>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)…"
          rows={4}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', fontSize: '13px', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
        />

        {error && (
          <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>
        )}

        <button
          onClick={submit}
          disabled={submitting || rating < 1}
          className="w-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: submitting ? 'wait' : 'pointer', gap: '8px' }}
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {submitting ? 'Posting…' : 'Post Review'}
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
