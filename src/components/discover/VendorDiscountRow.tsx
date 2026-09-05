'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, Store } from 'lucide-react';
import { useVendorDiscountedProducts } from '@/hooks/useVendors';
import { ProductCarousel } from '@/components/discover/ProductCarousel';
import type { ApiBusinessPublic, ApiProduct } from '@/lib/api-types';
import { useCurrency } from '@/context/CurrencyContext';

/** Distinct "20% OFF" / "₦5,000 OFF" labels from the products' applied discounts. */
function discountLabels(products: ApiProduct[], fmtMoney: (n: number) => string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of products) {
    const d = (p as unknown as { applied_discount?: any }).applied_discount;
    if (!d || typeof d !== 'object') continue;
    const type = String(d.type ?? '');
    const isPercent = type.includes('percentage') || d.value_type === 'percentage';
    const value = Number(d.value) || 0;
    if (!value) continue;
    const label = isPercent ? `${value}% OFF` : `${fmtMoney(value)} OFF`;
    if (!seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out.slice(0, 2);
}

/**
 * One vendor's discount block on the Discounts page: a header carrying the
 * vendor logo, name, rating and discount type(s), followed by a carousel of
 * that vendor's discounted products. Self-hides when the vendor has none.
 */
export function VendorDiscountRow({ vendor }: { vendor: ApiBusinessPublic }) {
  const { fmt: fmtMoney } = useCurrency();
  const { products, loading } = useVendorDiscountedProducts(vendor._id);

  if (loading) {
    return (
      <div className="flex flex-col" style={{ gap: '14px' }}>
        <div className="animate-pulse flex items-center" style={{ gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }} />
          <div style={{ height: '12px', width: '160px', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
        </div>
        {/* overflow-hidden: fixed-width placeholders must not widen the page */}
        <div className="flex overflow-hidden" style={{ gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 animate-pulse" style={{ width: '160px', aspectRatio: '214/264', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const labels = discountLabels(products, fmtMoney);
  const rating = vendor.average_rating ?? 0;

  return (
    <div className="flex flex-col" style={{ gap: '14px' }}>
      {/* Header: logo · name · rating · discount type(s) */}
      <Link
        href={`/vendor/${vendor._id}`}
        className="flex items-center hover:opacity-90 transition-opacity"
        style={{ gap: '12px', textDecoration: 'none' }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)' }}
        >
          {vendor.business_logo_url ? (
            <Image src={vendor.business_logo_url} alt={vendor.business_name} width={44} height={44} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          ) : (
            <Store size={18} color="var(--brand-brown)" />
          )}
        </div>

        {/* Name + rating */}
        <div className="flex flex-col" style={{ gap: '3px', minWidth: 0 }}>
          <span
            className="truncate"
            style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif", fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}
          >
            {vendor.business_name}
          </span>
          <span className="flex items-center" style={{ gap: '4px' }}>
            <Star size={11} color="#D4AF37" fill="#D4AF37" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {rating.toFixed(1)}
            </span>
            {vendor.total_ratings ? (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({vendor.total_ratings})</span>
            ) : null}
          </span>
        </div>

        {/* Discount type badges */}
        <div className="flex items-center ml-auto flex-shrink-0" style={{ gap: '6px' }}>
          {labels.map((label) => (
            <span
              key={label}
              style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.04em', color: '#FFFFFF', background: '#D4800D', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}
            >
              {label}
            </span>
          ))}
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </Link>

      {/* Product carousel (header omitted — we render our own above) */}
      <ProductCarousel title="" products={products} href={`/vendor/${vendor._id}`} />
    </div>
  );
}
