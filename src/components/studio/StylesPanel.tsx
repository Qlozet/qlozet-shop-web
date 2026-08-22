'use client';

import React from 'react';
import { SILHOUETTES, NECKLINES, SLEEVES, type StyleOption, type ClothingType } from '@/data/studio-options';
import { useStyleLibrary, type PlatformStyle, type StyleGender } from '@/hooks/useStyleLibrary';
import { StyleOptionButton } from './StyleOptionButton';
import { type ApiProduct, type ApiStyle } from '@/lib/api-types';

// ─── Map API PlatformStyle → local StyleOption ──────────────
const EMOJI_MAP: Record<string, string> = {
  neckline: '👗', sleeve: '🧤', collar: '👔', skirt: '👗',
  trouser: '👖', full_body: '👘', bodice: '🎀', hemline: '📏', back: '🔙',
};

function toStyleOption(s: PlatformStyle | ApiStyle): StyleOption {
  return {
    id: ('_id' in s ? s._id : null) || s.style_code || s.name,
    label: s.name,
    emoji: EMOJI_MAP['category' in s ? s.category : (s.categories?.[0] || 'none')] || '✂️',
    imageUrl: ('images' in s && s.images && s.images[0]) ? s.images[0].url : ('image_url' in s ? s.image_url : undefined),
    description: s.description,
    tags: 'attributes' in s ? s.attributes : undefined,
    styleCode: s.style_code,
    extraCost: ('price_suggestion' in s ? s.price_suggestion : ('price' in s ? s.price : 0)) || 0,
  };
}

// ─── Skeleton Loader ────────────────────────────────────────
function StyleSkeleton() {
  return (
    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{ height: '56px', borderRadius: '16px', background: 'var(--border-glass)' }}
        />
      ))}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </span>
    </div>
  );
}

// ─── Style Section ──────────────────────────────────────────
function StyleSection({
  title,
  options,
  selectedId,
  onSelect,
  isLoading,
  fallback,
}: {
  title: string;
  options: (PlatformStyle | ApiStyle)[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  fallback: StyleOption[];
}) {
  // Use API styles if available, fallback to hardcoded
  const items: StyleOption[] = options.length > 0
    ? options.map(toStyleOption)
    : fallback;

  if (isLoading) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <SectionHeader title={title} />
        <StyleSkeleton />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <SectionHeader title={title} />
      <div className="grid grid-cols-2" style={{ gap: '8px' }}>
        {items.map((opt) => (
          <StyleOptionButton
            key={opt.id}
            option={opt}
            isSelected={selectedId === opt.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────
interface StylesPanelProps {
  selectedSilhouette: string | null;
  onSelectSilhouette: (id: string) => void;
  selectedNeckline: string | null;
  onSelectNeckline: (id: string) => void;
  selectedSleeve: string | null;
  onSelectSleeve: (id: string) => void;
  // New: for dynamic categories
  clothingType?: ClothingType;
  gender?: StyleGender;
  selectedCollar?: string | null;
  onSelectCollar?: (id: string) => void;
  selectedSkirt?: string | null;
  onSelectSkirt?: (id: string) => void;
  selectedTrouser?: string | null;
  onSelectTrouser?: (id: string) => void;
  selectedFullBody?: string | null;
  onSelectFullBody?: (id: string) => void;
  product?: ApiProduct;
}

export const StylesPanel: React.FC<StylesPanelProps> = ({
  selectedSilhouette,
  onSelectSilhouette,
  selectedNeckline,
  onSelectNeckline,
  selectedSleeve,
  onSelectSleeve,
  clothingType,
  gender,
  selectedCollar,
  onSelectCollar,
  selectedSkirt,
  onSelectSkirt,
  selectedTrouser,
  onSelectTrouser,
  selectedFullBody,
  onSelectFullBody,
  product,
}) => {
  const { necklines, sleeves, collars, skirts, trousers, fullBody, all: allPlatformStyles, isLoading } = useStyleLibrary(gender);

  const productStyles = product?.clothing?.styles || [];
  const useProductStyles = productStyles.length > 0;

  // Enrich product styles with descriptions from the platform style library
  // Product-embedded styles don't carry descriptions, but the library does
  const enrichedProductStyles: ApiStyle[] = useProductStyles
    ? productStyles.map(ps => {
        if (ps.description) return ps; // already has one
        const match = allPlatformStyles.find(lib => lib.style_code === ps.style_code);
        if (match?.description) {
          return { ...ps, description: match.description };
        }
        return ps;
      })
    : [];

  const getStyles = (cat: string, defaultStyles: PlatformStyle[]) => {
    if (useProductStyles) {
      return enrichedProductStyles.filter(s => s.categories?.includes(cat) || s.type === cat);
    }
    return defaultStyles;
  };

  const currentNecklines = getStyles('neckline', necklines);
  const currentSleeves = getStyles('sleeve', sleeves);
  const currentCollars = getStyles('collar', collars);
  const currentSkirts = getStyles('skirt', skirts);
  const currentTrousers = getStyles('trouser', trousers);
  const currentFullBody = getStyles('full_body', fullBody);

  // If using product styles, we don't strictly need a clothingType, we can just show what's available
  if (useProductStyles) {
    return (
      <div style={{ padding: '20px' }}>
        {currentFullBody.length > 0 && <StyleSection title="Silhouette" options={currentFullBody} selectedId={selectedFullBody ?? null} onSelect={onSelectFullBody ?? (() => {})} isLoading={false} fallback={[]} />}
        {currentNecklines.length > 0 && <StyleSection title="Neckline" options={currentNecklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={false} fallback={[]} />}
        {currentSleeves.length > 0 && <StyleSection title="Sleeves" options={currentSleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={false} fallback={[]} />}
        {currentCollars.length > 0 && <StyleSection title="Collar" options={currentCollars} selectedId={selectedCollar ?? null} onSelect={onSelectCollar ?? (() => {})} isLoading={false} fallback={[]} />}
        {currentSkirts.length > 0 && <StyleSection title="Skirt Style" options={currentSkirts} selectedId={selectedSkirt ?? null} onSelect={onSelectSkirt ?? (() => {})} isLoading={false} fallback={[]} />}
        {currentTrousers.length > 0 && <StyleSection title="Trouser Style" options={currentTrousers} selectedId={selectedTrouser ?? null} onSelect={onSelectTrouser ?? (() => {})} isLoading={false} fallback={[]} />}
      </div>
    );
  }

  // If no clothing type set, show the original layout (backward compat)
  if (!clothingType) {
    return (
      <div style={{ padding: '20px' }}>
        <StyleSection title="Silhouette" options={[]} selectedId={selectedSilhouette} onSelect={onSelectSilhouette} isLoading={false} fallback={SILHOUETTES} />
        <StyleSection title="Neckline" options={necklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={isLoading} fallback={NECKLINES} />
        <StyleSection title="Sleeves" options={sleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={isLoading} fallback={SLEEVES} />
      </div>
    );
  }

  // Dynamic rendering based on clothing type
  return (
    <div style={{ padding: '20px' }}>
      {/* TOP: Neckline + Sleeve + Collar */}
      {clothingType === 'top' && (
        <>
          <StyleSection title="Neckline" options={necklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={isLoading} fallback={NECKLINES} />
          <StyleSection title="Sleeves" options={sleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={isLoading} fallback={SLEEVES} />
          <StyleSection title="Collar" options={collars} selectedId={selectedCollar ?? null} onSelect={onSelectCollar ?? (() => {})} isLoading={isLoading} fallback={[]} />
        </>
      )}

      {/* BOTTOM: Skirt or Trouser */}
      {clothingType === 'bottom' && (
        <>
          <StyleSection title="Skirt Style" options={skirts} selectedId={selectedSkirt ?? null} onSelect={onSelectSkirt ?? (() => {})} isLoading={isLoading} fallback={[]} />
          <StyleSection title="Trouser Style" options={trousers} selectedId={selectedTrouser ?? null} onSelect={onSelectTrouser ?? (() => {})} isLoading={isLoading} fallback={[]} />
        </>
      )}

      {/* FULL BODY: Full Body Style + Neckline + Sleeve */}
      {clothingType === 'full_body' && (
        <>
          <StyleSection title="Style" options={fullBody} selectedId={selectedFullBody ?? null} onSelect={onSelectFullBody ?? (() => {})} isLoading={isLoading} fallback={SILHOUETTES} />
          <StyleSection title="Neckline" options={necklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={isLoading} fallback={NECKLINES} />
          <StyleSection title="Sleeves" options={sleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={isLoading} fallback={SLEEVES} />
        </>
      )}
    </div>
  );
};
