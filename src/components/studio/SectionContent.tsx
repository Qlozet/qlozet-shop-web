'use client';

import React from 'react';
import { type CustomizationState } from '@/hooks/useCustomization';
import { StylesPanel } from './StylesPanel';
import { FabricPanel } from './FabricPanel';
import { AccessoriesPanel } from './AccessoriesPanel';
import { FitPanel } from './FitPanel';
import { ReferencePanel } from './ReferencePanel';

// ═══════════════════════════════════════════════════════════════
//  SectionContent — renders the active panel based on expandedSection
//  Shared by MobileBottomSheet and DesktopConfigPanel.
// ═══════════════════════════════════════════════════════════════

import { type ApiProduct } from '@/lib/api-types';

interface SectionContentProps {
  customization: CustomizationState;
  product?: ApiProduct;
  selectedSize?: string | null;
}

export const SectionContent: React.FC<SectionContentProps> = ({ customization, product, selectedSize }) => {
  const { expandedSection } = customization;

  if (expandedSection === 'styles') {
    return (
      <StylesPanel
        selectedSilhouette={customization.selectedSilhouette}
        onSelectSilhouette={(id) => customization.setSelectedSilhouette(id)}
        selectedNeckline={customization.selectedNeckline}
        onSelectNeckline={(id) => customization.setSelectedNeckline(id)}
        selectedSleeve={customization.selectedSleeve}
        onSelectSleeve={(id) => customization.setSelectedSleeve(id)}
        clothingType={customization.clothingType ?? undefined}
        gender={customization.designGender ?? undefined}
        selectedCollar={customization.selectedCollar}
        onSelectCollar={(id) => customization.setSelectedCollar(id)}
        selectedSkirt={customization.selectedSkirt}
        onSelectSkirt={(id) => customization.setSelectedSkirt(id)}
        selectedTrouser={customization.selectedTrouser}
        onSelectTrouser={(id) => customization.setSelectedTrouser(id)}
        selectedFullBody={customization.selectedFullBody}
        onSelectFullBody={(id) => customization.setSelectedFullBody(id)}
        product={product}
      />
    );
  }

  if (expandedSection === 'fabric') {
    return (
      <FabricPanel
        selectedFabric={customization.selectedFabric}
        onSelectFabric={(id) => customization.setSelectedFabric(id)}
        selectedColor={customization.selectedColor}
        onSelectColor={(color) => customization.setSelectedColor(color)}
        selectedSize={selectedSize}
        product={product}
        appliedFabric={customization.appliedFabric}
      />
    );
  }

  if (expandedSection === 'accessories') {
    return (
      <AccessoriesPanel
        selectedAccessories={customization.selectedAccessories}
        onToggle={customization.toggleAccessory}
        product={product}
      />
    );
  }

  if (expandedSection === 'fit') {
    return (
      <FitPanel
        selectedFit={customization.selectedFit}
        onSelectFit={(id) => customization.setSelectedFit(id)}
        measurementSetName={customization.measurementSetName}
        onSelectMeasurementSet={customization.setMeasurementSetName}
      />
    );
  }

  if (expandedSection === 'reference') {
    return (
      <ReferencePanel
        referenceImages={customization.referenceImages}
        onRemove={customization.removeReference}
        onUploadClick={() => customization.fileInputRef.current?.click()}
        fileInputRef={customization.fileInputRef}
        onFileChange={customization.handleFileUpload}
        isUploading={customization.isUploading}
        uploadStatus={customization.uploadStatus}
        uploadError={customization.uploadError}
        userPrompt={customization.userPrompt}
        onPromptChange={customization.setUserPrompt}
        suggestedPrompt={customization.suggestedPrompt}
        isAnalyzing={customization.isAnalyzing}
      />
    );
  }

  return null;
};
