'use client';

/**
 * Report a store.
 *
 * Files an ordinary support ticket carrying the reported vendor, which the
 * admin support queue already works — nothing bespoke behind it.
 *
 * Reasons are a fixed list rather than a free-text box. Two reasons: a queue
 * of categorised reports can be triaged, and the counts tell you which rule is
 * broken most often, which is the thing worth automating next. The detail box
 * stays optional so nobody is blocked from reporting by not knowing what to
 * write.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { api } from '@/lib/api';

/** `value` is what the queue filters on; `label` is what the shopper reads. */
const REASONS = [
  { value: 'counterfeit', label: 'Selling counterfeit or fake items' },
  { value: 'not_as_described', label: 'Items are not as described' },
  { value: 'stolen_photos', label: 'Using photos that are not theirs' },
  {
    value: 'off_platform',
    label: 'Asking to be paid or contacted outside Qlozet',
  },
  { value: 'offensive', label: 'Offensive or inappropriate content' },
  { value: 'other', label: 'Something else' },
] as const;

interface ReportStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
}

export function ReportStoreModal({
  isOpen,
  onClose,
  businessId,
  businessName,
}: ReportStoreModalProps) {
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Start clean each time, so a previous report is never half-visible behind
  // a new one.
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDetail('');
      setSent(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!reason) {
      setError('Pick a reason so we know what to look at.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const label = REASONS.find((r) => r.value === reason)?.label ?? reason;
      await api.post('/tickets', {
        issue_type: `store_report:${reason}`,
        description:
          `Report against ${businessName}: ${label}.` +
          (detail.trim() ? `\n\n${detail.trim()}` : ''),
        reported_business: businessId,
      });
      setSent(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not send your report. Please try again.',
      );
    } finally {
      setSending(false);
    }
  };

  const panel = (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md"
        style={{
          background: 'var(--bg-surface, #fff)',
          borderRadius: '20px 20px 0 0',
          padding: '24px',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Report ${businessName}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
              {sent ? 'Report sent' : `Report ${businessName}`}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Thank you. Our team will look into this. We do not tell the store
              who reported them.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full"
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--brand-brown, #3d2817)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Done
            </button>
          </>
        ) : (
          <>
            <p
              className="mb-4"
              style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.8 }}
            >
              Tell us what is wrong and our team will look into it. The store is
              not told who reported them.
            </p>

            <div className="flex flex-col" style={{ gap: '8px' }}>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex cursor-pointer items-center gap-3"
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border:
                      reason === r.value
                        ? '1px solid var(--brand-brown, #3d2817)'
                        : '1px solid var(--border, #e5e7eb)',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            <label
              className="mt-4 block"
              style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7 }}
            >
              Anything else? (optional)
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              maxLength={1000}
              className="mt-1 w-full"
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border, #e5e7eb)',
                fontSize: '13px',
                resize: 'vertical',
              }}
            />

            {error && (
              <p style={{ fontSize: '12px', color: '#D42620', marginTop: '8px' }}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="mt-4 w-full"
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--brand-brown, #3d2817)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? 'Sending…' : 'Send report'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return typeof document === 'undefined'
    ? null
    : createPortal(panel, document.body);
}

export default ReportStoreModal;
