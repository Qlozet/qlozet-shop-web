'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, HelpCircle, MessageSquare, Search } from 'lucide-react';
import {
  categoriesOf,
  categoryIcon,
  categorySlug,
  useHelpArticles,
  type HelpArticleSummary,
} from '@/components/help/help-lib';

// Help Center home — topic cards (each previewing three articles with a
// See All into its category page), Popular FAQs (featured articles) beside
// the contact card. Typing in the search collapses everything into a flat
// result list.

function ArticleLink({ article, bordered }: { article: HelpArticleSummary; bordered?: boolean }) {
  return (
    <Link
      href={`/help/${article._id}`}
      className="flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
      style={{
        padding: '13px 18px', textDecoration: 'none',
        borderTop: bordered ? '1px solid var(--border-glass)' : 'none',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{article.title}</span>
      <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
    </Link>
  );
}

function HelpHome() {
  const searchParams = useSearchParams();
  const articles = useHelpArticles();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results = useMemo(() => {
    if (!articles || !searching) return [];
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
    );
  }, [articles, q, searching]);

  const categories = useMemo(() => (articles ? categoriesOf(articles) : []), [articles]);
  const featured = useMemo(() => (articles ?? []).filter((a) => a.featured), [articles]);

  return (
    <div className="flex flex-col w-full animate-fade-in mx-auto self-center" style={{ gap: '28px', maxWidth: '980px' }}>
      {/* ── Hero: clean, no card — just title + slim search pill ── */}
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: '12px', paddingTop: '12px' }}
      >
        <h1
          className="font-display font-extrabold uppercase tracking-[0.12em]"
          style={{ fontSize: '22px', color: 'var(--text-primary)' }}
        >
          Help Center
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px' }}>
          Answers about orders, returns, bespoke designs, measurements and payments.
        </p>
        <div
          className="flex items-center w-full"
          style={{
            maxWidth: '460px', gap: '10px', padding: '9px 16px', marginTop: '4px',
            borderRadius: '100px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Search size={15} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers…"
            className="flex-1 min-w-0"
            style={{
              fontSize: '13px', color: 'var(--text-primary)',
              background: 'transparent', border: 'none', outline: 'none',
              boxShadow: 'none', WebkitAppearance: 'none',
            }}
          />
        </div>
        <Link
          href="/help/tickets"
          style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-brown)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          My Tickets →
        </Link>
      </div>

      {/* ── Loading ── */}
      {articles === null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-[20px] bg-[var(--bg-surface-elevated)]" style={{ height: '190px' }} />
          ))}
        </div>
      )}

      {/* ── Search results ── */}
      {articles !== null && searching && (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {results.length} Result{results.length === 1 ? '' : 's'}
          </h2>
          {results.length === 0 ? (
            <div className="flex flex-col items-center text-center" style={{ padding: '40px 20px', gap: '10px' }}>
              <HelpCircle size={30} color="var(--text-muted)" />
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No answers match your search</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Try a different word, or{' '}
                <Link href="/help/contact" style={{ color: 'var(--brand-brown)' }}>contact support</Link>.
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col overflow-hidden"
              style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
            >
              {results.map((a, i) => (
                <ArticleLink key={a._id} article={a} bordered={i > 0} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Topic cards ── */}
      {articles !== null && !searching && articles.length > 0 && (
        <div className="flex flex-col" style={{ gap: '14px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            FAQ Topics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => {
              const Icon = categoryIcon(c);
              const list = articles.filter((a) => a.category === c);
              return (
                <div
                  key={c}
                  className="flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
                >
                  <Link
                    href={`/help/category/${categorySlug(c)}`}
                    className="flex items-center"
                    style={{ gap: '12px', padding: '16px 18px', textDecoration: 'none', borderBottom: '1px solid var(--border-glass)' }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}
                    >
                      <Icon size={17} color="var(--brand-brown)" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{c}</span>
                  </Link>
                  <div className="flex flex-col flex-1">
                    {list.slice(0, 3).map((a, i) => (
                      <ArticleLink key={a._id} article={a} bordered={i > 0} />
                    ))}
                  </div>
                  <Link
                    href={`/help/category/${categorySlug(c)}`}
                    className="transition-opacity hover:opacity-70"
                    style={{
                      padding: '12px 18px 16px', fontSize: '12px', fontWeight: 800,
                      color: 'var(--brand-brown)', textDecoration: 'underline', textUnderlineOffset: '3px',
                    }}
                  >
                    See All
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Popular FAQs + contact ── */}
      {articles !== null && !searching && articles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ marginBottom: '8px' }}>
          {featured.length > 0 && (
            <div className="flex flex-col" style={{ gap: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Popular FAQs
              </h2>
              <div
                className="flex flex-col overflow-hidden"
                style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
              >
                {featured.map((a, i) => (
                  <ArticleLink key={a._id} article={a} bordered={i > 0} />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Still Stuck?
            </h2>
            <div
              className="flex flex-col justify-between flex-1"
              style={{ gap: '16px', padding: '22px', borderRadius: '20px', background: 'var(--bg-surface-elevated)' }}
            >
              <div className="flex items-start" style={{ gap: '12px' }}>
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(139,90,43,0.1)' }}
                >
                  <MessageSquare size={16} color="var(--brand-brown)" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Talk to our support team</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.6 }}>
                    Send us a message and follow the conversation in My Tickets — replies also land in your notifications.
                  </p>
                </div>
              </div>
              <Link
                href="/help/contact"
                className="text-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  padding: '13px', borderRadius: '12px', background: 'var(--brand-fill)',
                  color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
                }}
              >
                Contact Us Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {articles !== null && !searching && articles.length === 0 && (
        <div className="flex flex-col items-center text-center" style={{ padding: '48px 20px', gap: '10px' }}>
          <HelpCircle size={32} color="var(--text-muted)" />
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Help articles are on the way</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '320px' }}>
            We&apos;re writing guides for orders, returns, bespoke designs and more. Need a hand meanwhile?{' '}
            <Link href="/help/contact" style={{ color: 'var(--brand-brown)' }}>Contact support</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={null}>
      <HelpHome />
    </Suspense>
  );
}
