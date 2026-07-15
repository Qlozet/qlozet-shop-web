'use client';

import React from 'react';
import { Save, ShoppingCart } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { GenerateButton } from './GenerateButton';
import { SaveDesignModal } from './SaveDesignModal';
import { InsufficientTokensModal } from './InsufficientTokensModal';

interface DesktopConfigPanelProps {
  customization: CustomizationState;
  designId?: string | null;
}

export const DesktopConfigPanel: React.FC<DesktopConfigPanelProps> = ({ customization, designId }) => {
  const { expandedSection, tokenBalance, isGenerating, handleGenerate, generatedImages, showSaveModal, setShowSaveModal } = customization;

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
    accessories: 'Accessories',
    fit: 'Fit',
    reference: 'Reference',
  };

  return (
    <div
      className="absolute z-20 hidden lg:flex flex-col"
      style={{ right: '24px', top: '90px', bottom: '24px', width: '380px', gap: '16px' }}
    >
      <div className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden border border-gray-100 rounded-[24px]">
        {/* Context Header */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 20px 8px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {sectionLabel[expandedSection] || ''}
          </span>
          <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '5px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
            <TokenIcon size={14} color="#D4AF37" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>{tokenBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '0' }}>
          <SectionContent customization={customization} />
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="flex-shrink-0 flex flex-col w-full" style={{ gap: '10px' }}>
        <GenerateButton isGenerating={isGenerating} onGenerate={handleGenerate} disabled={!canGenerate} />
        {customization.generationError && (
          <p style={{ fontSize: '11px', color: '#DC2626', textAlign: 'center', padding: '0 8px' }}>
            ⚠ {customization.generationError}
          </p>
        )}

        {/* Save Design / Order Now */}
        {hasGeneratedImages ? (
          <div className="flex w-full" style={{ gap: '8px' }}>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{
                padding: '16px', borderRadius: '16px', background: '#2C1810',
                color: '#FFF', fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: 'none', cursor: 'pointer', gap: '8px',
              }}
            >
              <Save size={16} />
              <span>Save Design</span>
            </button>
            <button
              className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
              style={{
                padding: '16px 20px', borderRadius: '16px', background: '#064E3B',
                color: '#FFF', fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                border: 'none', cursor: 'pointer', gap: '8px',
              }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        ) : (
          <button
            disabled={!hasGeneratedImages}
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
            <ShoppingCart size={16} />
            <span>Order Now</span>
          </button>
        )}
      </div>

      {/* Save Modal */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        designName={customization.designName}
        category={designCategory}
        gender={designGender}
        designImages={generatedImages}
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
      {/* Insufficient Tokens Modal */}
      <InsufficientTokensModal
        isOpen={customization.insufficientTokensInfo.show}
        balance={customization.insufficientTokensInfo.balance}
        cost={customization.insufficientTokensInfo.cost}
        onClose={customization.dismissInsufficientTokens}
        onPurchaseComplete={handleGenerate}
      />
    </div>
  );
};
