'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, Loader2, CheckCircle2, Check, Store } from 'lucide-react';
import { useBespokeDesigns, type CreateDesignPayload } from '@/hooks/useBespokeDesigns';
import { useVendors } from '@/hooks/useVendors';
import { enrichSelections } from '@/data/studio-options';
import type { DesignSelections } from './SaveDesignModal';

interface RequestQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  category: string;
  gender: 'men' | 'women';
  designImages: string[];
  referenceImages: string[];
  selections?: DesignSelections;
  designId?: string | null;
}

const MAX_VENDORS = 5;

export const RequestQuotesModal: React.FC<RequestQuotesModalProps> = ({
  isOpen,
  onClose,
  designName,
  category,
  gender,
  designImages,
  referenceImages,
  selections,
  designId,
}) => {
  const router = useRouter();
  const { saveDesign, requestQuotes } = useBespokeDesigns();
  const { vendors, loading: vendorsLoading } = useVendors({ limit: 50 });

  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : prev.length >= MAX_VENDORS
          ? prev
          : [...prev, id],
    );
  };

  const submit = async () => {
    if (selected.length === 0) return;
    if (designImages.length === 0) {
      setErr('Generate at least one design image first.');
      return;
    }
    setBusy(true);
    setErr(null);

    // Ensure the design is saved first (need a designId to request quotes).
    let id = designId ?? null;
    if (!id) {
      const payload: CreateDesignPayload = {
        name: (designName || 'My design').trim(),
        category,
        gender,
        design_images: [...designImages].reverse(),
        reference_images: referenceImages.length ? referenceImages : undefined,
        description: JSON.stringify({ notes: '', selections: enrichSelections(selections) }),
      };
      const saved = await saveDesign(payload, null);
      if (!saved?._id) {
        setErr('Could not save the design. Please try again.');
        setBusy(false);
        return;
      }
      id = saved._id;
    }

    const ok = await requestQuotes(id, selected);
    setBusy(false);
    if (ok) {
      setDone(true);
      setTimeout(() => {
        onClose();
        setDone(false);
        setSelected([]);
        router.push('/bespoke');
      }, 1400);
    } else {
      setErr('Failed to send quote requests. Please try again.');
    }
  };

  return createPortal(
    <div
      className='fixed inset-0 flex items-center justify-center'
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='relative w-full animate-fade-in'
        style={{
          maxWidth: '440px',
          margin: '20px',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
          overflow: 'hidden',
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

        <div style={{ padding: '28px' }}>
          {done ? (
            <div className='flex flex-col items-center justify-center' style={{ gap: '16px', padding: '40px 0' }}>
              <CheckCircle2 size={48} color='#059669' />
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>Quotes requested!</p>
              <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                The tailors will send their quotes. Track them under My Designs.
              </p>
            </div>
          ) : (
            <div className='flex flex-col' style={{ gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Choose Tailors
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '8px', lineHeight: 1.6 }}>
                  Pick up to {MAX_VENDORS} tailors to send this design to. Each will
                  send you a quote — you choose the one you like.
                </p>
              </div>

              <div
                style={{
                  maxHeight: '320px', overflowY: 'auto', display: 'flex',
                  flexDirection: 'column', gap: '8px',
                }}
              >
                {vendorsLoading ? (
                  <div className='flex items-center justify-center' style={{ padding: '32px 0' }}>
                    <Loader2 size={20} className='animate-spin' color='#888' />
                  </div>
                ) : vendors.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '24px 0' }}>
                    No tailors available right now.
                  </p>
                ) : (
                  vendors.map((v: any) => {
                    const id = v._id || v.id;
                    const isSel = selected.includes(id);
                    const disabled = !isSel && selected.length >= MAX_VENDORS;
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        disabled={disabled}
                        className='flex items-center transition-all'
                        style={{
                          gap: '12px', padding: '10px 12px', borderRadius: '14px',
                          border: `1.5px solid ${isSel ? '#064E3B' : 'rgba(0,0,0,0.08)'}`,
                          background: isSel ? 'rgba(6,78,59,0.05)' : '#FFF',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          opacity: disabled ? 0.5 : 1, textAlign: 'left',
                        }}
                      >
                        <div
                          className='flex-shrink-0 flex items-center justify-center overflow-hidden'
                          style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F2F2F2' }}
                        >
                          {v.business_logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.business_logo_url} alt={v.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Store size={16} color='#999' />
                          )}
                        </div>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                          {v.business_name}
                        </span>
                        <span
                          className='flex items-center justify-center'
                          style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            border: `1.5px solid ${isSel ? '#064E3B' : 'rgba(0,0,0,0.15)'}`,
                            background: isSel ? '#064E3B' : 'transparent',
                          }}
                        >
                          {isSel && <Check size={13} color='#FFF' />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {err && (
                <p style={{ fontSize: '11px', color: '#DC2626', padding: '0 4px' }}>⚠ {err}</p>
              )}

              <button
                onClick={submit}
                disabled={busy || selected.length === 0}
                className='w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]'
                style={{
                  padding: '16px', borderRadius: '14px',
                  background: busy ? '#666' : '#064E3B', color: '#FFF',
                  fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.12em', border: 'none',
                  cursor: busy || selected.length === 0 ? 'not-allowed' : 'pointer',
                  gap: '8px', opacity: selected.length === 0 ? 0.5 : 1,
                }}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className='animate-spin' />
                    Sending...
                  </>
                ) : (
                  `Request ${selected.length || ''} quote${selected.length === 1 ? '' : 's'}`.trim()
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
