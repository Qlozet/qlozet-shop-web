'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { type ApiProduct, type ApiAddon, type ApiAddonVariant } from '@/lib/api-types';

interface AddonsPanelProps {
  selectedAddons: Record<string, string>;  // addonName -> selectedVariantName
  onSelectAddon: (addonName: string, variantName: string) => void;
  product?: ApiProduct;
}

export const AddonsPanel: React.FC<AddonsPanelProps> = ({
  selectedAddons,
  onSelectAddon,
  product,
}) => {
  const addons = product?.clothing?.addons || [];

  if (addons.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</p>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#666' }}>No add-ons</p>
        <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          This product doesn&apos;t have add-on options.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {addons.map((addon: ApiAddon) => (
        <div key={addon._id || addon.name} style={{ marginBottom: '24px' }}>
          {/* Section header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {addon.name}
            </span>
            <span style={{ fontSize: '10px', color: '#999' }}>
              {addon.variants.length} option{addon.variants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Variants */}
          {addon.display_type === 'colour' ? (
            <ColorAddonVariants
              addon={addon}
              selectedVariant={selectedAddons[addon.name]}
              onSelect={(variantName) => onSelectAddon(addon.name, variantName)}
            />
          ) : (
            <PictureAddonVariants
              addon={addon}
              selectedVariant={selectedAddons[addon.name]}
              onSelect={(variantName) => onSelectAddon(addon.name, variantName)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Color-type add-on (shows color swatches) ── */
function ColorAddonVariants({
  addon,
  selectedVariant,
  onSelect,
}: {
  addon: ApiAddon;
  selectedVariant?: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap" style={{ gap: '8px' }}>
      {addon.variants.map((v: ApiAddonVariant) => {
        const isSelected = selectedVariant === v.name;
        return (
          <button
            key={v._id || v.name}
            onClick={() => onSelect(v.name)}
            className="flex flex-col items-center transition-all"
            style={{
              padding: '8px',
              borderRadius: '12px',
              border: isSelected ? '2px solid #2C1810' : '2px solid transparent',
              background: isSelected ? '#FAF6F1' : '#F5F5F5',
              cursor: 'pointer',
              minWidth: '70px',
              gap: '4px',
            }}
          >
            {/* Color swatch */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: v.color_hex || '#CCC',
                border: '2px solid rgba(0,0,0,0.08)',
                boxShadow: isSelected ? '0 0 0 2px #2C1810' : 'none',
              }}
            />
            <span style={{
              fontSize: '9px', fontWeight: 700, color: '#1A1A1A',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '70px',
            }}>
              {v.name}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#666' }}>
              ₦{v.price.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Picture-type add-on (shows image cards) ── */
function PictureAddonVariants({
  addon,
  selectedVariant,
  onSelect,
}: {
  addon: ApiAddon;
  selectedVariant?: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
      {addon.variants.map((v: ApiAddonVariant) => {
        const isSelected = selectedVariant === v.name;
        return (
          <button
            key={v._id || v.name}
            onClick={() => onSelect(v.name)}
            className="flex items-center transition-all hover:shadow-md w-full"
            style={{
              padding: '8px 12px',
              borderRadius: '16px',
              border: isSelected ? '1px solid #2C1810' : '1px solid transparent',
              background: isSelected ? '#FAF6F1' : '#F5F5F5',
              cursor: 'pointer',
              gap: '12px',
              height: '56px',
            }}
          >
            {/* Thumbnail */}
            <div
              className="flex items-center justify-center bg-white shadow-sm overflow-hidden"
              style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}
            >
              {v.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={v.image_url}
                  alt={v.name}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  loading="lazy"
                />
              ) : (
                <span style={{ fontSize: '20px' }}>🎨</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 text-left flex flex-col justify-center" style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {v.name}
              </p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#1A1A1A', marginTop: '2px' }}>
                ₦{v.price.toLocaleString()}
              </p>
            </div>

            {/* Radio */}
            <div
              className="flex items-center justify-center"
              style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                border: isSelected ? '1.5px solid #2C1810' : 'none',
                background: isSelected ? 'transparent' : '#D1D5DB',
              }}
            >
              {isSelected && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
