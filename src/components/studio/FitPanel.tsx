'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, ChevronRight, Loader2, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FIT_OPTIONS } from '@/data/studio-options';
import { FitOptionCard } from './FitOptionCard';
import { api } from '@/lib/api';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useApp } from '@/context/AppContext';
import {
  GARMENT_LABELS,
  NEED_KEYS,
  NEED_LABELS,
  type GarmentKind,
  type NeedId,
} from '@/lib/garment-measurements';
import {
  ADD_MEASUREMENTS_HREF,
  MY_MEASUREMENTS_HREF,
  garmentGap,
  profileIsUsable,
  resolveProfile,
} from '@/lib/usable-measurements';

interface FitPanelProps {
  selectedFit: string | null;
  onSelectFit: (id: string) => void;
  /** Chosen measurement-set name (null = whatever set is active). */
  measurementSetName?: string | null;
  onSelectMeasurementSet?: (name: string | null) => void;
  /** What the outfit is, so the panel can say which measurements it needs. */
  garmentKind?: GarmentKind | null;
}

// The key a missing need is saved under. Height is the one people know for
// "torso length or height" and "height".
const SAVE_KEY: Partial<Record<NeedId, string>> = { top_length: 'height', full_length: 'height' };
const saveKeyFor = (need: NeedId) => SAVE_KEY[need] ?? NEED_KEYS[need][0];

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export const FitPanel: React.FC<FitPanelProps> = ({
  selectedFit,
  onSelectFit,
  measurementSetName,
  onSelectMeasurementSet,
  garmentKind,
}) => {
  const router = useRouter();
  const { user } = useApp();
  const { profiles, isLoading, fetchProfiles } = useMeasurements();

  // The set the garment is sewn to: the chosen one, else the active one.
  const profile = resolveProfile(profiles, measurementSetName);
  const usable = profileIsUsable(profile);
  const gap = usable ? garmentGap(profile, garmentKind) : null;

  // Missing points typed in here, saved straight onto the set.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveMissing = async () => {
    if (!profile || !gap) return;
    const measurements: Record<string, number> = {};
    for (const need of gap.missing) {
      const cm = Number(draft[need]);
      if (!Number.isFinite(cm) || cm < 5 || cm > 250) {
        setSaveError(`Enter your ${NEED_LABELS[need]} in centimetres, between 5 and 250.`);
        return;
      }
      // Older sets kept in inches store inches.
      measurements[saveKeyFor(need)] = profile.unit === 'inch' ? Math.round((cm / 2.54) * 10) / 10 : cm;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await api.patch(`/measurements/users/sets/${encodeURIComponent(profile.name)}`, { measurements });
      await fetchProfiles();
      setDraft({});
    } catch {
      setSaveError('Couldn’t save these. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const ready = !!gap && gap.missing.every((n) => (draft[n] ?? '').trim() !== '');

  return (
    <div className="flex flex-col" style={{ padding: '20px', gap: '20px' }}>
      <div className="flex flex-col" style={{ gap: '12px' }}>
        <span style={sectionLabel}>Preference</span>
        <div className="grid grid-cols-2" style={{ gap: '8px' }}>
          {FIT_OPTIONS.map((fit) => (
            <FitOptionCard key={fit.id} option={fit} isSelected={selectedFit === fit.id} onSelect={onSelectFit} />
          ))}
        </div>
      </div>

      {/* ── Whose measurements ─────────────────────────────────── */}
      <div className="flex flex-col" style={{ gap: '10px' }}>
        <div className="flex items-center justify-between">
          <span style={sectionLabel}>Measurements for</span>
          {isLoading && <Loader2 size={12} className="animate-spin" color="var(--text-muted)" />}
        </div>

        {profiles.length > 0 && (
          <div className="flex flex-col" style={{ gap: '8px' }}>
            {profiles.map((p) => {
              const isSel = profile?.name === p.name;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectMeasurementSet?.(p.name)}
                  className="flex items-center justify-between transition-all active:scale-[0.99]"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    border: `1.5px solid ${isSel ? 'var(--brand-fill)' : 'var(--border-glass)'}`,
                    background: isSel ? 'var(--bg-surface-elevated)' : 'transparent',
                    cursor: 'pointer',
                    gap: '10px',
                  }}
                >
                  <span className="flex items-center" style={{ gap: '10px', minWidth: 0 }}>
                    <Ruler size={14} color={isSel ? 'var(--brand-brown)' : 'var(--text-muted)'} />
                    <span className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                    {p.isDefault && (
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}
                      >
                        Active
                      </span>
                    )}
                  </span>
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: isSel ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)',
                    }}
                  >
                    {isSel && <Check size={9} color="var(--brand-fill-text)" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Does this set have what the outfit needs? ──────────── */}
        {!isLoading && profile && garmentKind && usable && !gap && (
          <p className="flex items-center" style={{ fontSize: '11px', color: 'var(--text-muted)', gap: '6px', margin: 0 }}>
            <Check size={13} color="#2D6A4F" style={{ flexShrink: 0 }} />
            {profile.name} has everything the tailor needs for this {GARMENT_LABELS[garmentKind]}.
          </p>
        )}

        {!isLoading && gap && profile && (
          <div
            className="flex flex-col"
            style={{ padding: '14px', borderRadius: '14px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', gap: '12px' }}
          >
            <div className="flex items-start" style={{ gap: '8px' }}>
              <AlertCircle size={15} color="#B45309" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                To make this {GARMENT_LABELS[gap.garment]}, the tailor also needs your{' '}
                {gap.missing.map((n) => NEED_LABELS[n]).join(', ')}. Add {gap.missing.length > 1 ? 'them' : 'it'} to{' '}
                <b>{profile.name}</b> here.
              </p>
            </div>
            <div className="grid grid-cols-2" style={{ gap: '8px' }}>
              {gap.missing.map((need) => (
                <label key={need} className="flex flex-col" style={{ gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {NEED_LABELS[need]}
                  </span>
                  <span
                    className="flex items-center"
                    style={{ border: '1px solid var(--border-glass)', borderRadius: '10px', background: 'var(--bg-base)', padding: '0 10px' }}
                  >
                    <input
                      id={`fit-missing-${need}`}
                      inputMode="decimal"
                      value={draft[need] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [need]: e.target.value.replace(/[^0-9.]/g, '') }))}
                      placeholder="0"
                      style={{ flex: 1, minWidth: 0, padding: '9px 0', background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>cm</span>
                  </span>
                </label>
              ))}
            </div>
            {saveError && (
              <p role="alert" style={{ fontSize: '11px', color: '#DC2626', margin: 0 }}>
                {saveError}
              </p>
            )}
            <button
              type="button"
              onClick={saveMissing}
              disabled={!ready || saving}
              className="w-full flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: ready ? 'var(--brand-fill)' : 'var(--border-glass)',
                color: ready ? 'var(--brand-fill-text)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: ready && !saving ? 'pointer' : 'not-allowed',
                gap: '6px',
              }}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save to {profile.name}
            </button>
          </div>
        )}

        {!user && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Sign in to choose whose measurements the tailor sews to. Your choices here are kept.
          </p>
        )}

        {user && !isLoading && !usable && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {profiles.length
              ? `${profile?.name ?? 'This set'} doesn’t have enough measurements yet. Add yours so the tailor can sew to your size. Your choices here are kept.`
              : 'No measurements saved yet. Add yours so the tailor can sew to your size. Your choices here are kept.'}
          </p>
        )}
      </div>

      {/* Measurements link (choices are remembered, so leaving is safe). */}
      <button
        type="button"
        className="w-full flex items-center justify-between transition-all hover:bg-[var(--bg-surface-elevated)]"
        style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border-glass)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => router.push(!user ? '/auth/login' : profiles.length ? MY_MEASUREMENTS_HREF : ADD_MEASUREMENTS_HREF)}
      >
        <span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {!user ? 'Sign in' : profiles.length ? 'Your measurements' : 'Add your measurements'}
          </span>
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {!user
              ? 'To use your saved measurements'
              : profiles.length
                ? 'Add or edit sets, type them or read them from a photo'
                : 'Type them, read them from a photo, or estimate from height and weight'}
          </span>
        </span>
        <ChevronRight size={16} color="var(--text-muted)" />
      </button>
    </div>
  );
};
