'use client';

import React, { useEffect, useState } from 'react';
import { Check, Loader2, Search, Store, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// "Follow designers" after the looks step: round store photos, like Spotify's
// artists. Stores behind the picked looks come first (backend GET
// /recommends/onboarding/designers). Following uses the app's normal follow,
// so it shows in Profile → Following straight away.

interface Designer {
  id: string;
  business_name: string;
  business_logo_url: string | null;
  cover_images: string[];
  listings: number;
  followers_count: number;
  following: boolean;
}

interface Props {
  gender: 'male' | 'female';
  pickedProductIds: string[];
  onDone: () => void;
  finishLabel?: string;
  wide?: boolean;
}

// The backend wraps most answers in { data }; older routes don't.
type Wrapped<T> = { data?: T & { data?: T } };
const unwrap = <T,>(res: Wrapped<T>): T | undefined => res?.data?.data ?? res?.data;

export function FollowDesignersStep({ gender, pickedProductIds, onDone, finishLabel = 'Finish', wide }: Props) {
  const { followedVendors, toggleFollowVendor } = useApp();
  const [designers, setDesigners] = useState<Designer[] | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const picked = pickedProductIds.join(',');

  useEffect(() => {
    let live = true;
    const q = query.trim();
    const t = setTimeout(
      () => {
        api
          .get('/recommends/onboarding/designers', { params: { gender, picked, ...(q ? { q } : {}) } })
          .then((res) => live && setDesigners(unwrap<{ designers?: Designer[] }>(res)?.designers ?? []))
          .catch(() => live && setDesigners([]))
          .finally(() => live && setSearching(false));
      },
      q ? 350 : 0,
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [gender, picked, query]);

  // Nothing to suggest (and not because of a search): move on quietly.
  useEffect(() => {
    if (designers && designers.length === 0 && !query.trim() && !searching) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designers, searching]);

  const isFollowing = (d: Designer) => followedVendors.includes(d.id);
  const count = (designers ?? []).filter(isFollowing).length;

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
          Follow designers
        </h1>
        <p style={{ fontSize: wide ? '14px' : '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Stores and tailors whose work matches your picks. You’ll see their new pieces first.
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
        {searching && designers ? (
          <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
        ) : (
          <Search size={16} color="var(--text-muted)" />
        )}
        <input
          id="onboarding-designer-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearching(true);
          }}
          placeholder="Search designers by name"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSearching(true);
            }}
            aria-label="Clear search"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <X size={15} color="var(--text-muted)" />
          </button>
        )}
      </label>

      <div className="overflow-y-auto hide-scrollbar" style={{ flex: 1, minHeight: '240px', maxHeight: wide ? '440px' : undefined }}>
        {!designers ? (
          <div className={`grid ${wide ? 'grid-cols-4' : 'grid-cols-3'}`} style={{ gap: '18px 12px' }}>
            {Array.from({ length: wide ? 8 : 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center" style={{ gap: '8px' }}>
                <div className="animate-pulse" style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }} />
                <div className="animate-pulse" style={{ width: '70%', height: '10px', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
              </div>
            ))}
          </div>
        ) : designers.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 12px' }}>
            No designers match “{query.trim()}”.
          </p>
        ) : (
          <div className={`grid ${wide ? 'grid-cols-4' : 'grid-cols-3'}`} style={{ gap: '18px 12px' }}>
            {designers.map((d) => {
              const on = isFollowing(d);
              const photo = d.business_logo_url || d.cover_images[0];
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleFollowVendor(d.id)}
                  aria-pressed={on}
                  aria-label={`${on ? 'Unfollow' : 'Follow'} ${d.business_name}`}
                  className="flex flex-col items-center text-center transition-all active:scale-[0.96]"
                  style={{ gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span
                    className="relative flex items-center justify-center"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '50%',
                      background: 'var(--bg-surface-elevated)',
                      boxShadow: on ? '0 0 0 3px var(--brand-fill)' : '0 0 0 1px var(--border-glass)',
                    }}
                  >
                    <span className="absolute overflow-hidden" style={{ inset: 0, borderRadius: '50%' }}>
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                          <Store size={26} color="var(--text-muted)" />
                        </span>
                      )}
                    </span>
                    {on && (
                      <span
                        className="absolute flex items-center justify-center"
                        style={{ right: '2px', bottom: '2px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand-fill)', border: '2px solid var(--bg-base)' }}
                      >
                        <Check size={13} color="var(--brand-fill-text)" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {d.business_name}
                  </span>
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
        <button
          type="button"
          onClick={onDone}
          className="w-full flex items-center justify-center transition-all hover:opacity-90"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'var(--brand-fill)',
            color: 'var(--brand-fill-text)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {count > 0 ? `${finishLabel} · following ${count}` : finishLabel}
        </button>
        {count === 0 && (
          <button
            type="button"
            onClick={onDone}
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
        )}
      </div>
    </div>
  );
}
