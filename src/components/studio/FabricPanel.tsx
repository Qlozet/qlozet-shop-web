'use client';

import React, { useState } from 'react';
import { FABRIC_COLORS } from '@/data/studio-options';
import { FabricCard } from './FabricCard';
import { ColorPicker } from './ColorPicker';
import { useFabricLibrary } from '@/hooks/useFabricLibrary';

import { type ApiProduct } from '@/lib/api-types';

interface FabricPanelProps {
  selectedFabric: string | null;
  onSelectFabric: (id: string) => void;
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  selectedSize?: string | null;
  product?: ApiProduct;
  /** Customer-supplied external fabric ("Use Fabric") — shown pre-selected. */
  appliedFabric?: { id?: string; name?: string; image?: string } | null;
}

export const FabricPanel: React.FC<FabricPanelProps> = ({
  selectedFabric,
  onSelectFabric,
  selectedColor,
  onSelectColor,
  selectedSize,
  product,
  appliedFabric,
}) => {
  const productFabrics = product?.clothing?.fabrics || [];
  const colorVariants = product?.clothing?.color_variants || [];
  // Real fabrics vendors have for sale — used in studio mode (no product) so
  // "generate" applies an actual, fetchable fabric instead of placeholders.
  const { fabrics: libraryFabrics } = useFabricLibrary();
  // Colour filter for the fabric picker (keyed by hex or name, lowercased).
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  // For customizable products, color_variants represent the fabric/color choices
  const hasColorVariants = colorVariants.length > 0;
  const hasFabrics = productFabrics.length > 0;

  // If we have a product but no fabrics AND no color variants, show empty state
  // (unless the customer applied their own fabric, which we always surface).
  if (product && !hasFabrics && !hasColorVariants && !appliedFabric?.image) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🧵</p>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>No fabric options</p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          This product doesn&apos;t have custom fabric choices.
        </p>
      </div>
    );
  }

  // Garment fabric requirement (yards) for the chosen size — bill of materials.
  const garmentYards = (() => {
    const list = (product?.clothing as { yardage_per_size?: Array<{ size?: string; yards?: number }> } | undefined)?.yardage_per_size;
    const gy = list?.find((y) => (y.size ?? '').toLowerCase() === (selectedSize ?? '').toLowerCase());
    return gy?.yards;
  })();

  // The customer's applied external fabric always shows first, pre-selected.
  const appliedFabricOption =
    appliedFabric?.image
      ? [
          {
            id: appliedFabric.id ?? 'applied-fabric',
            name: appliedFabric.name || 'Your fabric',
            image: appliedFabric.image,
            extraCost: 0,
            pricePerYard: 0,
            yards: 0,
            colors: [] as { name?: string; hex?: string }[],
          },
        ]
      : [];

  // Build fabric options from product fabrics — priced by the yard.
  const baseFabricOptions = hasFabrics
    ? productFabrics.map((f) => {
        const pricePerYard = (f as { price_per_yard?: number }).price_per_yard || 0;
        const yards = garmentYards || (f as { min_cut?: number }).min_cut || 1;
        return {
          // Real fabric sub-doc _id so the selection maps to the product's fabric.
          id: (f as { _id?: string })._id ?? f.name,
          name: f.name,
          image: f.images?.[0]?.url || '',
          extraCost: Math.round(pricePerYard * yards), // amount for this garment/size
          pricePerYard,
          yards,
          colors: ((f as { colors?: { name?: string; hex?: string }[] }).colors ?? []).filter((c) => c?.name || c?.hex),
        };
      })
    : !hasColorVariants ? libraryFabrics : [];

  const fabricOptions = [...appliedFabricOption, ...(baseFabricOptions as any[])];

  // ── Colour filter: distinct colours across the available fabrics ──
  const colorKey = (c?: { name?: string; hex?: string }) =>
    (c?.hex || c?.name || '').toLowerCase();
  const colorChips: { key: string; name?: string; hex?: string }[] = [];
  {
    const seen = new Set<string>();
    for (const fab of fabricOptions) {
      for (const c of (fab as { colors?: { name?: string; hex?: string }[] }).colors ?? []) {
        const key = colorKey(c);
        if (key && !seen.has(key)) {
          seen.add(key);
          colorChips.push({ key, name: c.name, hex: c.hex });
        }
      }
    }
  }
  const filteredFabricOptions = colorFilter
    ? fabricOptions.filter((fab) =>
        ((fab as { colors?: { name?: string; hex?: string }[] }).colors ?? []).some(
          (c) => colorKey(c) === colorFilter,
        ),
      )
    : fabricOptions;

  // Get the first image for each color variant (from any size variant)
  const getColorVariantImage = (cv: typeof colorVariants[0]) => {
    for (const v of cv.variants || []) {
      if (v.images && v.images.length > 0) return v.images[0].url;
    }
    return '';
  };

  // Material and color are independent: fabric (selectedFabric = fabric _id) is
  // priced by yardage; color variants are a separate dimension. Do NOT cross-sync
  // by name — that would overwrite selectedFabric with a name and break pricing.
  const handleSelectFabric = (fabricId: string) => {
    onSelectFabric(fabricId);
  };

  const handleSelectColor = (colorName: string) => {
    onSelectColor(colorName);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Fabric Material (if product has explicit fabrics) */}
      {fabricOptions.length > 0 ? (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Material
            </span>
          </div>

          {/* Colour filter chips — sort fabrics by colour */}
          {colorChips.length > 1 && (
            <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '6px', marginBottom: '12px', paddingBottom: '2px' }}>
              <button
                onClick={() => setColorFilter(null)}
                className="flex items-center flex-shrink-0 transition-all"
                style={{
                  padding: '5px 12px', borderRadius: '9999px',
                  border: colorFilter === null ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                  background: 'var(--bg-surface-elevated)',
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                All
              </button>
              {colorChips.map((c) => {
                const active = colorFilter === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setColorFilter(active ? null : c.key)}
                    title={c.name || c.hex}
                    className="flex items-center flex-shrink-0 transition-all"
                    style={{
                      padding: '5px 12px 5px 6px', borderRadius: '9999px', gap: '6px',
                      border: active ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: 'var(--bg-surface-elevated)', cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, background: c.hex || '#CCC', border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {c.name || c.hex}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
            {filteredFabricOptions.length > 0 ? (
              filteredFabricOptions.map((fab) => (
                <FabricCard
                  key={fab.id}
                  fabric={fab}
                  isSelected={selectedFabric === fab.id}
                  onSelect={handleSelectFabric}
                />
              ))
            ) : (
              <p className="col-span-2 text-center" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' }}>
                No fabrics in this colour.
              </p>
            )}
          </div>
        </>
      ) : null}

      {/* Color Variants (fabric colors for customizable products) */}
      {hasColorVariants && (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fabric Color
            </span>
          </div>
          <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
            {colorVariants.map((cv, idx) => {
              const cvName = cv.name || cv.color_name || '';
              const cvImage = getColorVariantImage(cv);
              const isSelected = selectedColor === cvName;
              const variantPrices = (cv.variants || []).map(v => v.price || 0).filter(p => p > 0);
              const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;

              return (
                <button
                  key={cv._id || cvName || String(idx)}
                  onClick={() => handleSelectColor(cvName)}
                  className="flex items-center transition-all hover:shadow-md w-full"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '16px',
                    border: isSelected ? '1px solid var(--brand-fill)' : '1px solid transparent',
                    background: 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    gap: '12px',
                    height: '56px',
                  }}
                >
                  {/* Thumbnail: image or hex swatch */}
                  <div
                    className="flex items-center justify-center shadow-sm overflow-hidden"
                    style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, background: 'var(--bg-surface-elevated)' }}
                  >
                    {cvImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cvImage}
                        alt={cvName}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: cv.hex || '#CCC',
                          borderRadius: '12px',
                        }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left flex flex-col justify-center" style={{ overflow: 'hidden', minWidth: 0 }}>
                    <div className="flex items-center" style={{ gap: '6px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: cv.hex || '#CCC',
                          border: '1px solid rgba(0,0,0,0.1)',
                          flexShrink: 0,
                        }}
                      />
                      <p style={{
                        fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {cvName}
                      </p>
                    </div>
                    {minPrice > 0 ? (
                      <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        from ₦{minPrice.toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  {/* Radio */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      border: isSelected ? '1.5px solid var(--brand-fill)' : 'none',
                      background: isSelected ? 'transparent' : 'var(--border-glass)',
                    }}
                  >
                    {isSelected && (
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-fill)' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Fallback: hardcoded color picker for studio mode */}
      {!product && (
        <>
          <span
            style={{
              fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              display: 'block', marginBottom: '12px',
            }}
          >
            Color
          </span>
          <ColorPicker
            colors={FABRIC_COLORS}
            selectedColor={selectedColor}
            onSelect={onSelectColor}
          />
        </>
      )}
    </div>
  );
};
