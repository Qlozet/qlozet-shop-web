'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TokenIcon } from '../icons/TokenIcon';
import { type SectionTab, FIT_OPTIONS } from '@/data/studio-options';
import { type CustomizationState } from '@/hooks/useCustomization';
import { SectionContent } from './SectionContent';
import { AccessoriesPanel } from './AccessoriesPanel';
import { AddonsPanel } from './AddonsPanel';
import { InsufficientTokensModal } from './InsufficientTokensModal';

// ═══════════════════════════════════════════════════════════════
//  ProductCustomizePanel
//  Wide slide-in panel for CUSTOMIZABLE products.
//  Desktop: fixed side panel from right (~55% viewport, portalled)
//  Mobile: bottom sheet with backdrop
//  Follows the same UX pattern as SizeGuideModal.
// ═══════════════════════════════════════════════════════════════

import { type ApiProduct, getProductImage, getProductName } from '@/lib/api-types';

interface ProductCustomizePanelProps {
  isOpen: boolean;
  customization: CustomizationState;
  onClose: () => void;
  product?: ApiProduct;
  selectedSize?: string | null;
}

export const ProductCustomizePanel: React.FC<ProductCustomizePanelProps> = ({
  isOpen,
  customization,
  onClose,
  product,
  selectedSize,
}) => {
  const { user } = useApp();
  const { expandedSection, setExpandedSection } = customization;

  // Build the edit-garment payload from the product + ALL current selections
  // (styles + descriptions, fabric, colour, accessories, add-ons, fit) and
  // generate an AI preview of the configured garment. The richer the notes, the
  // closer the generated image matches what the customer actually chose.
  const handleApply = async () => {
    if (!product || customization.isGenerating) return;

    const baseImage = getProductImage(product);
    if (!baseImage) return;

    const clothing = product.clothing;
    const firstImg = (
      imgs?: Array<string | { url?: string }>,
    ): string | undefined => {
      const raw = imgs?.[0];
      return typeof raw === 'string' ? raw : raw?.url;
    };

    // ── Styles keyed by garment part, in the image editor's expected metadata
    //    schema: parts = { neckline: { style, detail }, sleeve: { style }, … }.
    //    The Space reads `parts` (NOT constructionSelections), so this is what
    //    actually drives the structural edits. ──
    const stylePartMap: Array<[string, string | null]> = [
      ['silhouette', customization.selectedSilhouette],
      ['neckline', customization.selectedNeckline],
      ['sleeve', customization.selectedSleeve],
      ['collar', customization.selectedCollar],
      ['skirt', customization.selectedSkirt],
      ['trouser', customization.selectedTrouser],
      ['full_body', customization.selectedFullBody],
    ];

    const parts: Record<string, Record<string, string>> = {};
    const styleDescriptions: string[] = [];
    for (const [part, id] of stylePartMap) {
      if (!id) continue;
      const s = (clothing?.styles ?? []).find(
        (st: { _id?: string }) => st._id === id,
      ) as { name?: string; description?: string } | undefined;
      if (!s?.name) continue;
      parts[part] = {
        style: s.name,
        ...(s.description ? { detail: s.description } : {}),
      };
      styleDescriptions.push(
        s.description ? `${part}: ${s.name} (${s.description})` : `${part}: ${s.name}`,
      );
    }

    // ── Fabric: image + name ──
    const selFabric = (clothing?.fabrics ?? []).find(
      (f: { _id?: string }) => f._id === customization.selectedFabric,
    ) as { name?: string; images?: Array<string | { url?: string }> } | undefined;
    // A customer-supplied external fabric ("Use Fabric") overrides the catalog
    // fabric, so the AI edit renders the garment in the customer's own fabric.
    const fabricImage =
      customization.appliedFabric?.image ?? firstImg(selFabric?.images);
    const fabricName = customization.appliedFabric?.name ?? selFabric?.name;

    // ── Accessories: names + first accessory image ──
    const accessoryNames: string[] = [];
    let accessoryImage: string | undefined;
    for (const accId of customization.selectedAccessories) {
      const acc = (clothing?.accessories ?? []).find(
        (a: { _id?: string }) => a._id === accId,
      ) as { name?: string; images?: Array<string | { url?: string }> } | undefined;
      if (acc?.name) accessoryNames.push(acc.name);
      if (!accessoryImage) accessoryImage = firstImg(acc?.images);
    }

    // ── Add-ons: "Add-on: variant" ──
    const addonNames: string[] = Object.entries(customization.selectedAddons).map(
      ([addonName, variantName]) =>
        variantName ? `${addonName}: ${variantName}` : addonName,
    );

    // ── Fit + colour ──
    const fitLabel = FIT_OPTIONS.find(
      (f) => f.id === customization.selectedFit,
    )?.label;
    // The PDP feeds a colour NAME (e.g. "Teal") into the hook; ignore the raw
    // hex default so we never send "#1B2A4A" as a colour to the image editor.
    const colorName =
      customization.selectedColor && !customization.selectedColor.startsWith('#')
        ? customization.selectedColor
        : undefined;

    // ── Notes that drive the prompt. Lead with the styles as an explicit edit
    //    instruction (style_notes is the editor's dedicated "structural notes"
    //    field), then the supporting details. ──
    const noteParts: string[] = [];
    if (styleDescriptions.length)
      noteParts.push(
        `Restyle the garment so it has ${styleDescriptions.join('; ')}`,
      );
    if (fabricName) noteParts.push(`Fabric: ${fabricName}`);
    if (accessoryNames.length) noteParts.push(`Add these accessories: ${accessoryNames.join(', ')}`);
    if (addonNames.length) noteParts.push(`Add-ons: ${addonNames.join(', ')}`);
    if (fitLabel) noteParts.push(`Fit: ${fitLabel}`);
    if (selectedSize) noteParts.push(`Size: ${selectedSize}`);

    // ── Non-structural extras go in `notes` (the editor's metadata schema has
    //    no colour/accessory fields, and it takes fabric/colour ONLY from the
    //    fabric reference image, ignoring colour text by design). ──
    const notesBits: string[] = [];
    if (fitLabel) notesBits.push(`overall fit should read as ${fitLabel}`);
    if (accessoryNames.length) notesBits.push(`include these accessories: ${accessoryNames.join(', ')}`);
    if (addonNames.length) notesBits.push(`include these add-ons: ${addonNames.join(', ')}`);
    if (selectedSize) notesBits.push(`intended size ${selectedSize}`);

    // Metadata in the image editor's ACTUAL schema: it reads garment_type,
    // parts and notes. (The previous keys — garment, constructionSelections,
    // accessories… — were silently ignored, so the styles never reached the
    // prompt.) Fabric/colour come from the fabric reference image separately.
    const metadata = {
      garment_type: getProductName(product),
      parts,
      ...(notesBits.length ? { notes: notesBits.join('; ') } : {}),
    };

    const editPayload = {
      base_image_url: baseImage,
      garment_type: getProductName(product),
      ...(colorName ? { base_color: colorName } : {}),
      ...(fabricImage ? { fabric_image_url: fabricImage } : {}),
      ...(accessoryImage ? { accessory_image_url: accessoryImage } : {}),
      ...(fitLabel ? { fit: fitLabel } : {}),
      ...(noteParts.length ? { style_notes: noteParts.join(' | ') } : {}),
      metadata_json: metadata,
    };

    // Log exactly what we send so you can verify the chosen styles are present
    // and meaningfully named (empty/generic names => nothing for the model to do).
    console.log('[EditPreview] style_notes:', editPayload.style_notes);
    console.log('[EditPreview] metadata_json:', JSON.stringify(metadata, null, 2));

    await customization.generateProductPreview(editPayload);
  };

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Customize
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Personalize this outfit to your taste
          </p>
        </div>
        <div className="flex items-center" style={{ gap: '10px' }}>
          <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '5px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
            <TokenIcon size={14} color="#D4AF37" />
            {/* Sits on the fixed-light gold chip in both themes, so keep the
                text fixed dark — the theme token would go white and vanish. */}
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>{customization.tokenBalance.toLocaleString()}</span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-black transition-colors hover:bg-[var(--bg-surface-elevated)] rounded-full p-2"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center overflow-x-auto hide-scrollbar shrink-0"
        style={{
          gap: '20px',
          padding: '8px 24px 14px',
          borderBottom: '1px solid var(--border-glass)',
          ...(!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : {})
        }}
      >
        {(() => {
          // Build tabs dynamically based on what the product has
          const hasStyles = (product?.clothing?.styles?.length ?? 0) > 0;
          const hasFabrics = (product?.clothing?.fabrics?.length ?? 0) > 0 || (product?.clothing?.color_variants?.length ?? 0) > 0;
          const hasAccessories = (product?.clothing?.accessories?.length ?? 0) > 0;
          const hasAddons = (product?.clothing?.addons?.length ?? 0) > 0;

          const dynamicTabs: SectionTab[] = [];
          // Always show STYLE if the product has styles, or if no product is provided (studio mode)
          if (hasStyles || !product) dynamicTabs.push({ id: 'styles', label: 'STYLE' });
          if (hasFabrics || !product) dynamicTabs.push({ id: 'fabric', label: 'FABRIC' });
          if (hasAccessories || !product) dynamicTabs.push({ id: 'accessories', label: 'ACCESSORIES' });
          dynamicTabs.push({ id: 'fit', label: 'FIT' });
          if (hasAddons || !product) dynamicTabs.push({ id: 'addons', label: 'ADD-ONS' });

          return dynamicTabs.map((tab: SectionTab) => (
            <button
              key={tab.id}
              onClick={() => setExpandedSection(tab.id)}
              className="flex flex-col items-center gap-1 shrink-0 relative transition-all"
              style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: expandedSection === tab.id ? 800 : 500,
                  color: expandedSection === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.label}
              </span>
              {expandedSection === tab.id && (
                <div
                  className="absolute -bottom-[14px] w-full h-[2px] rounded-full"
                  style={{ background: 'var(--text-primary)' }}
                />
              )}
            </button>
          ));
        })()}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar"
        style={{
          paddingBottom: '16px',
          ...(!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : {})
        }}
      >
        {expandedSection === 'addons' ? (
          <AddonsPanel
            selectedAddons={customization.selectedAddons}
            onSelectAddon={customization.selectAddon}
            product={product}
          />
        ) : expandedSection === 'accessories' ? (
          <AccessoriesPanel
            selectedAccessories={customization.selectedAccessories}
            onToggle={customization.toggleAccessory}
            product={product}
          />
        ) : (
          <SectionContent customization={customization} product={product} selectedSize={selectedSize} />
        )}
      </div>

      {/* Footer CTAs */}
      {!user ? (
        <div className="shrink-0 flex flex-col gap-3" style={{ padding: '16px 24px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: '11.5px', color: '#8B5A2B', fontWeight: 600, lineHeight: 1.4, margin: 0, textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
            ⚠ You must sign in first to customize this product.
          </p>
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center transition-all hover:opacity-90 text-center"
            style={{
              padding: '13px',
              borderRadius: '12px',
              background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Sign In to Customize
          </Link>
        </div>
      ) : (
        <div className="shrink-0" style={{ padding: '0 24px' }}>
          {customization.generationError && (
            <p style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: 600, lineHeight: 1.4, margin: '0 0 10px', textAlign: 'center' }}>
              {customization.generationError}
            </p>
          )}
        </div>
      )}
      {user && (
        <div className="shrink-0 flex items-center gap-3" style={{ padding: '4px 24px 24px' }}>
          <button
            onClick={onClose}
            className="flex-1 transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={customization.isGenerating}
            className="flex-1 flex items-center justify-center transition-colors hover:opacity-90 disabled:opacity-60"
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: '#4C1D95',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: customization.isGenerating ? 'wait' : 'pointer',
              gap: '8px',
            }}
          >
            {customization.isGenerating ? (
              <span>Generating preview…</span>
            ) : (
              <>
                <span>Apply</span>
                <div className="flex items-center" style={{ gap: '4px', opacity: 0.85 }}>
                  <TokenIcon size={14} color="#D4AF37" />
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>{customization.editTokenCost}</span>
                </div>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet — portalled to body ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 z-[100] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
            style={{ maxHeight: '60vh', background: 'var(--bg-base)', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border-glass)' }} />
            </div>

            {panelContent}
          </div>
        </div>,
        document.body
      )}

      {/* ══════ DESKTOP: Floating card on the right — mirrors SizeGuideModal ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
          style={{ right: '48px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[420px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border-glass)' }}
          >
            {panelContent}
          </aside>
        </div>,
        document.body
      )}

      {/* Not enough tokens → offer a quick top-up, then retry the generation. */}
      <InsufficientTokensModal
        isOpen={customization.insufficientTokensInfo.show}
        balance={customization.insufficientTokensInfo.balance}
        cost={customization.insufficientTokensInfo.cost}
        onClose={customization.dismissInsufficientTokens}
        onPurchaseComplete={() => {
          customization.dismissInsufficientTokens();
          handleApply();
        }}
      />
    </>
  );
};
