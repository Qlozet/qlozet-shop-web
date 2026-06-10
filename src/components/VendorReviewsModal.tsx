'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Star, SlidersHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';

interface VendorReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: number;
  reviewCount: number;
  vendorName: string;
}

// Rating breakdown mock data
const BREAKDOWN = [
  { label: 'Excellent', percent: 35 },
  { label: 'Good', percent: 25 },
  { label: 'Average', percent: 20 },
  { label: 'Avg. Below', percent: 15 },
  { label: 'Poor', percent: 5 },
];

const MOCK_REVIEWS = [
  {
    id: 'vr1',
    name: 'Jasime',
    vendorBought: 'Maison De Vetements Loafe...',
    avatar: '/image/icon1.jpg',
    rating: 5,
    date: 'Today',
    text: 'Great dress, it loved it, my order got delivered to me early and the dress fits perfectly. I will order more',
  },
  {
    id: 'vr2',
    name: 'Jasime',
    vendorBought: 'Maison De Vetements Loafe...',
    avatar: '/image/icon2.jpg',
    rating: 5,
    date: 'Yesterday',
    text: 'Great dress, it loved it, my order got delivered to me early and the dress fits perfectly. I will order more',
  },
  {
    id: 'vr3',
    name: 'Adebayo',
    vendorBought: 'Custom Agbada Collection',
    avatar: '/image/icon3.jpg',
    rating: 4,
    date: '3 days ago',
    text: 'The quality of the embroidery is absolutely incredible. Worth every naira spent. Delivery was prompt too.',
  },
];

export const VendorReviewsModal: React.FC<VendorReviewsModalProps> = ({
  isOpen,
  onClose,
  rating,
  reviewCount,
  vendorName,
}) => {
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
                fill={s <= Math.round(rating) ? '#F5A623' : 'none'}
                stroke={s <= Math.round(rating) ? '#F5A623' : '#D0D0D0'}
              />
            ))}
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A' }}>{rating}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Overall rating of {reviewCount} customer&apos;s reviews
        </p>

        {/* Breakdown Bars */}
        <div className="flex flex-col" style={{ gap: '10px', marginBottom: '24px' }}>
          {BREAKDOWN.map((item) => {
            const count = Math.round((item.percent / 100) * reviewCount);
            return (
              <div key={item.label} className="flex items-center" style={{ gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#666', width: '70px', flexShrink: 0 }}>{item.label}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', background: '#F0F0F0' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      background: item.label === 'Poor' ? '#1A1A1A' : '#8B7A47',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#999', width: '24px', textAlign: 'right' }}>
                  {String(count).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Filter Icon */}
        <div className="flex justify-end" style={{ marginBottom: '16px' }}>
          <button
            className="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            style={{ width: '36px', height: '36px', border: '1px solid #E5E5E5', background: 'white' }}
          >
            <SlidersHorizontal size={16} color="#666" />
          </button>
        </div>

        {/* Review Cards */}
        <div className="flex flex-col" style={{ gap: '24px' }}>
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '20px' }}>
              {/* Stars + Date */}
              <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      fill={s <= review.rating ? '#F5A623' : 'none'}
                      stroke={s <= review.rating ? '#F5A623' : '#D0D0D0'}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#AAA' }}>{review.date}</span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center" style={{ gap: '10px', marginBottom: '10px' }}>
                <div
                  className="rounded-full overflow-hidden flex-shrink-0"
                  style={{ width: '40px', height: '40px', background: '#F0F0F0' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={review.avatar} alt={review.name} width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{review.name}</p>
                  <p style={{ fontSize: '11px', color: '#999' }}>{review.vendorBought}</p>
                </div>
              </div>

              {/* Text */}
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '12px' }}>
                {review.text}
              </p>

              {/* Thumbs */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 hover:text-green-600 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBB', fontSize: '12px' }}>
                  <ThumbsUp size={14} />
                </button>
                <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BBB', fontSize: '12px' }}>
                  <ThumbsDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
