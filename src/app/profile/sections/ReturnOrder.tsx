'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Upload, CheckCircle2, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useUpload } from '@/hooks/useUpload';
import { cardStyle } from '../styles';
import { conditionOptions, reasonOptions } from '../data';
import type { ActiveSection, Order } from '../types';

interface ReturnOrderProps {
  setActiveSection: (s: ActiveSection) => void;
  selectedOrder: Order | null;
  selectedItemIdx: number;
  returnStep: number;
  setReturnStep: (s: number) => void;
}

// Map the wizard's human-readable reasons onto the backend ReturnReason enum.
const REASON_MAP: Record<string, string> = {
  'The product quality is unsatisfactory.': 'not_as_described',
  'The product was not my size.': 'wrong_size',
  'I changed my mind or the product was not as expected.': 'changed_mind',
  'The product information was misleading.': 'not_as_described',
  'The product was not delivered.': 'other',
};

// Honest 3-step wizard: reason → evidence → summary. Earlier versions had two
// extra steps (return shipping method, payout preference) that the backend
// neither accepts nor honours — a return always refunds to the original
// payment method once the vendor receives the items — so they were removed
// rather than promising choices that don't exist.
export default function ReturnOrder({ setActiveSection, selectedOrder, selectedItemIdx, returnStep, setReturnStep }: ReturnOrderProps) {
  const [returnCondition, setReturnCondition] = useState('');
  const [returnReasons, setReturnReasons] = useState<string[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadOutfitImages, isUploading, uploadError } = useUpload();

  const order = selectedOrder;
  if (!order) return null;
  const item = order.items[selectedItemIdx] || order.items[0];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = 3 - evidenceUrls.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (list.length === 0) return;
    const results = await uploadOutfitImages(list);
    if (results.length) {
      setEvidenceUrls((prev) => [...prev, ...results.map((r) => r.imageUrl)]);
    }
  };

  const handleSubmit = async () => {
    if (!item.productId || !item.businessId) {
      setSubmitError('This item cannot be returned (missing product or vendor reference).');
      return;
    }
    const primaryReason = returnReasons[0];
    const reason = (primaryReason && REASON_MAP[primaryReason]) || 'other';
    const description = [returnCondition, ...returnReasons].filter(Boolean).join(' | ');

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/returns', {
        order_reference: order.orderNumber,
        business_id: item.businessId,
        item_ids: [item.productId],
        reason,
        description,
        evidence_urls: evidenceUrls,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr?.response?.data?.message;
      setSubmitError(
        (Array.isArray(msg) ? msg[0] : msg) || 'Could not submit your return. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ReturnProductCard = () => (
    <div style={cardStyle}>
      <div className="flex" style={{ padding: '20px', gap: '16px' }}>
        <div className="flex-shrink-0 overflow-hidden" style={{ width: '100px', height: '120px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}>
          <Image src={item.image} alt={item.name} width={100} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>
        <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.vendor || 'Vendor'}</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display), serif' }}>{item.name}</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>₦{item.price.toLocaleString()}</span>
          <div className="flex flex-col" style={{ marginTop: '8px', gap: '4px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
            {[['Order:', order.orderNumber], ['Placed on:', order.date], ['No of Items:', String(item.qty)]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Total Cost:</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>₦{item.price.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContinueButton = ({ onClick, disabled, label = 'Continue' }: { onClick: () => void; disabled?: boolean; label?: string }) => (
    <button onClick={onClick} disabled={disabled} className="w-full transition-all hover:opacity-90 active:scale-[0.98]" style={{ padding: '16px', borderRadius: '12px', background: disabled ? '#CCC' : 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: disabled ? 'default' : 'pointer' }}>
      {label}
    </button>
  );

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center" style={{ gap: '20px', padding: '48px 24px', ...cardStyle }}>
        <div className="flex items-center justify-center" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(45,106,79,0.1)' }}>
          <CheckCircle2 size={40} color="#2D6A4F" />
        </div>
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Requested</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '360px' }}>
            Your return request for <b>{item.name}</b> has been sent to {item.vendor || 'the vendor'}.
            Once they approve it and receive the items back, your refund is processed to your original
            payment method. You can follow progress under <b>Track Return</b> on the item.
          </p>
        </div>
        <button onClick={() => setActiveSection('order-item-detail')} className="transition-all hover:opacity-90 active:scale-[0.98]" style={{ padding: '14px 40px', borderRadius: '12px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: 'pointer' }}>
          Back to Item
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      <button onClick={() => { if (returnStep > 1) setReturnStep(returnStep - 1); else setActiveSection('order-item-detail'); }} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={20} color="var(--text-primary)" />
      </button>
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Order</h3>

      <ReturnProductCard />

      {/* Step 1: Select Reason */}
      {returnStep === 1 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Select The Reason For Your Return</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>To help us process your request quickly, please answer the following questions.</p>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>What is the product&apos;s current condition?</span>
              {conditionOptions.map((opt) => (
                <label key={opt} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
                  <div onClick={() => setReturnCondition(opt)} className="flex-shrink-0 flex items-center justify-center transition-all" style={{ width: '18px', height: '18px', borderRadius: '50%', border: returnCondition === opt ? '2px solid var(--brand-fill)' : '2px solid var(--border-glass)', cursor: 'pointer' }}>
                    {returnCondition === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-fill)' }} />}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>What is the primary reason for returning the product?</span>
              {reasonOptions.map((opt) => {
                const checked = returnReasons.includes(opt);
                return (
                  <label key={opt} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
                    <div onClick={() => setReturnReasons(prev => checked ? prev.filter(r => r !== opt) : [...prev, opt])} className="flex-shrink-0 flex items-center justify-center transition-all" style={{ width: '18px', height: '18px', borderRadius: '4px', border: checked ? 'none' : '2px solid var(--border-glass)', background: checked ? 'var(--brand-fill)' : 'none', cursor: 'pointer' }}>
                      {checked && <span style={{ color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <ContinueButton onClick={() => setReturnStep(2)} disabled={!returnCondition || returnReasons.length === 0} />
        </div>
      )}

      {/* Step 2: Upload Evidence (real uploads — optional, up to 3 images) */}
      {returnStep === 2 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Upload Photo Evidence</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Photos of the issue help the vendor approve your return faster. Optional — up to 3 images.</p>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
              <div className="flex flex-wrap" style={{ gap: '8px' }}>
                {evidenceUrls.map((url, i) => (
                  <div key={url} className="relative overflow-hidden" style={{ width: '72px', height: '72px', borderRadius: '10px', background: 'var(--bg-surface-elevated)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Evidence ${i + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    <button
                      onClick={() => setEvidenceUrls((prev) => prev.filter((u) => u !== url))}
                      className="absolute top-1 right-1 flex items-center justify-center"
                      style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer' }}
                      aria-label="Remove image"
                    >
                      <X size={11} color="#FFF" />
                    </button>
                  </div>
                ))}
                {evidenceUrls.length < 3 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading}
                    className="flex flex-col items-center justify-center transition-all hover:border-[var(--brand-fill)]"
                    style={{ width: '72px', height: '72px', borderRadius: '10px', border: '2px dashed var(--border-glass)', background: 'none', cursor: isUploading ? 'wait' : 'pointer', gap: '4px' }}
                  >
                    {isUploading
                      ? <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
                      : <Upload size={16} color="var(--text-muted)" />}
                    <span style={{ fontSize: '8px', fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.2, textAlign: 'center' }}>{isUploading ? 'Uploading…' : 'Add image'}</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
              {uploadError && <p style={{ fontSize: '11px', color: '#DC2626' }}>{uploadError}</p>}
            </div>
          </div>
          <ContinueButton onClick={() => setReturnStep(3)} disabled={isUploading} label={evidenceUrls.length ? 'Continue' : 'Continue without photos'} />
        </div>
      )}

      {/* Step 3: Summary + submit */}
      {returnStep === 3 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Summary</h4>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Return Details</span>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Current state of the product:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', paddingLeft: '12px' }}>{returnCondition}</span>
              </div>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Reason{returnReasons.length > 1 ? 's' : ''}:</span>
                {returnReasons.map((r) => (
                  <span key={r} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', paddingLeft: '12px' }}>{r}</span>
                ))}
              </div>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• Photo evidence:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', paddingLeft: '12px' }}>{evidenceUrls.length ? `${evidenceUrls.length} image${evidenceUrls.length > 1 ? 's' : ''} attached` : 'None'}</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border-glass)', paddingTop: '12px', margin: 0 }}>
                Once the vendor approves your return and receives the items back, your refund of{' '}
                <b style={{ color: 'var(--text-primary)' }}>₦{item.price.toLocaleString()}</b> is processed to your original payment method.
              </p>
            </div>
          </div>
          {submitError && (
            <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, textAlign: 'center' }}>{submitError}</p>
          )}
          <ContinueButton onClick={handleSubmit} disabled={submitting} label={submitting ? 'Submitting…' : 'Submit Return'} />
        </div>
      )}
    </div>
  );
}
