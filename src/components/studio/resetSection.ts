import { toast } from 'sonner';
import { type CustomizationState } from '@/hooks/useCustomization';

/**
 * Clears ONLY the currently open studio section's selections, with a toast so
 * the action is legible. Shared by the mobile bottom sheet and the desktop
 * config panel — the two surfaces must clear exactly the same things, so the
 * switch lives here rather than being duplicated per layout.
 */
export function resetCurrentSection(customization: CustomizationState) {
  switch (customization.expandedSection) {
    case 'styles':
      customization.setSelectedNeckline(null);
      customization.setSelectedSleeve(null);
      customization.setSelectedCollar(null);
      customization.setSelectedSilhouette(null);
      customization.setSelectedSkirt(null);
      customization.setSelectedTrouser(null);
      customization.setSelectedFullBody(null);
      toast('Style selections cleared');
      break;
    case 'fabric':
      customization.setSelectedFabric(null);
      customization.setAppliedFabric(null);
      customization.setSelectedColor(null);
      toast('Fabric & colour cleared');
      break;
    case 'accessories':
      customization.selectedAccessories.forEach((id) =>
        customization.toggleAccessory(id),
      );
      toast('Finishing details cleared');
      break;
    case 'fit':
      customization.setSelectedFit(null);
      toast('Fit reset');
      break;
    case 'reference':
      // The panel holds both the reference photos and the written notes.
      customization.setReferenceImages([]);
      customization.setUserPrompt('');
      toast('Photos & notes cleared');
      break;
    case 'addons':
      // Only the product customize panel has this tab. selectAddon toggles,
      // so re-selecting each chosen variant clears it — same shape as the
      // accessories case above.
      Object.entries(customization.selectedAddons).forEach(
        ([addonName, variantName]) =>
          customization.selectAddon(addonName, variantName),
      );
      toast('Add-ons cleared');
      break;
  }
}
