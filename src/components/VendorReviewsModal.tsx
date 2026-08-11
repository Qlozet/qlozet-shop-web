'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface VendorReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: number;
  reviewCount: number;
  vendorName: string;
  /** Vendor's business id — reviews are aggregated across their products. */
  businessId?: string;
}

interface VendorReview {
  id: string;
  name: string;
  vendorBought: string;
  rating: number;
  date: string;
  text: string;
}

function dateFromObjectId(id?: string): string {
  if (!id || id.length < 8) return '';
  const secs = parseInt(id.substring(0, 8), 16);
  if (!secs) return '';
  const diff = Date.now() - secs * 1000;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return new Date(secs * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const VendorReviewsModal: React.FC<VendorReviewsModalProps> = ({
  isOpen,
  onClose,
  rating,
  reviewCount,
  vendorName,
  businessId,
}) => {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [avg, setAvg] = useState(rating);
  const [total, setTotal] = useState(reviewCount);
  const [breakdown, setBreakdown] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.get('/products/ratings/vendor', { params: { business_id: businessId, size: 50 } });
      const data = res.data?.data ?? res.data;
      const s = data?.summary ?? {};
      setAvg(s.average_rating ?? rating);
      setTotal(s.total_reviews ?? 0);
      setBreakdown([
        { label: 'Excellent', count: s.five_star ?? 0 },
        { label: 'Good', count: s.four_star ?? 0 },
        { label: 'Average', count: s.three_star ?? 0 },
        { label: 'Avg. Below', count: s.two_star ?? 0 },
        { label: 'Poor', count: s.one_star ?? 0 },
      ]);
      const rows = Array.isArray(data?.reviews) ? data.reviews : [];
      setReviews(
        rows.map((r: any, i: number) => ({
          id: String(r.created_at || i),
          name: r.reviewer?.name || r.reviewer?.email?.split('@')[0] || 'Verified buyer',
          vendorBought: r.product_name || '',
          rating: r.rating || 0,
          date: dateFromObjectId(typeof r.created_at === 'string' ? r.created_at : undefined),
          text: r.comment || '',
        })),
      );
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, rating]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 8px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#1A1A1A' }}>Reviews</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '8px 24px 24px' }}>
        {/* Rating Summary */}
        <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                fill={s <= Math.round(avg) ? '#F5A623' : 'none'}
                stroke={s <= Math.round(avg) ? '#F5A623' : '#D0D0D0'}
              />
            ))}
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>{Number(avg || 0).toFixed(1)}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          {total > 0 ? `Overall rating from ${total} customer review${total === 1 ? '' : 's'}` : 'No reviews yet'}
        </p>

        {/* Breakdown Bars */}
        {total > 0 && (
          <div className="flex flex-col" style={{ gap: '10px', marginBottom: '24px' }}>
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center" style={{ gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#666', width: '70px', flexShrink: 0 }}>{item.label}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', background: '#F0F0F0' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((item.count / maxCount) * 100)}%`,
                      background: item.label === 'Poor' ? '#1A1A1A' : '#8B7A47',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#999', width: '24px', textAlign: 'right' }}>
                  {String(item.count).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Review Cards */}
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '30px' }}>
            <Loader2 size={22} className="animate-spin" color="#B0A79C" />
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#AAA' }}>This vendor has no reviews yet.</p>
        ) : (
          <div className="flex flex-col" style={{ gap: '24px' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '20px' }}>
                {/* Stars + Date */}
                <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} fill={s <= review.rating ? '#F5A623' : 'none'} stroke={s <= review.rating ? '#F5A623' : '#D0D0D0'} />
                    ))}
                  </div>
                  {review.date && <span style={{ fontSize: '11px', color: '#AAA' }}>{review.date}</span>}
                </div>

                {/* Avatar (initial) + Name */}
                <div className="flex items-center" style={{ gap: '10px', marginBottom: review.text ? '10px' : 0 }}>
                  <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px', background: '#EFE9E3', color: '#462814', fontSize: '15px', fontWeight: 800 }}>
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{review.name}</p>
                    {review.vendorBought && <p style={{ fontSize: '11px', color: '#999' }}>{review.vendorBought}</p>}
                  </div>
                </div>

                {review.text && (
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{review.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[420px] z-[100] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-[calc(100%+60px)]'}`}
        style={{ maxHeight: '85vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
        </div>
        {content}
      </div>
    </>,
    document.body
  );
};
