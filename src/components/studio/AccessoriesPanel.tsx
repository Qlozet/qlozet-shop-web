'use client';

import React from 'react';
import {
  filterEmbellishments,
  type ClothingType,
  type DesignGender,
} from '@/data/studio-options';
import { AccessoryCheckbox } from './AccessoryCheckbox';

import { type ApiProduct } from '@/lib/api-types';

interface AccessoriesPanelProps {
  selectedAccessories: string[];
  onToggle: (id: string) => void;
  product?: ApiProduct;
  /** Studio mode: what's being designed, to filter the embellishment list. */
  clothingType?: ClothingType | null;
  gender?: DesignGender | null;
}

export const AccessoriesPanel: React.FC<AccessoriesPanelProps> = ({
  selectedAccessories,
  onToggle,
  product,
  clothingType,
  gender,
}) => {
  const productAccessories = product?.clothing?.accessories || [];

  // If we have a product but it has no accessories, show empty state
  if (product && productAccessories.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>✨</p>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>No accessories</p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          This product doesn&apos;t have add-on options.
        </p>
      </div>
    );
  }

  // Product customize mode uses the product's own priced add-ons; studio mode
  // offers tailor-applied embellishments filtered to the garment being
  // designed (the tailor prices these in their quote — no fixed costs).
  const isStudioMode = productAccessories.length === 0;
  const accessoryOptions = !isStudioMode
    ? productAccessories.map((a) => ({
        // Use the real sub-doc _id so selections map to the product's accessory
        // (customizationExtra and handleAddToCart both look these up by _id).
        id: (a as { _id?: string })._id ?? a.name,
        name: a.name,
        emoji: '✨',
        imageUrl: a.images?.[0]?.url,
        description: a.description,
        extraCost: a.price || 0,
      }))
    : filterEmbellishments(clothingType, gender);

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex flex-col" style={{ marginBottom: '12px', gap: '3px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {isStudioMode ? 'Finishing touches' : 'Accessories'}
        </span>
        {isStudioMode && (
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Finishing details your tailor applies to the garment — priced in their quote.
          </span>
        )}
      </div>
      <div className="grid grid-cols-2" style={{ gap: '8px' }}>
        {accessoryOptions.map((acc) => (
          <AccessoryCheckbox
            key={acc.id}
            accessory={acc}
            isSelected={selectedAccessories.includes(acc.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};
