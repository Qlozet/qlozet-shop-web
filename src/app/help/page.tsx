'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, HelpCircle, Search } from 'lucide-react';
import { api } from '@/lib/api';

// Help Center home — admin-curated articles (audience: customer/both).
// Featured articles render as the "Frequently asked" row; the rest group
// by category. Search filters client-side over the fetched list.

export interface HelpArticleSummary {
  _id: string;
  title: string;
  body: string;
  category: string;
  featured?: boolean;
}

export default function HelpPage() {
  const [articles, setArticles] = useState<HelpArticleSummary[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/help/articles?audience=customer')
      .then((res) => {
        const rows = res.data?.data ?? res.data ?? [];
        if (!cancelled && Array.isArray(rows)) setArticles(rows);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!articles) return [];
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const featured = filtered.filter((a) => a.featured);
  const byCategory = useMemo(() => {
    const map = new Map<string, HelpArticleSummary[]>();
    for (const a of filtered) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="flex flex-col w-full animate-fade-in mx-auto" style={{ gap: '28px', maxWidth: '760px' }}>
      {/* Header */}
      <div className="flex flex-col items-center text-center" style={{ gap: '10px', paddingTop: '8px' }}>
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em]"
          style={{ fontSize: '22px', color: 'var(--text-primary)' }}
        >
          Help Center
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px' }}>
          Answers about orders, returns, bespoke designs, measurements and payments.{' '}
          <Link href="/help/tickets" style={{ color: 'var(--brand-brown)', fontWeight: 600 }}>My tickets</Link>
        </p>
        {/* Search */}
        <div
          className="flex items-center w-full"
          style={{
            maxWidth: '480px', gap: '10px', padding: '12px 18px', marginTop: '6px',
            borderRadius: '100px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers…"
            className="flex-1 bg-transparent outline-none border-none"
            style={{ fontSize: '13px', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Loading */}
      {articles === null && (
        <div className="flex flex-col animate-pulse" style={{ gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[16px] bg-[var(--bg-surface-elevated)]" style={{ height: '58px' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {articles !== null && filtered.length === 0 && (
        <div className="flex flex-col items-center text-center" style={{ padding: '48px 20px', gap: '10px' }}>
          <HelpCircle size={32} color="var(--text-muted)" />
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {query ? 'No answers match your search' : 'Help articles are on the way'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '320px' }}>
            {query
              ? 'Try a different word — or browse the categories below once you clear the search.'
              : 'We are writing guides for orders, returns, bespoke designs and more.'}
          </p>
        </div>
      )}

      {/* Frequently asked */}
      {featured.length > 0 && (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Frequently Asked
          </h2>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            {featured.map((a) => (
              <Link
                key={a._id}
                href={`/help/${a._id}`}
                className="flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  padding: '14px 18px', borderRadius: '16px', textDecoration: 'none',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {byCategory.map(([category, list]) => {
        const rows = list.filter((a) => !a.featured);
        if (rows.length === 0) return null;
        return (
          <div key={category} className="flex flex-col" style={{ gap: '12px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {category}
            </h2>
            <div
              className="flex flex-col overflow-hidden"
              style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
            >
              {rows.map((a, i) => (
                <Link
                  key={a._id}
                  href={`/help/${a._id}`}
                  className="flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  style={{
                    padding: '14px 18px', textDecoration: 'none',
                    borderTop: i > 0 ? '1px solid var(--border-glass)' : 'none',
                  }}
                >
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <BookOpen size={15} color="var(--text-muted)" />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* Escalation — articles first, humans second */}
      {articles !== null && (
        <div
          className="flex items-center justify-between flex-wrap"
          style={{
            gap: '12px', padding: '20px 22px', borderRadius: '20px',
            background: 'var(--bg-surface-elevated)', marginBottom: '8px',
          }}
        >
          <div className="flex flex-col" style={{ gap: '2px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Still stuck?</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Our support team replies right here on Qlozet.
            </p>
          </div>
          <Link
            href="/help/contact"
            style={{
              padding: '12px 24px', borderRadius: '100px', background: 'var(--brand-fill)',
              color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
            }}
          >
            Contact Support
          </Link>
        </div>
      )}
    </div>
  );
}
