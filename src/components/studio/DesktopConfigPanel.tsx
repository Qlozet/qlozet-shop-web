'use client';

import React from 'react';
import { Save, Scissors } from 'lucide-react';
import { RotateCcw, Dices } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';
import { resetCurrentSection } from './resetSection';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { GenerateButton } from './GenerateButton';
import { RequestQuotesModal } from './RequestQuotesModal';
import { InsufficientTokensModal } from './InsufficientTokensModal';
import { RefineBar } from './RefineBar';

interface DesktopConfigPanelProps {
  customization: CustomizationState;
  designId?: string | null;
  /** Called when Get Quotes saves the design for the first time. */
  onDesignSaved?: (id: string) => void;
}

export const DesktopConfigPanel: React.FC<DesktopConfigPanelProps> = ({ customization, designId, onDesignSaved }) => {
  const { expandedSection, tokenBalance, isGenerating, handleGenerate, generatedImages, setShowSaveModal } = customization;

  const [showOrderModal, setShowOrderModal] = React.useState(false);

  const hasGeneratedImages = generatedImages.length > 0;

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

  // Map clothingType back to category name for the save payload
  const categoryMap: Record<string, string> = {
    top: 'Tops', full_body: 'Dresses', bottom: 'Pants',
  };
  const designCategory = customization.clothingType
    ? (categoryMap[customization.clothingType] || customization.clothingType)
    : 'Design';

  const designGender = customization.designGender === 'male' ? 'men' as const : 'women' as const;

  const sectionLabel: Record<string, string> = {
    styles: 'Styles',
    fabric: 'Fabric',
    accessories: 'Finishing',
    fit: 'Fit',
    reference: 'Photo & Notes',
  };

  return (
    <div
      className="absolute z-20 hidden lg:flex flex-col"
      style={{ right: '24px', top: '90px', bottom: '24px', width: '380px', gap: '16px' }}
    >
      <div className="flex-1 flex flex-col bg-[var(--bg-base)] shadow-lg overflow-hidden border border-[var(--border-glass)] rounded-[24px]">
        {/* Context Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 20px 8px', borderBottom: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {sectionLabel[expandedSection] || ''}
          </span>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <button
              type="button"
              aria-label="Surprise me: pick styles, fabric and fit at random"
              title="Surprise me"
              onClick={customization.surpriseMe}
              className="flex items-center transition-transform hover:scale-105 active:scale-95"
              style={{
                gap: '5px',
                height: '30px',
                padding: '0 10px',
                borderRadius: '100px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Dices size={14} />
              <span>Surprise me</span>
            </button>
            {/* Clears the open section only — same behaviour as the mobile
                sheet's reset arrow, which shares this helper. */}
            <button
              type="button"
              aria-label="Reset this section"
              title="Reset this section"
              onClick={() => resetCurrentSection(customization)}
              className="flex items-center justify-center transition-transform hover:scale-105 active:scale-90"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <RotateCcw size={14} />
            </button>
            <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '5px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
              <TokenIcon size={14} color="#D4AF37" />
              {/* Pill background is a fixed cream, so the count stays dark in
                  both themes — var(--text-primary) turns white in dark mode
                  and vanishes against it. */}
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#2C1810' }}>{tokenBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0' }}>
          <SectionContent customization={customization} />
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="flex-shrink-0 flex flex-col w-full" style={{ gap: '10px' }}>
        <RefineBar customization={customization} />
        <GenerateButton isGenerating={isGenerating} onGenerate={handleGenerate} disabled={!canGenerate} cost={customization.generationCost} summary={customization.selectionSummary} />
        {customization.generationError && (
          <p style={{ fontSize: '11px', color: '#DC2626', textAlign: 'center', padding: '0 8px' }}>
            ⚠ {customization.generationError}
          </p>
        )}

        {/* Save Design / Get quotes */}
        {hasGeneratedImages ? (
          <div className="flex w-full" style={{ gap: '8px' }}>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{
                padding: '16px', borderRadius: '16px', background: 'var(--brand-fill)',
                color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: 'none', cursor: 'pointer', gap: '8px',
              }}
            >
              <Save size={16} />
              <span>Save Design</span>
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{
                padding: '16px', borderRadius: '16px', background: '#064E3B',
                color: '#FFF', fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: 'none', cursor: 'pointer', gap: '8px',
              }}
            >
              <Scissors size={16} />
              <span>Get quotes</span>
            </button>
          </div>
        ) : (
          <button
            disabled={!hasGeneratedImages}
            onClick={() => hasGeneratedImages && setShowOrderModal(true)}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
            style={{
              padding: '16px', borderRadius: '16px', background: '#064E3B',
              color: '#FFF', fontSize: '12px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              border: 'none',
              cursor: hasGeneratedImages ? 'pointer' : 'not-allowed',
              gap: '8px',
              opacity: hasGeneratedImages ? 1 : 0.4,
              pointerEvents: hasGeneratedImages ? 'auto' : 'none',
            }}
          >
            <Scissors size={16} />
            <span>Get quotes from tailors</span>
          </button>
        )}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, marginTop: '-4px' }}>
        Tailors reply with a price and delivery time. You only pay when you accept a quote.
      </p>

      {/* Save modal renders at the PAGE level (bespoke/studio/page.tsx) so it
          also opens on mobile — this panel is lg-only, and a modal nested here
          could never show below that breakpoint. */}
      {/* Request Quotes (Order Now) Modal */}
      <RequestQuotesModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        designName={customization.designName}
        category={designCategory}
        gender={designGender}
        designImages={customization.imagesForSave}
        backViews={customization.backViewsForSave}
        referenceImages={customization.referenceImages}
        selections={{
          neckline: customization.selectedNeckline,
          sleeve: customization.selectedSleeve,
          silhouette: customization.selectedSilhouette,
          collar: customization.selectedCollar,
          fabric: customization.selectedFabric,
          extra_fabrics: customization.extraFabricsForSave,
          color: customization.selectedColor,
          fit: customization.selectedFit,
          measurement_set: customization.measurementSetName || undefined,
          userPrompt: customization.userPrompt,
        }}
        designId={designId}
        onSaved={onDesignSaved}
        syncSaved
      />
      {/* Insufficient Tokens Modal */}
      <InsufficientTokensModal
        isOpen={customization.insufficientTokensInfo.show}
        balance={customization.insufficientTokensInfo.balance}
        cost={customization.insufficientTokensInfo.cost}
        onClose={customization.dismissInsufficientTokens}
        onPurchaseComplete={customization.retryLast}
      />
    </div>
  );
};
