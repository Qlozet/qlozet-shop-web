'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2, ShoppingCart } from 'lucide-react';

interface StudioCanvasProps {
  currentImage: string | null;
  isGenerating: boolean;
  referenceImages: string[];
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  currentImage,
  isGenerating,
  referenceImages,
}) => (
  <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pt-[72px] pb-4 px-4 lg:pt-0 lg:pb-0 lg:px-0">
    {/* Card Wrapper */}
    <div className="relative w-full h-full lg:w-full lg:h-full lg:max-w-none lg:max-h-none max-w-[500px] max-h-[800px] flex items-center justify-center lg:bg-transparent rounded-[32px] lg:rounded-none">

      {/* Mobile Order Now (Cart Icon) */}
      {(currentImage || referenceImages.length > 0) && !isGenerating && (
        <button
          className="absolute top-4 right-4 z-10 lg:hidden flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#065F46', border: 'none', cursor: 'pointer' }}
        >
          <ShoppingCart size={18} color="#FFF" />
        </button>
      )}

      {/* Canvas content */}
      {isGenerating ? (
        // Generating state
        <div className="flex flex-col items-center animate-pulse" style={{ gap: '16px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)' }}
          >
            <Loader2 size={32} color="#7C3AED" className="animate-spin" />
          </div>
          <div className="text-center">
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Generating your outfit...</p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>This may take a moment</p>
          </div>
        </div>
      ) : currentImage ? (
        // Generated image
        <div className="relative animate-fade-in w-full h-full lg:max-w-[500px] lg:max-h-[90%]">
          <Image src={currentImage} alt="Generated outfit" fill style={{ objectFit: 'contain', padding: '16px' }} />
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center" style={{ gap: '16px' }}>
          <div className="relative w-[120px] h-[160px] opacity-20">
            <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M80 10 L60 40 L40 40 L30 80 L25 140 L45 180 L80 190 L115 180 L135 140 L130 80 L120 40 L100 40 Z" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M60 40 Q80 60 100 40" stroke="#1A1A1A" strokeWidth="4" />
              <path d="M30 80 L25 140" stroke="#1A1A1A" strokeWidth="4" />
              <path d="M130 80 L135 140" stroke="#1A1A1A" strokeWidth="4" />
            </svg>
          </div>
          <div className="text-center px-6">
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              NO DESIGN YET?
            </p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.5, maxWidth: '280px' }}>
              Select a style, fabric, and details — then tap Generate to preview your outfit.
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);
