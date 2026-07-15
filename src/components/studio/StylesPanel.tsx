'use client';

import React from 'react';
import { SILHOUETTES, NECKLINES, SLEEVES, type StyleOption, type ClothingType } from '@/data/studio-options';
import { useStyleLibrary, type PlatformStyle, type StyleGender } from '@/hooks/useStyleLibrary';
import { StyleOptionButton } from './StyleOptionButton';

// ─── Map API PlatformStyle → local StyleOption ──────────────
const EMOJI_MAP: Record<string, string> = {
  neckline: '👗', sleeve: '🧤', collar: '👔', skirt: '👗',
  trouser: '👖', full_body: '👘', bodice: '🎀', hemline: '📏', back: '🔙',
};

function toStyleOption(s: PlatformStyle): StyleOption {
  return {
    id: s._id,
    label: s.name,
    emoji: EMOJI_MAP[s.category] || '✂️',
    imageUrl: s.image_url,
    description: s.description,
    styleCode: s.style_code,
    extraCost: s.price_suggestion,
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
          style={{ height: '56px', borderRadius: '16px', background: '#F0F0F0' }}
        />
      ))}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
  options: PlatformStyle[];
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
}) => {
  const { necklines, sleeves, collars, skirts, trousers, fullBody, isLoading } = useStyleLibrary(gender);

  // Debug — only log once when loading transitions
  const prevLoading = React.useRef(true);
  if (prevLoading.current !== isLoading) {
    console.log('[StylesPanel]', { clothingType, gender, isLoading, necklines: necklines.length, sleeves: sleeves.length, collars: collars.length, skirts: skirts.length, trousers: trousers.length, fullBody: fullBody.length });
    prevLoading.current = isLoading;
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
