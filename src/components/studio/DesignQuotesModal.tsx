'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, Store, UserPlus, PenLine } from 'lucide-react';
import { RequestQuotesModal } from './RequestQuotesModal';
import {
  useBespokeDesigns,
  type BespokeDesign,
  type BespokeQuote,
} from '@/hooks/useBespokeDesigns';
import { useWallet } from '@/hooks/useWallet';
import { useCurrency } from '@/context/CurrencyContext';
import { api } from '@/lib/api';

interface DesignQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string | null;
}

const naira = (n?: number) =>
  typeof n === 'number' ? `₦${n.toLocaleString()}` : '—';

// Waiting-state copy per quote status (submitted/accepted render their own UI).
const STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting the tailor’s quote',
  draft: 'The tailor is preparing a quote',
  revision_requested: 'Changes requested — awaiting the tailor’s update',
  declined: 'Declined',
  expired: 'Expired — you can ask another tailor',
};

const quoteTotal = (q: BespokeQuote): number => {
  if (typeof q.total_amount === 'number' && q.total_amount > 0) return q.total_amount;
  const anyQ = q as any;
  if (typeof anyQ.total === 'number' && anyQ.total > 0) return anyQ.total;
  return (q.line_items ?? []).reduce(
    (s, li: any) => s + (li.total ?? li.amount ?? 0),
    0,
  );
};

export const DesignQuotesModal: React.FC<DesignQuotesModalProps> = ({
  isOpen,
  onClose,
  designId,
}) => {
  const { getDesignDetail, acceptQuote } = useBespokeDesigns();
  const { walletBalance } = useWallet();
  // Quotes are prices being shopped — show them in the display currency like
  // the catalogue. The charge itself is still ₦ (wallet/Paystack), so the
  // converted view keeps the ₦ amount visible next to it.
  const { fmt, isConverted } = useCurrency();
  const [design, setDesign] = useState<BespokeDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressChecked, setAddressChecked] = useState(false);
  // Whose body is this garment for? Defaults to the active measurement set.
  const [measurementSets, setMeasurementSets] = useState<
    { name: string; active: boolean }[]
  >([]);
  const [setName, setSetName] = useState<string | undefined>(undefined);
  // Revision request (per quote) + wave-2 tailor requests.
  const [revisionFor, setRevisionFor] = useState<string | null>(null);
  const [revisionMsg, setRevisionMsg] = useState('');
  const [revisionBusy, setRevisionBusy] = useState(false);
  const [showAddTailors, setShowAddTailors] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => setMounted(true), []);

  // Load the customer's shipping address so acceptance can pass it explicitly
  // (the tailor needs somewhere to deliver). Prefer the default address.
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setAddressChecked(false);
    api
      .get('/users/customer/addresses')
      .then((res) => {
        if (!active) return;
        const data = res.data?.data ?? res.data;
        const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
        setAddresses(list);
        const chosen =
          list.find((a) => a.is_default) ?? list[0] ?? null;
        setAddressId(chosen ? chosen._id ?? chosen.id ?? null : null);
      })
      .catch(() => {
        if (active) setAddressId(null);
      })
      .finally(() => {
        if (active) setAddressChecked(true);
      });

    // Measurement sets — the tailor sews to the chosen set, snapshotted at
    // acceptance, so ordering for a friend just means picking their set here.
    api
      .get('/measurements/users/sets')
      .then((res) => {
        if (!active) return;
        const wrapper = res?.data?.data || res?.data || {};
        const sets = Array.isArray(wrapper?.sets)
          ? wrapper.sets
          : Array.isArray(wrapper)
            ? wrapper
            : [];
        const mapped = sets.map((s: any) => ({
          name: s.name || 'My measurements',
          active: !!(s.active || s.is_active),
        }));
        setMeasurementSets(mapped);
        const def = mapped.find((s: any) => s.active) || mapped[0];
        setSetName((prev) => prev ?? def?.name);
      })
      .catch(() => {
        /* backend falls back to the active set */
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !designId) return;
    let active = true;
    setLoading(true);
    setErr(null);
    getDesignDetail(designId).then((d) => {
      if (active) {
        setDesign(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, designId, getDesignDetail, reloadKey]);

  if (!isOpen || !mounted) return null;

  // GET /bespoke/designs/:id returns { data: { design, quotes } }, which the
  // global interceptor wraps again — so the hook gives us { data: {...} } or a
  // flat shape. Unwrap defensively.
  const raw: any = design;
  const detail: any =
    raw?.data && (raw.data.design || Array.isArray(raw.data.quotes))
      ? raw.data
      : raw;
  const designObj: any = detail?.design ?? detail;
  const quotes = ((detail?.quotes ??
    designObj?.quotes ??
    []) as BespokeQuote[]);
  const accept = async (quoteId: string, method: 'wallet' | 'paystack') => {
    setAcceptingId(quoteId);
    setErr(null);
    try {
      const res = await acceptQuote(
        quoteId,
        method,
        addressId ?? undefined,
        setName,
      );
      const url = res?.payment?.authorization_url || res?.payment?.paymentUrl;
      if (method === 'paystack' && url) {
        window.location.href = url; // redirect to Paystack
        return;
      }
      // Wallet payment is instant — the order is already confirmed.
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Could not accept the quote. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const sendRevision = async (quoteId: string) => {
    const message = revisionMsg.trim();
    if (!message) return;
    setRevisionBusy(true);
    setErr(null);
    try {
      await api.post(`/bespoke/quotes/${quoteId}/revision`, { message });
      setRevisionFor(null);
      setRevisionMsg('');
      setReloadKey((k) => k + 1); // re-fetch: quote is now revision_requested
    } catch (e: any) {
      setErr(
        e?.response?.data?.message ||
          'Could not send the revision request. Please try again.',
      );
    } finally {
      setRevisionBusy(false);
    }
  };

  // Wave-2 requests: active quotes consume cap slots; expired/declined free them.
  const designStatus: string = designObj?.status || '';
  const activeVendorIds = quotes
    .filter((q) => !['expired', 'declined'].includes(q.status))
    .map((q: any) => String(q.vendor?._id ?? q.vendor ?? ''))
    .filter(Boolean);
  const canAddMore =
    ['draft', 'requesting_quotes', 'quoted'].includes(designStatus) &&
    activeVendorIds.length < 5;

  return createPortal(
    <div
      className='fixed inset-0 flex items-center justify-center'
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='relative w-full animate-fade-in'
        style={{
          maxWidth: '480px', margin: '20px', borderRadius: '24px',
          background: 'var(--bg-base)', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
          overflow: 'hidden', maxHeight: '86vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90'
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer',
          }}
        >
          <X size={14} color='var(--text-secondary)' />
        </button>

        <div style={{ padding: '28px 28px 16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
            Quotes
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            {designObj?.name ? designObj.name : 'Your design'} · choose the tailor you like
          </p>
        </div>

        <div style={{ padding: '0 28px 28px', overflowY: 'auto' }}>
          {/* Order preferences — who the garment is for and where it ships.
              Snapshotted at acceptance, so switching profiles later is safe. */}
          {!loading &&
            quotes.some((q) => q.status === 'submitted') &&
            (addresses.length > 1 || measurementSets.length > 1) && (
              <div
                className='flex flex-col'
                style={{
                  gap: '10px', marginBottom: '14px', padding: '14px',
                  borderRadius: '14px', background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                {measurementSets.length > 1 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Measurements for
                    </label>
                    <select
                      value={setName}
                      onChange={(e) => setSetName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                    >
                      {measurementSets.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}{s.active ? ' (active)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {addresses.length > 1 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Deliver to
                    </label>
                    <select
                      value={addressId ?? ''}
                      onChange={(e) => setAddressId(e.target.value || null)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                    >
                      {addresses.map((a) => {
                        const id = a._id || a.id;
                        const who = a.full_name || a.label || a.name || 'Address';
                        const line = a.address || a.address_line_1 || '';
                        return (
                          <option key={id} value={id}>
                            {who} — {line}{a.city ? `, ${a.city}` : ''}{a.is_default ? ' (default)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}
          {loading ? (
            <div className='flex items-center justify-center' style={{ padding: '40px 0' }}>
              <Loader2 size={22} className='animate-spin' color='var(--text-muted)' />
            </div>
          ) : quotes.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No quotes yet. The tailors you selected will send their quotes soon.
            </p>
          ) : (
            <div className='flex flex-col' style={{ gap: '12px' }}>
              {quotes.map((q) => {
                const submitted = q.status === 'submitted';
                const accepted = q.status === 'accepted';
                const total = quoteTotal(q);
                return (
                  <div
                    key={q._id}
                    style={{
                      border: `1.5px solid ${accepted ? '#064E3B' : 'var(--border-glass)'}`,
                      borderRadius: '16px', padding: '16px',
                      background: accepted ? 'rgba(6,78,59,0.04)' : 'var(--bg-surface-elevated)',
                    }}
                  >
                    <div className='flex items-center justify-between' style={{ marginBottom: '10px' }}>
                      <div className='flex items-center' style={{ gap: '10px' }}>
                        <div
                          className='flex items-center justify-center overflow-hidden'
                          style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--bg-surface-elevated)' }}
                        >
                          {(q.vendor as any)?.business_logo_url || q.vendor?.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={(q.vendor as any)?.business_logo_url || q.vendor?.logo_url} alt={q.vendor?.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Store size={15} color='var(--text-muted)' />
                          )}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {q.vendor?.business_name || 'Tailor'}
                        </span>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {isConverted ? fmt(total) : naira(total)}
                        </span>
                        {isConverted && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {naira(total)}
                          </span>
                        )}
                      </div>
                    </div>

                    {(q.line_items ?? []).length > 0 && (
                      <div className='flex flex-col' style={{ gap: '4px', marginBottom: '12px' }}>
                        {(q.line_items ?? []).map((li: any, i: number) => (
                          <div key={i} className='flex items-center justify-between'>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {li.description || li.label}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {isConverted
                                ? fmt(li.total ?? li.amount ?? 0)
                                : naira(li.total ?? li.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {accepted ? (
                      <div
                        className='flex items-center justify-center'
                        style={{ gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(6,78,59,0.08)', color: '#064E3B', fontSize: '12px', fontWeight: 700 }}
                      >
                        <Check size={14} /> Accepted
                      </div>
                    ) : submitted && addressChecked && !addressId ? (
                      <a
                        href='/profile'
                        className='w-full flex items-center justify-center transition-all hover:opacity-90'
                        style={{
                          padding: '12px', borderRadius: '12px', background: '#FEF3C7',
                          color: '#92400E', fontSize: '11px', fontWeight: 700,
                          textAlign: 'center', textDecoration: 'none', lineHeight: 1.4,
                          border: '1px solid #FDE68A',
                        }}
                      >
                        Add a shipping address to place this order →
                      </a>
                    ) : submitted ? (
                      <div className='flex flex-col' style={{ gap: '8px' }}>
                        <button
                          onClick={() => accept(q._id, 'wallet')}
                          disabled={acceptingId === q._id || walletBalance < total}
                          className='w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]'
                          style={{
                            padding: '12px', borderRadius: '12px',
                            background: walletBalance < total ? '#CFCFCF' : '#064E3B',
                            color: '#FFF', fontSize: '12px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            border: 'none',
                            cursor: walletBalance < total ? 'not-allowed' : 'pointer',
                            gap: '8px',
                          }}
                        >
                          {acceptingId === q._id ? (
                            <><Loader2 size={14} className='animate-spin' /> Processing...</>
                          ) : (
                            `Pay with wallet (₦${walletBalance.toLocaleString()})`
                          )}
                        </button>
                        {walletBalance < total && (
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Insufficient wallet balance — top up or pay with card.
                          </p>
                        )}
                        <button
                          onClick={() => accept(q._id, 'paystack')}
                          disabled={acceptingId === q._id}
                          className='w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]'
                          style={{
                            padding: '12px', borderRadius: '12px', background: 'var(--bg-surface-elevated)',
                            color: '#064E3B', fontSize: '12px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            border: '1.5px solid #064E3B', cursor: 'pointer', gap: '8px',
                          }}
                        >
                          Pay with card
                        </button>
                        {isConverted && (
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            You&apos;ll be charged {naira(total)} — the converted price is an estimate.
                          </p>
                        )}
                        {revisionFor === q._id ? (
                          <div className='flex flex-col' style={{ gap: '8px', paddingTop: '4px' }}>
                            <textarea
                              value={revisionMsg}
                              onChange={(e) => setRevisionMsg(e.target.value)}
                              maxLength={1000}
                              rows={3}
                              placeholder='Tell the tailor what you’d like changed — price, timeline, materials…'
                              style={{
                                width: '100%', fontSize: '12px', color: 'var(--text-primary)',
                                background: 'var(--bg-base)', border: '1px solid var(--border-glass)',
                                borderRadius: '10px', padding: '10px 12px', outline: 'none', resize: 'vertical',
                              }}
                            />
                            <div className='flex' style={{ gap: '8px' }}>
                              <button
                                onClick={() => sendRevision(q._id)}
                                disabled={revisionBusy || !revisionMsg.trim()}
                                className='flex-1 flex items-center justify-center transition-all hover:opacity-90'
                                style={{
                                  padding: '10px', borderRadius: '10px', background: '#064E3B',
                                  color: '#FFF', fontSize: '11px', fontWeight: 800, border: 'none',
                                  cursor: revisionBusy || !revisionMsg.trim() ? 'not-allowed' : 'pointer',
                                  opacity: revisionBusy || !revisionMsg.trim() ? 0.6 : 1, gap: '6px',
                                }}
                              >
                                {revisionBusy && <Loader2 size={12} className='animate-spin' />}
                                Send request
                              </button>
                              <button
                                onClick={() => { setRevisionFor(null); setRevisionMsg(''); }}
                                style={{
                                  padding: '10px 14px', borderRadius: '10px', background: 'transparent',
                                  color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700,
                                  border: '1px solid var(--border-glass)', cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRevisionFor(q._id); setRevisionMsg(''); }}
                            className='flex items-center justify-center transition-all hover:opacity-80'
                            style={{
                              gap: '6px', padding: '6px', background: 'none', border: 'none',
                              cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                              color: 'var(--text-muted)', textDecoration: 'underline',
                            }}
                          >
                            <PenLine size={12} /> Request changes
                          </button>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {STATUS_LABELS[q.status] ?? q.status}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!loading && canAddMore && (
            <button
              onClick={() => setShowAddTailors(true)}
              className='w-full flex items-center justify-center transition-all hover:opacity-80'
              style={{
                marginTop: '14px', gap: '8px', padding: '12px',
                borderRadius: '12px', background: 'transparent',
                border: '1.5px dashed var(--border-glass)',
                color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <UserPlus size={14} />
              Ask more tailors ({5 - activeVendorIds.length} slot{5 - activeVendorIds.length === 1 ? '' : 's'} left)
            </button>
          )}
          {err && (
            <p style={{ fontSize: '11px', color: '#DC2626', paddingTop: '12px' }}>⚠ {err}</p>
          )}
        </div>
      </div>

      {/* Wave-2 tailor requests — rendered after the main card so it stacks above. */}
      <RequestQuotesModal
        isOpen={showAddTailors}
        onClose={() => {
          setShowAddTailors(false);
          setReloadKey((k) => k + 1); // pick up the new pending quotes
        }}
        designName={designObj?.name || 'Design'}
        category={designObj?.category || 'Design'}
        gender={designObj?.gender === 'men' ? 'men' : 'women'}
        designImages={designObj?.design_images || []}
        referenceImages={designObj?.reference_images || []}
        designId={designId}
        excludeVendorIds={activeVendorIds}
      />
    </div>,
    document.body,
  );
};
