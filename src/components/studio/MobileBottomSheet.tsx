'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ArrowDownUp, RotateCcw } from 'lucide-react';
import { STUDIO_TABS } from '@/data/studio-options';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { GenerateButton } from './GenerateButton';
import { InsufficientTokensModal } from './InsufficientTokensModal';
import { RequestQuotesModal } from './RequestQuotesModal';

interface MobileBottomSheetProps {
  customization: CustomizationState;
  designId?: string | null;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ customization, designId }) => {
  const { expandedSection, setExpandedSection, isGenerating, handleGenerate } = customization;

  const [showOrderModal, setShowOrderModal] = useState(false);

  const hasGeneratedImages = customization.generatedImages.length > 0;

  // Map clothingType back to category name for the order payload (mirrors desktop)
  const categoryMap: Record<string, string> = {
    top: 'Tops', full_body: 'Dresses', bottom: 'Pants',
  };
  const designCategory = customization.clothingType
    ? (categoryMap[customization.clothingType] || customization.clothingType)
    : 'Design';
  const designGender = customization.designGender === 'male' ? 'men' as const : 'women' as const;

  // Disable generate if nothing meaningful is selected or entered
  const hasAnySelection =
    !!customization.selectedSilhouette ||
    !!customization.selectedNeckline ||
    !!customization.selectedSleeve ||
    !!customization.selectedCollar ||
    !!customization.selectedSkirt ||
    !!customization.selectedTrouser ||
    !!customization.selectedFullBody ||
    !!customization.selectedFabric ||
    customization.selectedAccessories.length > 0 ||
    customization.userPrompt.trim().length > 0 ||
    customization.referenceImages.length > 0;

  const canGenerate = hasAnySelection && !isGenerating;

  // Drag state
  const [sheetHeight, setSheetHeight] = useState(35);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = sheetHeight;
  }, [sheetHeight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaY = dragStartY.current - e.touches[0].clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(92, Math.max(20, dragStartHeight.current + deltaPercent));
    setSheetHeight(newHeight);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    setSheetHeight(prev => {
      if (prev < 28) return 20;
      if (prev < 48) return 35;
      if (prev < 78) return 60;
      return 92;
    });
  }, []);

  // The ArrowDownUp icon is a height control: each tap raises the sheet to
  // the next snap point; from the top it wraps back to the lowest. Holding
  // and dragging it behaves exactly like the handle line.
  const SNAPS = [20, 35, 60, 92];
  const iconMoved = useRef(false);
  const iconTouched = useRef(false);

  const stepHeight = useCallback(() => {
    setSheetHeight(prev => {
      const nearest = SNAPS.reduce((a, b) =>
        Math.abs(b - prev) < Math.abs(a - prev) ? b : a
      );
      const idx = SNAPS.indexOf(nearest);
      return idx >= SNAPS.length - 1 ? SNAPS[0] : SNAPS[idx + 1];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sectionLabel: Record<string, string> = {
    styles: 'STYLES',
    fabric: 'FABRIC',
    accessories: 'ACCESSORIES',
    fit: 'FIT',
    details: 'DETAILS',
    reference: 'PHOTO',
  };

  return (
    <>
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center lg:hidden"
        style={{ height: `${sheetHeight}vh`, transition: isDragging.current ? 'none' : 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center w-full shrink-0 cursor-grab active:cursor-grabbing touch-none z-10"
          style={{ paddingBottom: '10px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Pill container hugs the line in the drawer's own colour so the
              handle reads as part of the sheet, not floating over the canvas. */}
          <div
            className="rounded-full"
            style={{
              padding: '6px 10px',
              background: 'var(--bg-base)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            }}
          >
            <div className="w-10 h-[5px] rounded-full" style={{ background: 'var(--drag-handle)' }} />
          </div>
        </div>

        {/* Sheet Body */}
        <div className="flex-1 flex flex-col bg-[var(--bg-base)] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] w-full overflow-hidden relative">

          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px 12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {sectionLabel[expandedSection] || ''}
            </h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Expand or collapse the panel"
                className="touch-none transition-transform active:scale-90"
                style={{ background: 'transparent', border: 'none', padding: '6px', margin: '-6px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                onClick={() => {
                  // Touch taps are handled in onTouchEnd; skip the synthetic
                  // click that follows so the sheet doesn't jump two steps.
                  if (iconTouched.current) {
                    iconTouched.current = false;
                    return;
                  }
                  stepHeight();
                }}
                onTouchStart={(e) => {
                  iconMoved.current = false;
                  handleTouchStart(e);
                }}
                onTouchMove={(e) => {
                  if (Math.abs(e.touches[0].clientY - dragStartY.current) > 8) {
                    iconMoved.current = true;
                  }
                  handleTouchMove(e);
                }}
                onTouchEnd={() => {
                  iconTouched.current = true;
                  if (iconMoved.current) {
                    handleTouchEnd(); // held + dragged → snap like the handle
                  } else {
                    isDragging.current = false; // plain tap → step up / wrap down
                    stepHeight();
                  }
                }}
              >
                <ArrowDownUp size={20} />
              </button>
              <RotateCcw size={20} color="var(--text-primary)" />
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex items-center overflow-x-auto hide-scrollbar shrink-0"
            style={{ gap: '24px', padding: '0 24px 14px', borderBottom: '1px solid var(--border-glass)', marginTop: '8px' }}
          >
            {STUDIO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setExpandedSection(tab.id)}
                className="flex flex-col items-center gap-1 shrink-0 relative transition-all"
                style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '12px', fontWeight: expandedSection === tab.id ? 800 : 500, color: expandedSection === tab.id ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  {tab.label}
                </span>
                {expandedSection === tab.id && (
                  <div className="absolute -bottom-[14px] w-full h-[2px] rounded-full" style={{ background: 'var(--text-primary)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: '100px' }}>
            <SectionContent customization={customization} />
          </div>

          {/* Sticky Generate + Order Buttons */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--bg-base) 0%, transparent) 0%, color-mix(in srgb, var(--bg-base) 85%, transparent) 30%, var(--bg-base) 60%)', padding: '40px 20px 20px' }}>
              {customization.generationError && (
                <p style={{ fontSize: '11px', color: '#DC2626', textAlign: 'center', marginBottom: '8px' }}>
                  ⚠ {customization.generationError}
                </p>
              )}
              <div className="flex items-center gap-3 pointer-events-auto">
                <GenerateButton isGenerating={isGenerating} onGenerate={handleGenerate} disabled={!canGenerate} className="flex-[3]" />
                <button
                  disabled={!hasGeneratedImages}
                  onClick={() => hasGeneratedImages && setShowOrderModal(true)}
                  className="flex-[2] flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#064E3B',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    border: 'none',
                    cursor: hasGeneratedImages ? 'pointer' : 'not-allowed',
                    opacity: hasGeneratedImages ? 1 : 0.4,
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InsufficientTokensModal
        isOpen={customization.insufficientTokensInfo.show}
        balance={customization.insufficientTokensInfo.balance}
        cost={customization.insufficientTokensInfo.cost}
        onClose={customization.dismissInsufficientTokens}
        onPurchaseComplete={handleGenerate}
      />

      {/* Request Quotes (Order Now) Modal */}
      <RequestQuotesModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        designName={customization.designName}
        category={designCategory}
        gender={designGender}
        designImages={customization.generatedImages}
        referenceImages={customization.referenceImages}
        selections={{
          neckline: customization.selectedNeckline,
          sleeve: customization.selectedSleeve,
          silhouette: customization.selectedSilhouette,
          collar: customization.selectedCollar,
          fabric: customization.selectedFabric,
          color: customization.selectedColor,
          fit: customization.selectedFit,
          userPrompt: customization.userPrompt,
        }}
        designId={designId}
      />
    </>
  );
};
