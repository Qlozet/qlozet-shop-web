'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CreditCard,
  MessageSquare,
  Package,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  Tag,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';

// Shared plumbing for the Help Center pages: one cached article fetch per
// page load, category → icon mapping, and the right-hand rail (topics nav +
// search + contact card) used on category and article pages.

export interface HelpArticleSummary {
  _id: string;
  title: string;
  body: string;
  category: string;
  featured?: boolean;
}

let articleCache: Promise<HelpArticleSummary[]> | null = null;

export function fetchHelpArticles(): Promise<HelpArticleSummary[]> {
  if (!articleCache) {
    articleCache = api
      .get('/help/articles?audience=customer')
      .then((res) => {
        const rows = res.data?.data ?? res.data ?? [];
        return Array.isArray(rows) ? rows : [];
      })
      .catch(() => {
        articleCache = null; // allow a retry on the next page
        return [];
      });
  }
  return articleCache;
}

export function useHelpArticles(): HelpArticleSummary[] | null {
  const [articles, setArticles] = useState<HelpArticleSummary[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchHelpArticles().then((rows) => {
      if (!cancelled) setArticles(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return articles;
}

// Known category names get a matching icon; anything new falls back to the
// book — admins keep free-text categories without breaking the design.
const ICONS: [RegExp, LucideIcon][] = [
  [/deliver|shipping/i, Truck],
  [/return|refund/i, RotateCcw],
  [/order/i, Package],
  [/payment|wallet|promo|voucher/i, CreditCard],
  [/bespoke|quote/i, Scissors],
  [/measure/i, Ruler],
  [/polic|promise/i, ShieldCheck],
  [/account|technical|app/i, Settings],
  [/product|stock/i, Tag],
];

export function categoryIcon(category: string): LucideIcon {
  for (const [re, icon] of ICONS) if (re.test(category)) return icon;
  return BookOpen;
}

export const categorySlug = (c: string) => encodeURIComponent(c);

/** Order categories by first appearance (list is already order-sorted). */
export function categoriesOf(articles: HelpArticleSummary[]): string[] {
  const seen: string[] = [];
  for (const a of articles) if (!seen.includes(a.category)) seen.push(a.category);
  return seen;
}

// ── Right rail — topics nav + search + contact card ──

export function HelpRail({
  categories,
  active,
}: {
  categories: string[];
  active?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {/* Topics */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
      >
        <div style={{ padding: '16px 18px 12px' }}>
          <p style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            FAQ Topics
          </p>
        </div>
        {categories.map((c) => {
          const Icon = categoryIcon(c);
          const isActive = c === active;
          return (
            <Link
              key={c}
              href={`/help/category/${categorySlug(c)}`}
              className="flex items-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
              style={{
                gap: '12px', padding: '13px 18px', textDecoration: 'none',
                borderTop: '1px solid var(--border-glass)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--brand-brown)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500, color: 'var(--text-primary)' }}>
                {c}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <div
        className="flex flex-col"
        style={{ gap: '12px', padding: '16px 18px', borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
      >
        <p style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Need to search for it?
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/help?q=${encodeURIComponent(q.trim())}` : '/help');
          }}
          className="flex items-center"
          style={{
            gap: '8px', padding: '10px 14px', borderRadius: '100px',
            border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for answers…"
            className="flex-1 bg-transparent outline-none border-none min-w-0"
            style={{ fontSize: '12px', color: 'var(--text-primary)' }}
          />
        </form>
      </div>

      {/* Contact */}
      <div
        className="flex flex-col"
        style={{ gap: '12px', padding: '18px', borderRadius: '20px', background: 'var(--bg-surface-elevated)' }}
      >
        <div className="flex items-center" style={{ gap: '10px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(139,90,43,0.1)' }}
          >
            <MessageSquare size={15} color="var(--brand-brown)" />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Still stuck?</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>We reply right here on Qlozet.</p>
          </div>
        </div>
        <Link
          href="/help/contact"
          className="text-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '12px', borderRadius: '12px', background: 'var(--brand-fill)',
            color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
          }}
        >
          Contact Us Now
        </Link>
        <Link
          href="/help/tickets"
          className="text-center transition-opacity hover:opacity-70"
          style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          My Tickets
        </Link>
      </div>
    </div>
  );
}
