'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Search, Star, X } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';
import { storeHref } from '@/lib/store-link';
import type { ApiBusinessPublic } from '@/lib/api-types';

// ─── All stores, A to Z ───────────────────────────────────────
// Every public store (GET /business/public?sort=name): a store/city search,
// Made to measure and On sale filters, the most popular stores as cover
// cards once there are enough of them, then letter sections with a letter
// rail to jump by. The phone app has the same page.

type StoreFilter = 'all' | 'bespoke' | 'sale';

// One request covers every store for now; raise this (or page through)
// when the shop passes it.
const STORE_LIMIT = 500;

function letterOf(name: string): string {
  const c = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const ch = (i: number) => Math.round(parseInt(clean.substring(i, i + 2), 16) * (1 - amount));
  return `#${[0, 2, 4].map((i) => ch(i).toString(16).padStart(2, '0')).join('')}`;
}

function isLightHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}

/** Cover, logo on the seam, name and rating on the store's own colour —
 *  the same card the search page draws. */
function StoreCoverCard({ store }: { store: ApiBusinessPublic }) {
  const theme = /^#?[0-9a-fA-F]{6}$/.test(store.theme_color ?? '') ? `#${store.theme_color!.replace('#', '')}` : '#2C1810';
  const light = isLightHex(theme);
  const text = light ? '#1a1a1a' : '#ffffff';
  return (
    <Link
      href={storeHref(store)}
      className="flex flex-col flex-shrink-0 transition-transform hover:-translate-y-1"
      style={{ width: '170px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', textDecoration: 'none' }}
    >
      <div className="relative w-full bg-[var(--bg-surface-elevated)]" style={{ height: '110px' }}>
        {store.cover_image_url && (
          <Image src={store.cover_image_url} alt={store.business_name} fill style={{ objectFit: 'cover' }} sizes="170px" />
        )}
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff', border: '3px solid var(--bg-base)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
        >
          {store.business_logo_url ? (
            <div className="relative w-full h-full">
              <Image src={store.business_logo_url} alt="" fill style={{ objectFit: 'cover' }} sizes="44px" />
            </div>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: 900, color: theme }}>{store.business_name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
      </div>
      <div
        className="text-center flex flex-col items-center"
        style={{ background: light ? darkenHex(theme, 0.05) : darkenHex(theme, 0.7), padding: '28px 12px 14px', gap: '4px' }}
      >
        <p className="font-display truncate w-full" style={{ fontSize: '11px', fontWeight: 800, color: text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          {store.business_name}
        </p>
        <div className="flex items-center" style={{ gap: '4px', fontSize: '11px', fontWeight: 700, color: text, opacity: 0.85 }}>
          {(store.average_rating ?? 0).toFixed(1)}
          <Star size={10} color="#D4AF37" fill="#D4AF37" />
          <span style={{ fontSize: '10px', fontWeight: 500, opacity: 0.75 }}>({store.total_ratings ?? 0})</span>
        </div>
      </div>
    </Link>
  );
}

function StoreRow({ store }: { store: ApiBusinessPublic }) {
  const items = store.total_products ?? 0;
  const meta = [store.city || store.state, `${items} item${items === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
  const rated = (store.total_ratings ?? 0) > 0;
  return (
    <Link
      href={storeHref(store)}
      className="flex items-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
      style={{ gap: '14px', padding: '12px 16px', borderRadius: '14px', textDecoration: 'none' }}
    >
      <div
        className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '1px solid var(--border-glass)' }}
      >
        {store.business_logo_url ? (
          <Image src={store.business_logo_url} alt="" fill style={{ objectFit: 'cover' }} sizes="48px" />
        ) : (
          <span className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: '#2C1810' }}>
            {store.business_name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {store.business_name}
        </p>
        <p className="flex items-center truncate" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0', gap: '4px' }}>
          <span className="truncate">{meta}</span>
          {rated && (
            <>
              <span aria-hidden>·</span>
              <Star size={12} color="#D4AF37" fill="#D4AF37" className="flex-shrink-0" />
              <span>{(store.average_rating ?? 0).toFixed(1)} ({store.total_ratings})</span>
            </>
          )}
        </p>
      </div>
      {store.has_active_discount && (
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', color: '#fff', background: '#E8590C', padding: '4px 8px', borderRadius: '6px' }}>
          SALE
        </span>
      )}
      <ChevronRight size={18} color="var(--text-muted)" className="flex-shrink-0" />
    </Link>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex-shrink-0 transition-colors"
      style={{
        padding: '10px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
        border: '1px solid var(--border-glass)',
        background: active ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
        color: active ? 'var(--brand-fill-text)' : 'var(--text-primary)',
      }}
    >
      {label}
    </button>
  );
}

export default function StoresPage() {
  const { vendors, loading, error, refetch } = useVendors({ limit: STORE_LIMIT, sort: 'name' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StoreFilter>('all');

  const all = useMemo(
    () => [...vendors].sort((a, b) => a.business_name.localeCompare(b.business_name, undefined, { sensitivity: 'base' })),
    [vendors],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((v) => {
      if (q && !v.business_name.toLowerCase().includes(q) && !(v.city ?? '').toLowerCase().includes(q)) return false;
      if (filter === 'bespoke') return v.accepts_bespoke !== false;
      if (filter === 'sale') return !!v.has_active_discount;
      return true;
    });
  }, [all, search, filter]);

  const sections = useMemo(() => {
    const out: { letter: string; stores: ApiBusinessPublic[] }[] = [];
    for (const v of visible) {
      const l = letterOf(v.business_name);
      if (out[out.length - 1]?.letter !== l) out.push({ letter: l, stores: [] });
      out[out.length - 1].stores.push(v);
    }
    return out;
  }, [visible]);

  const browsing = !search && filter === 'all';
  const popular = useMemo(
    () => [...all].sort((a, b) => (b.total_items_sold ?? 0) - (a.total_items_sold ?? 0)).slice(0, 8),
    [all],
  );
  const bespokeCount = all.filter((v) => v.accepts_bespoke !== false).length;
  const saleCount = all.filter((v) => v.has_active_discount).length;
  const showRail = sections.length >= 6;

  const jump = (letter: string) => {
    document.getElementById(`stores-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '20px', paddingBottom: '24px' }}>
      <div>
        <h1 className="font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]" style={{ fontSize: '22px' }}>
          All stores
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {loading ? 'Every store on Qlozet, A to Z' : `${all.length} store${all.length === 1 ? '' : 's'} on Qlozet, A to Z`}
        </p>
      </div>

      <div className="flex flex-col" style={{ gap: '12px', maxWidth: '640px' }}>
        <label
          className="flex items-center"
          style={{ gap: '10px', height: '46px', padding: '0 14px 0 16px', borderRadius: '23px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            id="stores-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a store or city"
            className="flex-1 min-w-0 bg-transparent outline-none"
            style={{ fontSize: '14px', color: 'var(--text-primary)', background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, height: '100%', borderRadius: 0, appearance: 'none' }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={16} color="var(--text-muted)" />
            </button>
          )}
        </label>
        <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '8px' }}>
          <Pill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          {bespokeCount > 0 && (
            <Pill label="Made to measure" active={filter === 'bespoke'} onClick={() => setFilter(filter === 'bespoke' ? 'all' : 'bespoke')} />
          )}
          {saleCount > 0 && (
            <Pill label="On sale" active={filter === 'sale'} onClick={() => setFilter(filter === 'sale' ? 'all' : 'sale')} />
          )}
        </div>
      </div>

      {browsing && all.length >= 8 && (
        <section>
          <h2 className="font-display" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '14px' }}>
            Popular stores
          </h2>
          <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '14px', paddingBottom: '8px' }}>
            {popular.map((v) => (
              <StoreCoverCard key={v._id} store={v} />
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex flex-col animate-pulse" style={{ gap: '8px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center" style={{ gap: '14px', padding: '12px 16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }} />
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <div style={{ height: '13px', width: '140px', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
                <div style={{ height: '11px', width: '90px', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error && all.length === 0 ? (
        <div className="flex flex-col items-center text-center" style={{ padding: '48px 24px', gap: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Couldn&apos;t load the stores</p>
          <button type="button" onClick={() => refetch()} style={{ fontSize: '13px', fontWeight: 700, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Try again
          </button>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center text-center" style={{ padding: '48px 24px', gap: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No stores match</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {search ? <>Nothing found for &ldquo;{search}&rdquo;.</> : 'No store fits this filter yet.'}
          </p>
          <button
            type="button"
            onClick={() => { setSearch(''); setFilter('all'); }}
            style={{ marginTop: '4px', padding: '10px 24px', borderRadius: '10px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            SHOW ALL STORES
          </button>
        </div>
      ) : (
        <div className="flex" style={{ gap: '12px' }}>
          <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '4px' }}>
            {sections.map(({ letter, stores }) => (
              <section key={letter} id={`stores-${letter}`} style={{ scrollMarginTop: '80px' }}>
                <h2
                  className="font-display"
                  style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', margin: '8px 0 4px' }}
                >
                  {letter}
                </h2>
                {stores.map((v) => (
                  <StoreRow key={v._id} store={v} />
                ))}
              </section>
            ))}
          </div>
          {showRail && (
            <nav
              aria-label="Jump to letter"
              className="sticky self-start flex flex-col items-center"
              style={{ top: '96px', padding: '6px 0', width: '26px', borderRadius: '13px', background: 'var(--bg-surface-elevated)' }}
            >
              {sections.map(({ letter }) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => jump(letter)}
                  style={{ height: '20px', width: '100%', fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {letter}
                </button>
              ))}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
