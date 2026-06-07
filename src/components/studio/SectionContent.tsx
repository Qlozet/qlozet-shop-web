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

interface SectionContentProps {
  customization: CustomizationState;
}

export const SectionContent: React.FC<SectionContentProps> = ({ customization }) => {
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
      />
    );
  }

  if (expandedSection === 'accessories') {
    return (
      <AccessoriesPanel
        selectedAccessories={customization.selectedAccessories}
        onToggle={customization.toggleAccessory}
      />
    );
  }

  if (expandedSection === 'fit') {
    return (
      <FitPanel
        selectedFit={customization.selectedFit}
        onSelectFit={(id) => customization.setSelectedFit(id)}
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
      />
    );
  }

  return null;
};
