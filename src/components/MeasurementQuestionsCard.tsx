'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { MEASUREMENT_LABELS, MEASUREMENT_HINTS } from '@/app/profile/types';

/**
 * A tailor's questions about the measurements an order is made to, and the
 * customer's reply. Corrected numbers replace this order's copy only; the
 * saved measurement set is left as it is.
 */

interface Question {
  _id: string;
  shop_name: string | null;
  set_name: string | null;
  body_parts: string[];
  message: string;
  status: 'open' | 'answered';
  asked_at: string;
  answered_at: string | null;
  unit: string;
  measurements: Record<string, number>;
}

const INK = 'var(--text-primary)';
const MUTE = 'var(--text-secondary)';

const labelFor = (key: string) =>
  (MEASUREMENT_LABELS as Record<string, string>)[key] ??
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const unwrap = (res: { data?: unknown }) => {
  const d = res?.data as { data?: unknown } | undefined;
  return (d?.data ?? d) as Question[] | undefined;
};

function QuestionReply({ reference, q, onDone }: { reference: string; q: Question; onDone: () => void }) {
  // Asked-about parts first; the customer can open the rest if needed.
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(q.body_parts.map((k) => [k, q.measurements[k] != null ? String(q.measurements[k]) : ''])),
  );
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const unit = q.unit === 'inch' ? 'in' : 'cm';

  const send = async () => {
    const corrections: Record<string, number> = {};
    for (const [k, v] of Object.entries(values)) {
      const n = Number(v);
      if (v !== '' && n > 0 && n !== Number(q.measurements[k])) corrections[k] = n;
    }
    if (!Object.keys(corrections).length && !note.trim()) {
      toast.error('Change a measurement or add a note for your tailor.');
      return;
    }
    setSending(true);
    try {
      await api.post(
        `/orders/${encodeURIComponent(reference)}/measurements/questions/${q._id}/answer`,
        { measurements: corrections, message: note.trim() || undefined },
      );
      toast.success('Sent. Your tailor has your answer.');
      onDone();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not send your answer. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: '10px' }}>
      {q.body_parts.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
          {q.body_parts.map((k) => (
            <label key={k} className="flex flex-col" style={{ gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: INK }}>
                {labelFor(k)} ({unit})
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={values[k] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [k]: e.target.value }))}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', color: INK, fontSize: '13px' }}
              />
              {(MEASUREMENT_HINTS as Record<string, string>)[k] && (
                <span style={{ fontSize: '10.5px', color: MUTE, lineHeight: 1.4 }}>
                  {(MEASUREMENT_HINTS as Record<string, string>)[k]}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={600}
        rows={2}
        placeholder="A note for your tailor (optional), e.g. “Measured again with a tape, the waist is right.”"
        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', color: INK, fontSize: '12.5px', resize: 'vertical' }}
      />
      <p style={{ fontSize: '11px', color: MUTE, margin: 0, lineHeight: 1.5 }}>
        Changes apply to this order only. Your saved measurements stay as they are; update them in My Measurement if they were wrong there too.
      </p>
      <button
        onClick={send}
        disabled={sending}
        className="transition-all hover:opacity-90"
        style={{ padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1 }}
      >
        {sending ? 'Sending…' : 'Send to your tailor'}
      </button>
    </div>
  );
}

export function MeasurementQuestionsCard({ orderReference }: { orderReference: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  // Bumped after an answer, to read the questions again.
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    api
      .get(`/orders/${encodeURIComponent(orderReference)}/measurements/questions`)
      .then((res) => {
        if (alive) setQuestions(unwrap(res) ?? []);
      })
      .catch(() => {
        if (alive) setQuestions([]);
      });
    return () => {
      alive = false;
    };
  }, [orderReference, version]);

  if (!questions.length) return null;

  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {questions.map((q) => (
        <div
          key={q._id}
          style={{
            borderRadius: '16px',
            border: `1px solid ${q.status === 'open' ? 'rgba(212,175,55,0.55)' : 'var(--border-glass)'}`,
            background: q.status === 'open' ? 'rgba(212,175,55,0.08)' : 'var(--bg-surface)',
            padding: '16px 18px',
          }}
        >
          <div className="flex items-start" style={{ gap: '10px', marginBottom: '10px' }}>
            <Ruler size={16} color={INK} style={{ marginTop: 2, flexShrink: 0 }} />
            <div className="flex flex-col" style={{ gap: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: INK }}>
                {q.status === 'open'
                  ? `${q.shop_name ?? 'Your tailor'} has a question about your measurements`
                  : `You answered ${q.shop_name ?? 'your tailor'}`}
              </span>
              {q.set_name && (
                <span style={{ fontSize: '11px', color: MUTE }}>For the measurements “{q.set_name}”</span>
              )}
            </div>
          </div>
          <blockquote style={{ margin: '0 0 12px', padding: '8px 12px', borderLeft: '3px solid var(--border-glass)', fontSize: '12.5px', color: INK, lineHeight: 1.55 }}>
            {q.message}
          </blockquote>
          {q.status === 'open' ? (
            <QuestionReply reference={orderReference} q={q} onDone={load} />
          ) : (
            <span style={{ fontSize: '11.5px', color: MUTE }}>Your tailor has your answer.</span>
          )}
        </div>
      ))}
    </div>
  );
}
