'use client';

// StudioFabricPanel — the bespoke studio's fabric section.
//
// A garment has a main fabric and can have a contrast fabric and a lining.
// A two-piece set is one fabric for both pieces, or a top and a bottom slot.
// Each one is a slot: pick a fabric from the whole catalogue (search, colour
// filter, more pages), or let the tailor choose and buy it. Cards show the
// fabric's own price (per yard or per piece); the tailor sets the yards and
// the total in the quote.
// Product pages keep using FabricPanel.

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Search, Plus, X, Scissors, Loader2, Camera } from 'lucide-react';
import { FabricCard } from './FabricCard';
import { ColorPicker } from './ColorPicker';
import { type CustomizationState } from '@/hooks/useCustomization';
import { rememberFabrics, searchFabrics, useFabricLibrary } from '@/hooks/useFabricLibrary';
import { useCurrency } from '@/context/CurrencyContext';
import {
  FABRIC_COLORS,
  FABRIC_ROLE_HINT,
  FABRIC_ROLE_LABEL,
  FABRIC_COLOR_NAMES,
  slotLabel,
  type ExtraFabricRole,
  type FabricOption,
  type PhotoFabricMatch,
} from '@/data/studio-options';

type Role = 'main' | ExtraFabricRole;
const EXTRA_ROLES: ExtraFabricRole[] = ['contrast', 'lining'];

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const colorKey = (c?: { name?: string; hex?: string }) => (c?.hex || c?.name || '').toLowerCase();

export const StudioFabricPanel: React.FC<{ customization: CustomizationState }> = ({ customization }) => {
  const { fmt } = useCurrency();
  const { fabrics: known } = useFabricLibrary();
  const {
    selectedFabric,
    setSelectedFabric,
    appliedFabric,
    setAppliedFabric,
    selectedColor,
    setSelectedColor,
    extraFabrics,
    setExtraFabric,
    setExtraFabricColor,
    removeExtraFabric,
    clothingType,
    photoFabrics,
  } = customization;

  const [chosenRole, setRole] = useState<Role>('main');
  // A removed slot (or a reset elsewhere) falls back to the main fabric.
  const role: Role =
    chosenRole === 'main' || extraFabrics.some((x) => x.role === chosenRole) ? chosenRole : 'main';
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<FabricOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Which search the list shows; loading until it matches what was typed.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    searchFabrics({ search: debounced, page: 1 })
      .then((r) => {
        if (cancelled) return;
        setRows(r.rows);
        setHasMore(r.hasMore);
        setPage(1);
        setError(null);
      })
      .catch(() => !cancelled && setError('Fabrics could not load. Check your connection and try again.'))
      .finally(() => !cancelled && setLoadedFor(debounced));
    return () => {
      cancelled = true;
    };
  }, [debounced]);
  const loading = loadedFor !== debounced || loadingMore;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await searchFabrics({ search: debounced, page: page + 1 });
      setRows((prev) => [...prev, ...r.rows.filter((f) => !prev.some((p) => p.id === f.id))]);
      setHasMore(r.hasMore);
      setPage(page + 1);
    } catch {
      setError('More fabrics could not load. Try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const fabricById = (id: string | null | undefined): FabricOption | undefined => {
    if (!id) return undefined;
    if (appliedFabric?.id === id && appliedFabric.image) {
      const listed = known.find((f) => f.id === id);
      return listed ?? { id, name: appliedFabric.name || 'Your fabric', image: appliedFabric.image };
    }
    return known.find((f) => f.id === id) ?? rows.find((f) => f.id === id);
  };

  // Matches from the reference photo resolve like any picked fabric.
  useEffect(() => {
    if (!photoFabrics) return;
    const all = [
      ...Object.values(photoFabrics.matches).flat(),
      ...photoFabrics.sets.flatMap((st) => st.items.map((i) => i.match)),
    ].filter((m): m is PhotoFabricMatch => !!m);
    rememberFabrics(
      all.map((m) => ({
        id: m.fabric_id,
        name: m.name,
        image: m.image ?? '',
        pricePerYard: m.price_per_yard ?? undefined,
        extraCost: m.price_per_yard ?? undefined,
        vendorName: m.vendor_name ?? undefined,
      })),
    );
  }, [photoFabrics]);
  const inPhoto = (r: Role) => !!photoFabrics?.fabrics.some((f) => f.role === r);

  const slotFabricId = (r: Role) =>
    r === 'main' ? selectedFabric : (extraFabrics.find((x) => x.role === r)?.fabric ?? null);
  // The main slot is either a fabric or just a colour, never both: picking
  // one clears the other.
  const pick = (r: Role, id: string | null) => {
    // Only a two-piece set has a bottom slot (a photo match can name one).
    if (r === 'bottom' && clothingType !== 'two_piece') return;
    if (r !== 'main') return setExtraFabric(r, id);
    setSelectedFabric(id);
    if (id) setSelectedColor(null);
  };
  const pickColour = (r: Role, hex: string | null) => {
    if (r !== 'main') return setExtraFabricColor(r, hex);
    setSelectedColor(hex);
    if (hex) {
      setSelectedFabric(null);
      if (appliedFabric) setAppliedFabric(null);
    }
  };
  const slotColour = (r: Role) =>
    r === 'main' ? selectedColor : (extraFabrics.find((x) => x.role === r)?.color ?? null);
  const colourName = (hex: string) => FABRIC_COLOR_NAMES[hex.toUpperCase()] ?? hex;

  const isSet = clothingType === 'two_piece';
  const hasBottom = extraFabrics.some((x) => x.role === 'bottom');
  const nameOf = (r: Role) => slotLabel(r, clothingType, hasBottom);

  const slots: Role[] = ['main', ...extraFabrics.map((x) => x.role)];
  const canAdd = EXTRA_ROLES.filter((r) => !extraFabrics.some((x) => x.role === r));
  const activeId = slotFabricId(role);
  const active = fabricById(activeId);

  // The customer's own fabric (from a fabric page) leads the main slot's list.
  const listed = useMemo(() => {
    const own = appliedFabric?.id && appliedFabric.image ? fabricById(appliedFabric.id) : undefined;
    const base = own && role === 'main' ? [own, ...rows.filter((f) => f.id !== own.id)] : rows;
    return colorFilter
      ? base.filter((f) => (f.colors ?? []).some((c) => colorKey(c) === colorFilter))
      : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, colorFilter, role, appliedFabric, known]);

  const colorChips = useMemo(() => {
    const seen = new Set<string>();
    const out: { key: string; name?: string; hex?: string }[] = [];
    for (const f of rows) {
      for (const c of f.colors ?? []) {
        const key = colorKey(c);
        if (key && !seen.has(key)) {
          seen.add(key);
          out.push({ key, name: c.name, hex: c.hex });
        }
      }
    }
    return out.slice(0, 16);
  }, [rows]);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── A set: one fabric for both pieces, or one each ── */}
      {isSet && (
        <label
          htmlFor="same-fabric-both"
          className="flex items-center"
          style={{
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-surface-elevated)',
            cursor: 'pointer',
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Same fabric for top and bottom
            </span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {hasBottom
                ? 'Off: pick the top and the bottom separately.'
                : inPhoto('bottom')
                  ? 'Your photo’s bottom looks like a different fabric. Turn this off to pick it.'
                  : 'Turn off to give the bottom its own fabric or colour.'}
            </span>
          </span>
          <input
            id="same-fabric-both"
            type="checkbox"
            role="switch"
            checked={!hasBottom}
            onChange={(e) => {
              if (e.target.checked) {
                removeExtraFabric('bottom');
                setRole('main');
              } else {
                setExtraFabric('bottom', null);
                setRole('bottom');
              }
            }}
            style={{ width: '18px', height: '18px', accentColor: 'var(--brand-fill)', cursor: 'pointer' }}
          />
        </label>
      )}

      {/* ── Slots ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={label}>Fabrics</span>
        <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '8px', paddingBottom: '2px' }}>
          {slots.map((r) => {
            const f = fabricById(slotFabricId(r));
            const on = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={on}
                className="flex items-center flex-shrink-0 transition-all"
                style={{
                  gap: '8px',
                  padding: '6px 12px 6px 6px',
                  borderRadius: '9999px',
                  border: on ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                  background: 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="relative overflow-hidden flex items-center justify-center"
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--border-glass)', flexShrink: 0 }}
                >
                  {f?.image ? (
                    <Image src={f.image} alt="" fill sizes="26px" style={{ objectFit: 'cover' }} />
                  ) : slotColour(r) ? (
                    <span style={{ position: 'absolute', inset: 0, background: slotColour(r)! }} />
                  ) : (
                    <Scissors size={13} style={{ color: 'var(--text-muted)' }} />
                  )}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {nameOf(r)}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f ? f.name : slotColour(r) ? `${colourName(slotColour(r)!)} · tailor sources` : 'Tailor chooses'}
                  </span>
                </span>
              </button>
            );
          })}
          {canAdd.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setExtraFabric(r, null);
                setRole(r);
              }}
              className="flex items-center flex-shrink-0 transition-all"
              style={{
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                border: inPhoto(r) ? '1px dashed var(--brand-fill)' : '1px dashed var(--border-glass)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={13} /> {FABRIC_ROLE_LABEL[r]}
              {inPhoto(r) && <span style={{ color: 'var(--brand-fill)' }}>· in your photo</span>}
            </button>
          ))}
        </div>
        {slots.length === 1 && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Most outfits need one fabric. Add a contrast or a lining if yours uses more.
          </p>
        )}
      </div>

      {/* ── The active slot ── */}
      <div
        style={{
          borderRadius: '16px',
          border: '1px solid var(--border-glass)',
          background: 'var(--bg-surface-elevated)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div className="flex items-center justify-between" style={{ gap: '8px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{nameOf(role)}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isSet && role === 'main' ? (hasBottom ? 'The top' : 'Both pieces') : FABRIC_ROLE_HINT[role]}
            </p>
          </div>
          {role !== 'main' && role !== 'bottom' && (
            <button
              type="button"
              onClick={() => removeExtraFabric(role)}
              className="flex items-center"
              style={{ gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={13} /> Remove
            </button>
          )}
        </div>

        {active ? (
          <div className="flex" style={{ gap: '12px', alignItems: 'center' }}>
            <span className="relative overflow-hidden" style={{ width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0 }}>
              <Image src={active.image} alt={active.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
            </span>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {active.name}
              </p>
              {(active.material || active.pattern || active.vendorName) && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {[active.material, active.pattern, active.vendorName && `from ${active.vendorName}`].filter(Boolean).join(' · ')}
                </p>
              )}
              {(active.pricePerYard || active.piecePrice) && (
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {active.soldBy === 'piece' && active.piecePrice
                    ? `${fmt(active.piecePrice)} per ${active.pieceYards}-yd piece`
                    : `${fmt(active.pricePerYard ?? 0)}/yd`}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your tailor chooses and buys this fabric. Its cost is part of their quote.
          </p>
        )}
        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          Your tailor works out how many yards you need and prices it in their quote.
        </p>

        {active && (
          <button
            type="button"
            onClick={() => pick(role, null)}
            style={{
              alignSelf: 'flex-start',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Let the tailor choose instead
          </button>
        )}
      </div>

      {/* ── From your photo ── */}
      {(() => {
        const read = photoFabrics?.fabrics.find((f) => f.role === role);
        if (!read) return null;
        const matches = photoFabrics?.matches[role] ?? [];
        const sets = role === 'main' ? (photoFabrics?.sets ?? []) : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="flex items-center" style={{ ...label, gap: '6px' }}>
              <Camera size={13} /> From your photo
            </span>
            <p className="flex items-center" style={{ gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {read.colors.map((c) => (
                <span
                  key={c.hex}
                  title={c.name}
                  style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }}
                />
              ))}
              <span>{read.description}</span>
            </p>
            {sets.map((st) => {
              const applied = st.items.every((i) => slotFabricId(i.role) === i.match.fabric_id);
              return (
                <div
                  key={st.vendor_id}
                  className="flex items-center"
                  style={{ gap: '10px', padding: '10px', borderRadius: '14px', border: '1.5px solid var(--brand-fill)', background: 'var(--bg-surface-elevated)' }}
                >
                  <span className="flex" style={{ gap: '4px' }}>
                    {st.items.map((i) => (
                      <span key={i.role} className="relative overflow-hidden" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--border-glass)' }}>
                        {i.match.image && <Image src={i.match.image} alt="" fill sizes="32px" style={{ objectFit: 'cover' }} />}
                      </span>
                    ))}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Matching set{st.vendor_name ? ` from ${st.vendor_name}` : ''}
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {st.items.map((i) => nameOf(i.role)).join(' + ')} · one seller, one delivery to your tailor
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={applied}
                    onClick={() => st.items.forEach((i) => pick(i.role, i.match.fabric_id))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      border: 'none',
                      background: applied ? 'var(--border-glass)' : 'var(--brand-fill)',
                      color: applied ? 'var(--text-secondary)' : 'var(--brand-on-fill, #fff)',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: applied ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {applied ? 'Using it' : 'Use set'}
                  </button>
                </div>
              );
            })}
            {matches.length > 0 ? (
              <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                {matches.map((m) => {
                  const on = activeId === m.fabric_id;
                  return (
                    <button
                      key={m.fabric_id}
                      type="button"
                      onClick={() => pick(role, m.fabric_id)}
                      aria-pressed={on}
                      className="flex text-left"
                      style={{
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '14px',
                        border: on ? '2px solid var(--brand-fill)' : '1.5px solid var(--border-glass)',
                        background: 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span className="relative overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: 'var(--border-glass)' }}>
                        {m.image && <Image src={m.image} alt={m.name} fill sizes="40px" style={{ objectFit: 'cover' }} />}
                      </span>
                      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name}
                        </span>
                        {m.price_per_yard ? (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(m.price_per_yard)}/yd</span>
                        ) : null}
                        {m.reasons[0] && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {m.reasons.slice(0, 2).join(' · ')}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Nothing in stock is close to this yet. Let the tailor choose it, or search below.
              </p>
            )}
          </div>
        );
      })()}

      {/* ── Or just a colour: the tailor sources the fabric ── */}
      {(role === 'main' || role === 'bottom') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={label}>{activeId ? 'Or just pick a colour' : 'Colour you want'}</span>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {activeId
              ? 'Picking a colour swaps the fabric above for one your tailor sources.'
              : 'Your tailor finds a fabric in this colour.'}
          </p>
          <ColorPicker
            colors={FABRIC_COLORS}
            selectedColor={activeId ? null : slotColour(role)}
            onSelect={(hex) => pickColour(role, hex)}
          />
        </div>
      )}

      {/* ── Picker ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={label}>Choose a fabric for {nameOf(role).toLowerCase()}</span>
        <label
          className="flex items-center"
          style={{
            gap: '8px',
            height: '42px',
            boxSizing: 'border-box',
            padding: '0 16px',
            borderRadius: '100px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            id="studio-fabric-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setColorFilter(null);
            }}
            placeholder="Search lace, silk, ankara, blue…"
            aria-label="Search fabrics"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}
          />
        </label>

        {colorChips.length > 1 && (
          <div className="flex items-center overflow-x-auto hide-scrollbar" style={{ gap: '6px', paddingBottom: '2px' }}>
            <button
              type="button"
              onClick={() => setColorFilter(null)}
              className="flex-shrink-0"
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: colorFilter === null ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                background: 'var(--bg-surface-elevated)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {colorChips.map((c) => {
              const on = colorFilter === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColorFilter(on ? null : c.key)}
                  title={c.name || c.hex}
                  className="flex items-center flex-shrink-0"
                  style={{
                    gap: '6px',
                    padding: '5px 12px 5px 6px',
                    borderRadius: '9999px',
                    border: on ? '1.5px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                    background: 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.hex || '#CCC', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{c.name || c.hex}</span>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p role="alert" style={{ fontSize: '12px', color: '#B42318' }}>
            {error}
          </p>
        )}

        <div className="grid grid-cols-2" style={{ gap: '8px' }}>
          {listed.map((f) => (
            <FabricCard
              key={f.id}
              fabric={{ ...f, extraCost: undefined }}
              isSelected={activeId === f.id}
              onSelect={(id) => pick(role, id)}
            />
          ))}
          {!loading && listed.length === 0 && !error && (
            <p className="col-span-2 text-center" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' }}>
              {debounced ? `No fabrics match “${debounced}”.` : colorFilter ? 'No fabrics in this colour.' : 'No fabrics in stock right now.'} You can
              let the tailor choose.
            </p>
          )}
        </div>

        {loading ? (
          <p className="flex items-center justify-center" style={{ gap: '6px', fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
            <Loader2 size={14} className="animate-spin" /> Loading fabrics
          </p>
        ) : hasMore && !colorFilter ? (
          <button
            type="button"
            onClick={loadMore}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-surface-elevated)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Show more fabrics
          </button>
        ) : null}
      </div>
    </div>
  );
};
