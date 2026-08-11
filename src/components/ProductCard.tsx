'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import type { StockState } from '@/lib/api-types';
import { StockBadge, soldOutImageStyle } from '@/components/StockBadge';

export interface ProductCardProps {
  id: string | number;
  imageUrl: string;
  title: string;
  brand: string;
  price: string | number;
  originalPrice?: string | number;
  tag?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string | number) => void;
  /** Computed stock state — badges + dims the card when sold out. */
  stockState?: StockState;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageUrl,
  title,
  brand,
  price,
  originalPrice,
  tag,
  isFavorite = false,
  onFavoriteToggle,
  stockState,
}) => {
  const soldOut = stockState === 'out_of_stock';
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking the favorite button
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    }
  };

  const formattedPrice = typeof price === 'number' ? `₦${price.toLocaleString()}` : price;
  const formattedOriginalPrice = originalPrice 
    ? (typeof originalPrice === 'number' ? `₦${originalPrice.toLocaleString()}` : originalPrice)
    : null;

  const trackEvent = useTrackEvent();

  const handleClick = () => {
    trackEvent({
      eventType: 'click_item',
      properties: { itemId: String(id), price: typeof price === 'number' ? price : undefined },
      context: { surface: 'product_card' },
    });
  };

  return (
    <Link 
      href={`/products/${id}`} 
      className="group flex flex-col w-full cursor-pointer transition-transform duration-300 hover:-translate-y-1"
      style={{ gap: '12px' }}
      onClick={handleClick}
    >
      {/* Image Section */}
      <div 
        className="relative w-full bg-white overflow-hidden rounded-[14px] lg:rounded-[20px] p-[4px] lg:p-[6px] shadow-sm border border-gray-100/50" 
        style={{ aspectRatio: '214/264' }}
      >
        <div className="relative w-full h-full overflow-hidden rounded-[8px] lg:rounded-[10px] bg-gray-50">
          <Image
            src={imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNCOCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={soldOut ? soldOutImageStyle : undefined}
          />

          {/* Stock badge (top-left) */}
          <StockBadge state={stockState} />

          {/* Customizable Tag Badge */}
          {tag === 'CUSTOMIZABLE' && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#2D2D2D',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: '6px',
                lineHeight: 1,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              CUSTOMIZABLE
            </div>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute z-10 flex items-center justify-center rounded-full transition-all active:scale-95 hover:bg-black/60"
          style={{
            top: '10px',
            right: '16px',
            width: '30px',
            height: '30px',
            backgroundColor: 'rgba(18, 17, 17, 0.51)',
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            width="20" 
            height="17.8" 
            viewBox="0 0 24 24" 
            fill={isFavorite ? '#FFFFFF' : 'rgba(18, 17, 17, 0.12)'} 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      {/* Details Section */}
      <div className="flex flex-col" style={{ gap: '4px' }}>
        
        {/* Brand Name */}
        <span 
          className="uppercase truncate text-left" 
          style={{ 
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif", 
            fontWeight: 800, 
            fontSize: '10px', 
            color: '#363636', 
            lineHeight: 1.3 
          }}
        >
          {brand}
        </span>

        {/* Product Title */}
        <h3 
          className="truncate whitespace-nowrap"
          style={{
            fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
            fontSize: '13px',
            color: '#2D2D2D',
            lineHeight: '20px',
            letterSpacing: '0.5px',
            paddingTop: '2px',
            paddingBottom: '2px',
          }}
        >
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span 
            style={{
              fontFamily: "var(--font-inter), 'Inter', sans-serif",
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#464646',
              lineHeight: '20px',
              letterSpacing: '0.8px',
            }}
          >
            {formattedPrice}
          </span>
          {formattedOriginalPrice && (
            <span
              style={{
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontWeight: 'normal',
                fontSize: '12px',
                color: '#999',
                textDecoration: 'line-through',
              }}
            >
              {formattedOriginalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
