'use client';

import { useVendors } from '@/hooks/useVendors';
import { VendorDiscountRow } from '@/components/discover/VendorDiscountRow';

export default function DiscountsPage() {
  const { vendors, loading } = useVendors({ limit: 50 });
  const dealVendors = vendors.filter((v) => v.has_active_discount);

  return (
    <div className="flex flex-col w-full animate-fade-in" style={{ gap: '28px', paddingBottom: '8px' }}>
      {/* Header */}
      <div className="text-left lg:text-center">
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
          style={{ fontSize: '22px' }}
        >
          Discounts
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Live offers, by vendor
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col" style={{ gap: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col animate-pulse" style={{ gap: '14px' }}>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }} />
                <div style={{ height: '12px', width: '160px', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
              </div>
              {/* overflow-hidden: fixed-width placeholders must not widen the page */}
              <div className="flex overflow-hidden" style={{ gap: '16px' }}>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex-shrink-0" style={{ width: '160px', aspectRatio: '214/264', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : dealVendors.length > 0 ? (
        <div className="flex flex-col" style={{ gap: '32px' }}>
          {dealVendors.map((vendor) => (
            <VendorDiscountRow key={vendor._id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: '64px 24px', gap: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No active discounts right now</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
            Check back soon — vendors run offers throughout the week.
          </p>
        </div>
      )}
    </div>
  );
}
