'use client';

import React, { useState, useEffect } from 'react';
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

const BROWN = '#462814';

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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Write a review</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#888" />
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center text-center" style={{ padding: '40px 24px', gap: '14px' }}>
              <div className="flex items-center justify-center rounded-full" style={{ width: '64px', height: '64px', background: '#0F6E4F' }}>
                <Check size={32} color="#FFF" strokeWidth={3} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Thank you!</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Your review has been posted.</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ padding: '20px', gap: '18px' }}>
              {/* Product */}
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F5F3F0' }}>
                  {productImage ? (
                    <Image src={productImage} alt={productName} fill style={{ objectFit: 'cover' }} sizes="52px" />
                  ) : null}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{productName}</p>
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
                        stroke={s <= shown ? '#F5A623' : '#D0D0D0'}
                      />
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: shown ? '#F5A623' : '#BBB', height: '16px' }}>
                  {LABELS[shown] || 'Tap to rate'}
                </span>
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)…"
                rows={4}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: '13px', color: '#1A1A1A', resize: 'none', outline: 'none' }}
              />

              {error && (
                <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>{error}</p>
              )}

              <button
                onClick={submit}
                disabled={submitting || rating < 1}
                className="w-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ padding: '14px', borderRadius: '14px', background: BROWN, color: '#FFF', fontSize: '13px', fontWeight: 800, border: 'none', cursor: submitting ? 'wait' : 'pointer', gap: '8px' }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Posting…' : 'Post review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
