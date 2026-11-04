'use client';

import React from 'react';
import { SILHOUETTES, NECKLINES, SLEEVES, type StyleOption, type ClothingType, type Garment, fullBodyStylesFor } from '@/data/studio-options';
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

// ─── Piece header (a two-piece set's top and bottom) ─────────
function PieceHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div style={{ margin: '4px 0 14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
      <span style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
      {note && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{note}</span>}
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
  showPrice = false,
}: {
  title: string;
  options: (PlatformStyle | ApiStyle)[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  fallback: StyleOption[];
  /** Real vendor pricing (product customisation) vs none (bespoke). */
  showPrice?: boolean;
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
            showPrice={showPrice}
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
  /** The garment picked on the start screen; decides which groups show. */
  garment?: Garment | null;
  /** Agbada and kaftan: whether the outfit includes trousers. */
  withTrousers?: boolean;
  onToggleTrousers?: (on: boolean) => void;
}

// ─── "Include trousers" switch (agbada, kaftan) ─────────────
function TrousersSwitch({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label
      htmlFor="include-trousers"
      className="flex items-center"
      style={{
        gap: '10px',
        padding: '10px 12px',
        marginBottom: '14px',
        borderRadius: '14px',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-surface-elevated)',
        cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Include trousers
        </span>
        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {on ? 'Turn off if you only want the top part made.' : 'Off: no trousers are made or shown.'}
        </span>
      </span>
      <input
        id="include-trousers"
        type="checkbox"
        role="switch"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '18px', height: '18px', accentColor: 'var(--brand-fill)', cursor: 'pointer' }}
      />
    </label>
  );
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
  garment,
  withTrousers = true,
  onToggleTrousers,
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
        {currentFullBody.length > 0 && <StyleSection title="Silhouette" options={currentFullBody} selectedId={selectedFullBody ?? null} onSelect={onSelectFullBody ?? (() => {})} isLoading={false} fallback={[]} showPrice />}
        {currentNecklines.length > 0 && <StyleSection title="Neckline" options={currentNecklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={false} fallback={[]} showPrice />}
        {currentSleeves.length > 0 && <StyleSection title="Sleeves" options={currentSleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={false} fallback={[]} showPrice />}
        {currentCollars.length > 0 && <StyleSection title="Collar" options={currentCollars} selectedId={selectedCollar ?? null} onSelect={onSelectCollar ?? (() => {})} isLoading={false} fallback={[]} showPrice />}
        {currentSkirts.length > 0 && <StyleSection title="Skirt Style" options={currentSkirts} selectedId={selectedSkirt ?? null} onSelect={onSelectSkirt ?? (() => {})} isLoading={false} fallback={[]} showPrice />}
        {currentTrousers.length > 0 && <StyleSection title="Trouser Style" options={currentTrousers} selectedId={selectedTrouser ?? null} onSelect={onSelectTrouser ?? (() => {})} isLoading={false} fallback={[]} showPrice />}
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

  const necklineSection = <StyleSection title="Neckline" options={necklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={isLoading} fallback={NECKLINES} />;
  const sleeveSection = <StyleSection title="Sleeves" options={sleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={isLoading} fallback={SLEEVES} />;
  const collar = (title = 'Collar') => <StyleSection title={title} options={collars} selectedId={selectedCollar ?? null} onSelect={onSelectCollar ?? (() => {})} isLoading={isLoading} fallback={[]} />;
  const skirt = (title = 'Skirt Style') => <StyleSection title={title} options={skirts} selectedId={selectedSkirt ?? null} onSelect={onSelectSkirt ?? (() => {})} isLoading={isLoading} fallback={[]} />;
  const trouser = (title = 'Trouser Style') => <StyleSection title={title} options={trousers} selectedId={selectedTrouser ?? null} onSelect={onSelectTrouser ?? (() => {})} isLoading={isLoading} fallback={[]} />;
  // Only the garment's own full-body styles: an agbada's robes, a dress's styles.
  const ownStyles = (title: string) => (
    <StyleSection title={title} options={fullBodyStylesFor(garment ?? null, fullBody)} selectedId={selectedFullBody ?? null} onSelect={onSelectFullBody ?? (() => {})} isLoading={isLoading} fallback={[]} />
  );
  const trousersPiece = (
    <>
      <PieceHeader title="Trousers" />
      {onToggleTrousers && <TrousersSwitch on={withTrousers} onChange={onToggleTrousers} />}
      {withTrousers && trouser()}
    </>
  );

  // Garments with their own layout.
  if (garment === 'agbada') {
    return (
      <div style={{ padding: '20px' }}>
        <PieceHeader title="Agbada" note="The wide outer robe" />
        {ownStyles('Robe Style')}
        <PieceHeader title="Inner top" note="Worn under the robe" />
        {necklineSection}
        {sleeveSection}
        {trousersPiece}
      </div>
    );
  }
  if (garment === 'kaftan') {
    return (
      <div style={{ padding: '20px' }}>
        <PieceHeader title="Kaftan" />
        {ownStyles('Style')}
        {necklineSection}
        {sleeveSection}
        {collar()}
        {trousersPiece}
      </div>
    );
  }
  if (garment === 'dresses') {
    return (
      <div style={{ padding: '20px' }}>
        {ownStyles('Dress Style')}
        <PieceHeader title="Bodice" note="The top half" />
        {necklineSection}
        {sleeveSection}
        <PieceHeader title="Skirt" note="The shape below the waist" />
        {skirt('Skirt Shape')}
      </div>
    );
  }
  if (garment === 'jumpsuits') {
    return (
      <div style={{ padding: '20px' }}>
        {ownStyles('Style')}
        <PieceHeader title="Top" />
        {necklineSection}
        {sleeveSection}
        <PieceHeader title="Legs" />
        {trouser('Leg Shape')}
      </div>
    );
  }
  if (garment === 'skirts') {
    return <div style={{ padding: '20px' }}>{skirt()}</div>;
  }
  if (garment === 'pants') {
    return <div style={{ padding: '20px' }}>{trouser()}</div>;
  }
  if (garment === 'suits') {
    return (
      <div style={{ padding: '20px' }}>
        <PieceHeader title="Jacket" />
        {collar('Lapel / Collar')}
        <PieceHeader title="Trousers" />
        {trouser()}
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

      {/* TWO-PIECE SET: the top's styles, then the bottom's (skirt or trousers) */}
      {clothingType === 'two_piece' && (
        <>
          <PieceHeader title="Top" />
          <StyleSection title="Neckline" options={necklines} selectedId={selectedNeckline} onSelect={onSelectNeckline} isLoading={isLoading} fallback={NECKLINES} />
          <StyleSection title="Sleeves" options={sleeves} selectedId={selectedSleeve} onSelect={onSelectSleeve} isLoading={isLoading} fallback={SLEEVES} />
          <StyleSection title="Collar" options={collars} selectedId={selectedCollar ?? null} onSelect={onSelectCollar ?? (() => {})} isLoading={isLoading} fallback={[]} />
          <PieceHeader title="Bottom" note="Pick a trouser or a skirt style" />
          <StyleSection title="Trouser Style" options={trousers} selectedId={selectedTrouser ?? null} onSelect={onSelectTrouser ?? (() => {})} isLoading={isLoading} fallback={[]} />
          <StyleSection title="Skirt Style" options={skirts} selectedId={selectedSkirt ?? null} onSelect={onSelectSkirt ?? (() => {})} isLoading={isLoading} fallback={[]} />
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
