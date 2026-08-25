'use client';

import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { suggestedAddresses } from '@/app/profile/data';

export interface AddressAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  variant?: 'box' | 'underline';
  placeholder?: string;
}

const BOX: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid var(--border-glass)',
  background: 'var(--bg-surface-elevated)',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

const UNDERLINE: React.CSSProperties = {
  padding: '12px 0',
  border: 'none',
  borderBottom: '1px solid var(--border-glass)',
  background: 'transparent',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
};

/**
 * Address input with the same suggester the address book uses — Google Places
 * when a key is present, otherwise the local curated list. Emits the chosen
 * address string via onChange.
 */
export function AddressAutocomplete({ value, onChange, variant = 'box', placeholder }: AddressAutocompleteProps) {
  const { isLoaded, predictions, search, clearPredictions } = useGooglePlaces();
  const [open, setOpen] = useState(false);
  const base = variant === 'box' ? BOX : UNDERLINE;

  const query = value.trim().toLowerCase();
  const localMatches = query
    ? suggestedAddresses.filter(
        (a) => a.main.toLowerCase().includes(query) || a.sub.toLowerCase().includes(query),
      )
    : suggestedAddresses.slice(0, 6);
  const usingGoogle = isLoaded && query.length > 0 && predictions.length > 0;
  const showDropdown = open && (usingGoogle ? predictions.length > 0 : localMatches.length > 0);

  const pick = (text: string) => {
    onChange(text);
    setOpen(false);
    clearPredictions();
  };

  return (
    <div className="relative" style={{ width: '100%' }}>
      <input
        type="text"
        placeholder={placeholder ?? 'Start typing your address…'}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          search(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ ...base, width: '100%' }}
        autoComplete="off"
        required
      />

      {showDropdown && (
        <div
          className="absolute left-0 right-0 z-50 overflow-y-auto hide-scrollbar"
          style={{
            top: 'calc(100% + 6px)',
            maxHeight: '240px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
          }}
        >
          {usingGoogle
            ? predictions.map((p) => (
                <button
                  key={p.placeId}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(p.fullDescription)}
                  className="w-full flex items-start text-left hover:bg-[var(--bg-surface-elevated)] transition-colors"
                  style={{ padding: '12px 14px', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <MapPin size={15} color="var(--brand-brown)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span className="flex flex-col" style={{ gap: '2px', minWidth: 0 }}>
                    <span className="truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.main}</span>
                    <span className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.sub}</span>
                  </span>
                </button>
              ))
            : localMatches.map((a, i) => (
                <button
                  key={`${a.main}-${i}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(`${a.main}, ${a.sub}`)}
                  className="w-full flex items-start text-left hover:bg-[var(--bg-surface-elevated)] transition-colors"
                  style={{ padding: '12px 14px', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <MapPin size={15} color="var(--brand-brown)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span className="flex flex-col" style={{ gap: '2px', minWidth: 0 }}>
                    <span className="truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.main}</span>
                    <span className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.sub}</span>
                  </span>
                </button>
              ))}
          {query.length > 0 && (usingGoogle ? predictions.length === 0 : localMatches.length === 0) && (
            <div className="flex items-center" style={{ padding: '14px', gap: '8px' }}>
              <Search size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No matches — you can type it in full.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
