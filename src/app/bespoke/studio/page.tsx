'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomization } from '@/hooks/useCustomization';
import { StudioHeader } from '@/components/studio/StudioHeader';
import { StudioCanvas } from '@/components/studio/StudioCanvas';
import { FloatingToolbar } from '@/components/studio/FloatingToolbar';
import { MobileBottomSheet } from '@/components/studio/MobileBottomSheet';
import { DesktopConfigPanel } from '@/components/studio/DesktopConfigPanel';

import { type ClothingType, type DesignGender } from '@/data/studio-options';

// ═══════════════════════════════════════════════════════════════
//  STUDIO CONTENT
// ═══════════════════════════════════════════════════════════════

function StudioContent() {
  const searchParams = useSearchParams();

  const designName = searchParams.get('name') || 'Untitled Design';
  const rawType = searchParams.get('type');
  const rawGender = searchParams.get('gender');

  // Map garment categories from the modal to clothing types
  const typeMap: Record<string, ClothingType> = {
    tops: 'top', shirts: 'top', blouses: 'top',
    dresses: 'full_body', jumpsuits: 'full_body', kaftan: 'full_body', agbada: 'full_body', sets: 'full_body', suits: 'full_body',
    skirts: 'bottom', pants: 'bottom', trousers: 'bottom',
  };
  const clothingType = rawType ? (typeMap[rawType.toLowerCase()] || undefined) : undefined;

  // Map gender from modal (men/women) to API gender
  const genderMap: Record<string, DesignGender> = { men: 'male', women: 'female', male: 'male', female: 'female', unisex: 'unisex' };
  const designGender = rawGender ? (genderMap[rawGender.toLowerCase()] || undefined) : undefined;

  const customization = useCustomization({
    mode: 'studio',
    initialDesignName: designName,
    initialClothingType: clothingType,
    initialGender: designGender,
  });

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col lg:flex-row"
      style={{
        backgroundColor: '#F9F9F9',
        backgroundImage: 'radial-gradient(#E5E5E5 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        minHeight: 'calc(100vh - 130px)',
      }}
    >
      {/* Floating Headers (Desktop + Mobile) */}
      <StudioHeader
        designName={designName}
        tokenBalance={customization.tokenBalance}
      />

      {/* Canvas Area */}
      <StudioCanvas
        currentImage={customization.currentImage}
        isGenerating={customization.isGenerating}
        referenceImages={customization.referenceImages}
      />

      {/* Desktop Floating Toolbar */}
      <FloatingToolbar customization={customization} />

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet customization={customization} />

      {/* Desktop Config Panel & CTAs */}
      <DesktopConfigPanel customization={customization} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

export default function BespokeStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-[#2C1810] animate-spin" />
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
