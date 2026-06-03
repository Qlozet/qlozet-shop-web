'use client';

import React from 'react';
import { Star, SlidersHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';

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
}

// Mock reviews — seeded per product for variety
const MOCK_REVIEWS: Record<string, Review[]> = {
  prod_1: [
    { id: 'r1', name: 'Jasmine', rating: 5, date: 'Today', text: 'Great dress, it loved it, my order got delivered to me early and the dress fits perfectly. I will order more' },
    { id: 'r2', name: 'Adebayo', rating: 5, date: '2 days ago', text: 'The quality of the embroidery is absolutely incredible. Worth every naira spent.' },
    { id: 'r3', name: 'Chioma', rating: 4, date: '1 week ago', text: 'Beautiful agbada, the orange colour is vibrant. Slightly longer than expected but still love it.' },
    { id: 'r4', name: 'Kelechi', rating: 5, date: '2 weeks ago', text: 'Wore this to a wedding and got so many compliments. The craftsmanship is top notch.' },
  ],
  prod_2: [
    { id: 'r1', name: 'Tunde', rating: 5, date: 'Today', text: 'The lime colour is unique and the quality is superb. Everyone asked where I got it from.' },
    { id: 'r2', name: 'Amara', rating: 4, date: '3 days ago', text: 'Great fabric quality, breathable even in Lagos heat. The gold threading catches light beautifully.' },
    { id: 'r3', name: 'Emeka', rating: 5, date: '1 week ago', text: 'Perfect for owambe. Delivery was also faster than expected.' },
    { id: 'r4', name: 'Folake', rating: 5, date: '3 weeks ago', text: 'Ordered for my husband and he loves it. Will definitely buy more designs.' },
  ],
  default: [
    { id: 'r1', name: 'Jasmine', rating: 5, date: 'Today', text: 'Great product, loved it. My order got delivered early and the quality is perfect. Will definitely order again.' },
    { id: 'r2', name: 'Adebayo', rating: 4, date: '3 days ago', text: 'Good quality, met my expectations. The packaging was also very premium.' },
    { id: 'r3', name: 'Chioma', rating: 5, date: '1 week ago', text: 'Exceeded expectations! The attention to detail is remarkable.' },
    { id: 'r4', name: 'Kelechi', rating: 4, date: '2 weeks ago', text: 'Very happy with this purchase. Highly recommended for anyone looking for quality.' },
  ],
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  rating,
  totalReviews,
  productId,
}) => {
  const reviews = MOCK_REVIEWS[productId] || MOCK_REVIEWS.default;

  return (
    <div
      style={{
        padding: '32px',
        borderRadius: '20px',
        background: '#FAFAFA',
        border: '1px solid #F0F0F0',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>Reviews</h3>
        <button
          className="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          style={{ width: '36px', height: '36px', border: '1px solid #E5E5E5', background: 'white' }}
        >
          <SlidersHorizontal size={16} color="#666" />
        </button>
      </div>

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
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{rating}</span>
      </div>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
        Overall rating of {totalReviews} customer&apos;s reviews
      </p>

      {/* Review Cards Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: '#FFFFFF',
              border: '1px solid #F0F0F0',
            }}
          >
            {/* Stars + Date */}
            <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    fill={s <= review.rating ? '#F5A623' : 'none'}
                    stroke={s <= review.rating ? '#F5A623' : '#D0D0D0'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#AAA' }}>{review.date}</span>
            </div>

            {/* Reviewer Name */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
              {review.name}
            </h4>

            {/* Review Text */}
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
              {review.text}
            </p>

            {/* Thumbs up/down */}
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
  );
};
