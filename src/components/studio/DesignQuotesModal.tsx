'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2, Check, Store } from 'lucide-react';
import {
  useBespokeDesigns,
  type BespokeDesign,
  type BespokeQuote,
} from '@/hooks/useBespokeDesigns';

interface DesignQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  designId: string | null;
}

const naira = (n?: number) =>
  typeof n === 'number' ? `₦${n.toLocaleString()}` : '—';

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
  const [design, setDesign] = useState<BespokeDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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
  }, [isOpen, designId, getDesignDetail]);

  if (!isOpen) return null;

  const quotes = ((design as any)?.quotes ?? []) as BespokeQuote[];
  const accept = async (quoteId: string) => {
    setAcceptingId(quoteId);
    setErr(null);
    const res = await acceptQuote(quoteId);
    setAcceptingId(null);
    const url = res?.payment?.authorization_url || res?.payment?.paymentUrl;
    if (res && url) {
      window.location.href = url;
    } else if (res) {
      // Accepted but no payment URL — close and let them see order status.
      onClose();
    } else {
      setErr('Could not accept the quote. Please try again.');
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='relative w-full animate-fade-in'
        style={{
          maxWidth: '480px', margin: '20px', borderRadius: '24px',
          background: '#FFFFFF', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
          overflow: 'hidden', maxHeight: '86vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90'
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.08)', background: '#FFF', cursor: 'pointer',
          }}
        >
          <X size={14} color='#666' />
        </button>

        <div style={{ padding: '28px 28px 16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
            Quotes
          </h3>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>
            {design?.name ? design.name : 'Your design'} · choose the tailor you like
          </p>
        </div>

        <div style={{ padding: '0 28px 28px', overflowY: 'auto' }}>
          {loading ? (
            <div className='flex items-center justify-center' style={{ padding: '40px 0' }}>
              <Loader2 size={22} className='animate-spin' color='#888' />
            </div>
          ) : quotes.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '32px 0' }}>
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
                      border: `1.5px solid ${accepted ? '#064E3B' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: '16px', padding: '16px',
                      background: accepted ? 'rgba(6,78,59,0.04)' : '#FFF',
                    }}
                  >
                    <div className='flex items-center justify-between' style={{ marginBottom: '10px' }}>
                      <div className='flex items-center' style={{ gap: '10px' }}>
                        <div
                          className='flex items-center justify-center overflow-hidden'
                          style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#F2F2F2' }}
                        >
                          {q.vendor?.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={q.vendor.logo_url} alt={q.vendor?.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Store size={15} color='#999' />
                          )}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                          {q.vendor?.business_name || 'Tailor'}
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1A1A1A' }}>
                        {naira(total)}
                      </span>
                    </div>

                    {(q.line_items ?? []).length > 0 && (
                      <div className='flex flex-col' style={{ gap: '4px', marginBottom: '12px' }}>
                        {(q.line_items ?? []).map((li: any, i: number) => (
                          <div key={i} className='flex items-center justify-between'>
                            <span style={{ fontSize: '12px', color: '#888' }}>
                              {li.description || li.label}
                            </span>
                            <span style={{ fontSize: '12px', color: '#555' }}>
                              {naira(li.total ?? li.amount)}
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
                    ) : submitted ? (
                      <button
                        onClick={() => accept(q._id)}
                        disabled={acceptingId === q._id}
                        className='w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]'
                        style={{
                          padding: '12px', borderRadius: '12px', background: '#064E3B',
                          color: '#FFF', fontSize: '12px', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          border: 'none', cursor: 'pointer', gap: '8px',
                        }}
                      >
                        {acceptingId === q._id ? (
                          <><Loader2 size={14} className='animate-spin' /> Processing...</>
                        ) : (
                          'Accept & pay'
                        )}
                      </button>
                    ) : (
                      <p style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
                        {q.status === 'pending' ? 'Awaiting the tailor’s quote' : q.status}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {err && (
            <p style={{ fontSize: '11px', color: '#DC2626', paddingTop: '12px' }}>⚠ {err}</p>
          )}
        </div>
      </div>
    </div>
  );
};
