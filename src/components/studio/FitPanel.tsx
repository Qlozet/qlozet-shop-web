'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Loader2, Ruler } from 'lucide-react';
import { FIT_OPTIONS } from '@/data/studio-options';
import { FitOptionCard } from './FitOptionCard';
import { api } from '@/lib/api';

import { useRouter } from 'next/navigation';

interface FitPanelProps {
  selectedFit: string | null;
  onSelectFit: (id: string) => void;
  /** Chosen measurement-set name (null = whatever set is active). */
  measurementSetName?: string | null;
  onSelectMeasurementSet?: (name: string | null) => void;
}

interface SetRow {
  name: string;
  active: boolean;
}

export const FitPanel: React.FC<FitPanelProps> = ({
  selectedFit,
  onSelectFit,
  measurementSetName,
  onSelectMeasurementSet,
}) => {
  const router = useRouter();

  // The customer's saved measurement sets — the garment is sewn to whichever
  // one is chosen here (defaults to the active set). This choice is saved
  // with the design / cart line and snapshotted onto the order at payment.
  const [sets, setSets] = useState<SetRow[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get('/measurements/users/sets')
      .then((res) => {
        if (!alive) return;
        const wrapper = res?.data?.data || res?.data || {};
        const list = Array.isArray(wrapper?.sets)
          ? wrapper.sets
          : Array.isArray(wrapper)
            ? wrapper
            : [];
        setSets(
          list.map((s: any) => ({
            name: s.name || 'My measurements',
            active: !!(s.active || s.is_active),
          })),
        );
      })
      .catch(() => {
        /* signed-out or no sets — the link below covers setup */
      })
      .finally(() => {
        if (alive) setLoadingSets(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Which row reads as selected: the explicit choice, else the active set.
  const effectiveSet =
    measurementSetName ?? sets.find((s) => s.active)?.name ?? sets[0]?.name;

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Preference
        </span>
      </div>
      <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
        {FIT_OPTIONS.map((fit) => (
          <FitOptionCard
            key={fit.id}
            option={fit}
            isSelected={selectedFit === fit.id}
            onSelect={onSelectFit}
          />
        ))}
      </div>

      {/* ── Who is this for? ─────────────────────────────────── */}
      <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Measurements For
        </span>
        {loadingSets && <Loader2 size={12} className="animate-spin" color="var(--text-muted)" />}
      </div>

      {sets.length > 0 ? (
        <div className="flex flex-col" style={{ gap: '8px', marginBottom: '14px' }}>
          {sets.map((s) => {
            const isSel = effectiveSet === s.name;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => onSelectMeasurementSet?.(s.name)}
                className="flex items-center justify-between transition-all active:scale-[0.99]"
                style={{
                  padding: '12px 14px', borderRadius: '12px', textAlign: 'left',
                  border: `1.5px solid ${isSel ? 'var(--brand-fill)' : 'var(--border-glass)'}`,
                  background: isSel ? 'var(--bg-surface-elevated)' : 'transparent',
                  cursor: 'pointer', gap: '10px',
                }}
              >
                <span className="flex items-center" style={{ gap: '10px', minWidth: 0 }}>
                  <Ruler size={14} color={isSel ? 'var(--brand-brown)' : 'var(--text-muted)'} />
                  <span className="truncate" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {s.name}
                  </span>
                  {s.active && (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                      Active
                    </span>
                  )}
                </span>
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    border: isSel ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)',
                  }}
                >
                  {isSel && <Check size={9} color="var(--brand-fill-text)" />}
                </span>
              </button>
            );
          })}
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            The garment will be sewn to this measurement set — pick a saved
            profile to order for someone else.
          </p>
        </div>
      ) : !loadingSets ? (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px' }}>
          No measurements saved yet — add a set below so the tailor can sew to
          your size.
        </p>
      ) : null}

      {/* Measurements link */}
      <div
        className="flex items-center justify-between transition-all hover:bg-[var(--bg-surface-elevated)]"
        style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border-glass)', cursor: 'pointer' }}
        onClick={() => router.push('/profile?tab=measurements')}
      >
        <div>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>Your Measurements</p>
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tap to add or edit measurement sets
          </p>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
};
