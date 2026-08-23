'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ApiRating {
  _id?: string;
  value: number;
  comment?: string;
  user?: { _id?: string; name?: string; email?: string } | string | null;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
}

interface ReviewsSectionProps {
  rating: number;
  totalReviews: number;
  productId: string;
  /** Bumping this re-fetches (e.g. after the customer posts a review). */
  refreshKey?: number;
}

// Relative date from a Mongo ObjectId's embedded timestamp.
function dateFromObjectId(id?: string): string {
  if (!id || id.length < 8) return '';
  const secs = parseInt(id.substring(0, 8), 16);
  if (!secs) return '';
  const diff = Date.now() - secs * 1000;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} week(s) ago`;
  return new Date(secs * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function reviewerName(user: ApiRating['user']): string {
  if (user && typeof user === 'object') {
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
  }
  return 'Verified buyer';
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  totalReviews,
  productId,
  refreshKey = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(rating);
  const [total, setTotal] = useState(totalReviews);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}/ratings`);
      const data = res.data?.data ?? res.data;
      const ratings: ApiRating[] = Array.isArray(data?.ratings) ? data.ratings : [];
      setAvg(data?.average ?? rating);
      setTotal(data?.total_reviews ?? ratings.length);
      setReviews(
        ratings
          .filter((r) => r && typeof r.value === 'number')
          .map((r, i) => ({
            id: r._id || String(i),
            name: reviewerName(r.user),
            rating: r.value,
            date: dateFromObjectId(r._id),
            text: r.comment || '',
          })),
      );
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, rating]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div style={{ padding: '32px', borderRadius: '20px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}>
      {/* Header */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Reviews</h3>

      {/* Rating Summary */}
      <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={16} fill={s <= Math.round(avg) ? '#F5A623' : 'none'} stroke={s <= Math.round(avg) ? '#F5A623' : '#D0D0D0'} />
          ))}
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{Number(avg || 0).toFixed(1)}</span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {total > 0 ? `Overall rating from ${total} customer review${total === 1 ? '' : 's'}` : 'No reviews yet'}
      </p>

      {loading ? (
        <div className="flex items-center justify-center" style={{ padding: '24px' }}>
          <Loader2 size={22} className="animate-spin" color="#B0A79C" />
        </div>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Be the first to review this product after your order is delivered.
        </p>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= review.rating ? '#F5A623' : 'none'} stroke={s <= review.rating ? '#F5A623' : '#D0D0D0'} />
                  ))}
                </div>
                {review.date && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{review.date}</span>}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: review.text ? '8px' : 0 }}>{review.name}</h4>
              {review.text && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
