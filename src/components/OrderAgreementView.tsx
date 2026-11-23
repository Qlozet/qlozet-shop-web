'use client';

import React, { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

/**
 * The bespoke order agreement (backend bespoke/order-agreement.ts): what the
 * customer agrees to before paying the deposit, and the frozen record on the
 * order afterwards. The same shape both times.
 */
export interface OrderAgreement {
  version: string;
  design: { name: string; image: string | null; back_image: string | null; note: string };
  tailor: { name: string };
  fabrics: { role: string; name: string; source: string; yards: number | null; supplier_name: string | null; charged: 'in_quote' | 'on_top'; amount: number }[];
  measurements: { set_name: string | null; unit: string | null; values: Record<string, number> } | null;
  price: {
    line_items: { label: string; amount: number }[];
    quote_total: number;
    fabric_on_top: number;
    delivery_to_customer: number;
    fabric_delivery: number;
    total: number;
    pay_now: number;
    remaining_after_photos: number;
  };
  timing: { making_days: number };
  terms: { key: string; text: string }[];
  tailor_agreed_at: string | null;
  customer_agreed_at: string | null;
}

const naira = (n: number) => `₦${Math.round(n || 0).toLocaleString()}`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

const SOURCE: Record<string, string> = {
  tailor_stock: "the tailor's own",
  other_vendor: 'another shop',
  tailor_sourced: 'bought by the tailor',
};

/** The agreement, folded to one line until opened. */
export function OrderAgreementView({
  agreement,
  startOpen = false,
}: {
  agreement: OrderAgreement;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const a = agreement;
  const row = (label: string, value: string, strong = false) => (
    <div key={label} className="flex justify-between" style={{ gap: '12px', fontSize: '12px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: strong ? 800 : 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
  const heading = (t: string) => (
    <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '4px 0 0' }}>
      {t}
    </p>
  );

  return (
    <div style={{ border: '1px solid var(--border-glass)', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center"
        style={{ gap: '8px', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left' }}
      >
        <FileText size={16} />
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>Order agreement</span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: '8px', padding: '0 14px 14px', maxHeight: '320px', overflowY: 'auto' }}>
          {a.design.image && (
            <div className="flex" style={{ gap: '8px' }}>
              {[a.design.image, a.design.back_image].filter(Boolean).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src as string}
                  src={src as string}
                  alt={i === 0 ? 'Design, front' : 'Design, back'}
                  style={{ width: '72px', height: '96px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-base)' }}
                />
              ))}
            </div>
          )}
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{a.design.note}</p>

          {heading('Made by')}
          {row('Tailor', a.tailor.name)}
          {row('Ships within', `${a.timing.making_days} days of payment`)}

          {a.fabrics.length > 0 && heading('Fabric')}
          {a.fabrics.map((f) =>
            row(
              `${f.name}${f.yards ? ` · ${f.yards} yd` : ''}`,
              f.charged === 'on_top' ? `${naira(f.amount)} (${SOURCE[f.source] ?? f.source})` : SOURCE[f.source] ?? 'in the quote',
            ),
          )}

          {heading('Price')}
          {a.price.line_items.map((li) => row(li.label, naira(li.amount)))}
          {a.price.fabric_on_top > 0 && row('Fabric from another shop', naira(a.price.fabric_on_top))}
          {a.price.delivery_to_customer > 0 && row('Delivery to you', naira(a.price.delivery_to_customer))}
          {a.price.fabric_delivery > 0 && row('Fabric delivery to the tailor', naira(a.price.fabric_delivery))}
          {row('Total', naira(a.price.total), true)}
          {row('Paid with the deposit', naira(a.price.pay_now))}
          {a.price.remaining_after_photos > 0 && row('After the photos', naira(a.price.remaining_after_photos))}

          {a.measurements && heading(`Measurements${a.measurements.set_name ? ` (${a.measurements.set_name})` : ''}`)}
          {a.measurements && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {Object.entries(a.measurements.values)
                .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}${a.measurements?.unit ?? ''}`)
                .join(' · ')}
            </p>
          )}

          {heading('Terms')}
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {a.terms
              .filter((t) => t.key !== 'design_reference')
              .map((t) => (
                <li key={t.key} style={{ fontSize: '12px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                  {t.text}
                </li>
              ))}
          </ul>

          {(a.tailor_agreed_at || a.customer_agreed_at) && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
              {a.tailor_agreed_at && `${a.tailor.name} agreed on ${day(a.tailor_agreed_at)}. `}
              {a.customer_agreed_at && `You agreed on ${day(a.customer_agreed_at)}.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
