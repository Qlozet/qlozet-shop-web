'use client';

import React, { useRef } from 'react';
import { type StyleOption } from '@/data/studio-options';
import { useLongPress, PreviewCard } from './PreviewCard';

interface StyleOptionButtonProps {
  option: StyleOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const StyleOptionButton: React.FC<StyleOptionButtonProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { showPreview, handlers, wasLongPress } = useLongPress();

  const handleClick = () => {
    if (wasLongPress()) return;
    onSelect(option.id);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        {...handlers}
        className="flex items-center transition-all hover:shadow-md w-full"
        style={{
          padding: '8px 12px',
          borderRadius: '16px',
          border: isSelected ? '1px solid #2C1810' : '1px solid transparent',
          background: isSelected ? '#FAF6F1' : '#F5F5F5',
          cursor: 'pointer',
          gap: '12px',
          height: '56px',
        }}
      >
        {/* Thumbnail */}
        <div
          className="flex items-center justify-center bg-white shadow-sm overflow-hidden"
          style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}
        >
          {option.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={option.imageUrl}
              alt={option.label}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              loading="lazy"
            />
          ) : (
            <span style={{ fontSize: '24px' }}>{option.emoji}</span>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 text-left flex flex-col justify-center" style={{ overflow: 'hidden', minWidth: 0 }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {option.label}
          </p>
          {option.extraCost !== undefined && (
            <p style={{ fontSize: '10px', fontWeight: 700, color: option.extraCost > 0 ? '#1A1A1A' : '#059669', marginTop: '2px' }}>
              {option.extraCost > 0 ? `+₦${option.extraCost.toLocaleString()}` : 'Included'}
            </p>
          )}
        </div>

        {/* Radio */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
            border: isSelected ? '1.5px solid #2C1810' : 'none',
            background: isSelected ? 'transparent' : '#D1D5DB',
          }}
        >
          {isSelected && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />
          )}
        </div>
      </button>

      {showPreview && (option.imageUrl || option.description || option.tags) && (
        <PreviewCard
          info={{
            label: option.label,
            imageUrl: option.imageUrl,
            description: option.description,
            tags: option.tags,
            extraCost: option.extraCost,
          }}
          anchorRef={btnRef}
        />
      )}
    </>
  );
};
