'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { api } from '@/lib/api';

// "Pick looks you love" at sign-up (and "Update my style" later). Spotify's
// pick-artists screen for clothes: tap a look and a few similar ones appear
// right after it. Looks are real listings first, platform styles when there
// are too few (backend GET /recommends/onboarding/looks).

export interface OnboardingLook {
  id: string;
  kind: 'product' | 'style';
  name: string;
  image: string;
  label: string;
  vendor: { id: string; name: string } | null;
}

export interface LookPicks {
  productIds: string[];
  styleIds: string[];
}

interface Props {
  gender: 'male' | 'female';
  /** Called with what was picked, after the picks are saved. */
  onDone: (picks: LookPicks) => void;
  onSkip: () => void;
  /** Rendered instead when there is nothing to pick from at all. */
  fallback: React.ReactNode;
  continueLabel?: string;
  /** Desktop shows three columns. */
  wide?: boolean;
}

const MIN_PICKS = 3;
const key = (l: OnboardingLook) => `${l.kind}:${l.id}`;
// The backend wraps most answers in { data }; older routes don't.
type Wrapped<T> = { data?: T & { data?: T } };
const unwrap = <T,>(res: Wrapped<T>): T | undefined => res?.data?.data ?? res?.data;

export function PickLooksStep({ gender, onDone, onSkip, fallback, continueLabel = 'Continue', wide }: Props) {
  const [looks, setLooks] = useState<OnboardingLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [picked, setPicked] = useState<Map<string, OnboardingLook>>(new Map());
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OnboardingLook[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Looks that already brought in their "more like this" (once each).
  const expanded = useRef(new Set<string>());
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    api
      .get('/recommends/onboarding/looks', { params: { gender } })
      .then((res) => {
        if (!live) return;
        const list = unwrap<{ looks?: OnboardingLook[] }>(res)?.looks ?? [];
        setLooks(list);
        setEmpty(list.length === 0);
      })
      .catch(() => live && setEmpty(true))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [gender]);

  // Search, a moment after typing stops.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let live = true;
    const t = setTimeout(() => {
      api
        .get('/recommends/onboarding/looks', { params: { gender, q } })
        .then((res) => live && setResults(unwrap<{ looks?: OnboardingLook[] }>(res)?.looks ?? []))
        .catch(() => live && setResults([]))
        .finally(() => live && setSearching(false));
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, gender]);

  const addSimilar = async (look: OnboardingLook) => {
    const k = key(look);
    if (expanded.current.has(k)) return;
    expanded.current.add(k);
    try {
      const res = await api.get('/recommends/onboarding/looks/similar', {
        params: {
          kind: look.kind,
          id: look.id,
          gender,
          exclude: looks.map((l) => l.id).join(','),
          limit: 3,
        },
      });
      const more = unwrap<{ looks?: OnboardingLook[] }>(res)?.looks ?? [];
      if (!more.length) return;
      setLooks((prev) => {
        const have = new Set(prev.map(key));
        const add = more.filter((m) => !have.has(key(m)));
        const at = prev.findIndex((l) => key(l) === k);
        // A look picked from search isn't in the grid: put it and its
        // neighbours at the top.
        if (at < 0) return [look, ...add, ...prev.filter((l) => key(l) !== k)];
        return [...prev.slice(0, at + 1), ...add, ...prev.slice(at + 1)];
      });
      setFresh((prev) => new Set([...prev, ...more.map(key)]));
    } catch {
      /* the grid still works without "more like this" */
    }
  };

  const toggle = (look: OnboardingLook) => {
    const k = key(look);
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(k)) next.delete(k);
      else next.set(k, look);
      return next;
    });
    if (!picked.has(k)) {
      if (query.trim()) {
        // Picked from search: put it at the top of the grid and go back there.
        setLooks((prev) => (prev.some((l) => key(l) === k) ? prev : [look, ...prev]));
        changeQuery('');
      }
      void addSimilar(look);
    }
  };

  const available = looks.length;
  const needed = Math.min(MIN_PICKS, Math.max(1, available));
  const ready = picked.size >= needed;

  const save = async () => {
    const all = [...picked.values()];
    const picks: LookPicks = {
      productIds: all.filter((l) => l.kind === 'product').map((l) => l.id),
      styleIds: all.filter((l) => l.kind === 'style').map((l) => l.id),
    };
    setSaving(true);
    setError(null);
    try {
      await api.post('/recommends/onboarding/picks', {
        product_ids: picks.productIds,
        style_ids: picks.styleIds,
      });
      onDone(picks);
    } catch {
      setError('Couldn’t save your picks. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setResults(null);
    setSearching(!!value.trim());
  };

  const searchResults = query.trim() ? results : null;
  const shown = searchResults ?? looks;
  const counter = useMemo(() => {
    if (ready) return `${picked.size} picked`;
    return `${picked.size} of ${needed} picked`;
  }, [picked.size, ready, needed]);

  if (!loading && empty) return <>{fallback}</>;

  return (
    <div className="flex flex-col flex-1 animate-fade-in" style={{ gap: '16px', minHeight: 0 }}>
      <div>
        <h1
          style={{
            fontSize: wide ? '32px' : '22px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2,
            marginBottom: '8px',
            textTransform: wide ? undefined : 'uppercase',
          }}
        >
          Pick looks you love
        </h1>
        <p style={{ fontSize: wide ? '14px' : '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Tap at least {needed}. Each one you pick brings up more like it, and your home feed starts from these.
        </p>
      </div>

      <label
        className="flex items-center"
        style={{
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '14px',
          border: '1px solid var(--border-glass)',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        {searching ? (
          <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
        ) : (
          <Search size={16} color="var(--text-muted)" />
        )}
        <input
          id="onboarding-look-search"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          placeholder="Search looks, like agbada or ankara"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => changeQuery('')}
            aria-label="Clear search"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <X size={15} color="var(--text-muted)" />
          </button>
        )}
      </label>

      <div className="overflow-y-auto hide-scrollbar" style={{ flex: 1, minHeight: '260px', maxHeight: wide ? '440px' : undefined }}>
        {loading ? (
          <div className={`grid ${wide ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ gap: '10px' }}>
            {Array.from({ length: wide ? 9 : 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ aspectRatio: '3 / 4', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }}
              />
            ))}
          </div>
        ) : searchResults && searchResults.length === 0 && !searching ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 12px' }}>
            Nothing matches “{query.trim()}”. Try another word, or pick from the looks below the search.
          </p>
        ) : (
          <div className={`grid ${wide ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ gap: '10px' }}>
            {shown.map((look) => {
              const k = key(look);
              const on = picked.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggle(look)}
                  aria-pressed={on}
                  aria-label={`${look.name}${on ? ', picked' : ''}`}
                  className={`relative overflow-hidden text-left transition-all active:scale-[0.97] ${fresh.has(k) ? 'animate-fade-in' : ''}`}
                  style={{
                    aspectRatio: '3 / 4',
                    borderRadius: '16px',
                    border: on ? '3px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={look.image}
                    alt=""
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: on ? 0.85 : 1 }}
                  />
                  <span
                    className="absolute"
                    style={{
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '28px 10px 10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      textTransform: 'capitalize',
                    }}
                  >
                    {look.label || look.name}
                  </span>
                  {on && (
                    <span
                      className="absolute flex items-center justify-center"
                      style={{ top: '8px', right: '8px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand-fill)' }}
                    >
                      <Check size={14} color="var(--brand-fill-text)" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* On phones the buttons stay in view while the grid scrolls. */}
      <div
        className="flex flex-col"
        style={{
          gap: '10px',
          ...(wide ? {} : { position: 'sticky', bottom: 0, background: 'var(--bg-base)', paddingTop: '12px', paddingBottom: '8px' }),
        }}
      >
        {error && (
          <p role="alert" style={{ fontSize: '12px', color: '#DC2626', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!ready || saving}
          className="w-full flex items-center justify-center transition-all hover:opacity-90"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: ready ? 'var(--brand-fill)' : 'var(--border-glass)',
            color: ready ? 'var(--brand-fill-text)' : 'var(--text-muted)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: ready && !saving ? 'pointer' : 'not-allowed',
            gap: '8px',
            textTransform: 'uppercase',
          }}
        >
          {saving ? 'Saving…' : ready ? `${continueLabel} · ${counter}` : counter}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full flex items-center justify-center"
          style={{
            padding: '10px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: 'none',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
