'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, HelpCircle } from 'lucide-react';
import {
  categoriesOf,
  categoryIcon,
  useHelpArticles,
} from '@/components/help/help-lib';
import { HelpRail } from '@/components/help/help-lib';

// One help topic: its question list (Load More past the first eight) with
// the shared right rail — topics nav, search, contact.

const PAGE = 8;

export default function HelpCategoryPage() {
  const params = useParams<{ slug: string }>();
  const category = decodeURIComponent(params?.slug ?? '');

  const articles = useHelpArticles();
  const [visible, setVisible] = useState(PAGE);

  const categories = useMemo(() => (articles ? categoriesOf(articles) : []), [articles]);
  const list = useMemo(
    () => (articles ?? []).filter((a) => a.category === category),
    [articles, category]
  );
  const Icon = categoryIcon(category);

  return (
    <div className="flex flex-col w-full animate-fade-in mx-auto" style={{ gap: '20px', maxWidth: '980px' }}>
      <Link
        href="/help"
        className="flex items-center transition-opacity hover:opacity-70"
        style={{ gap: '8px', textDecoration: 'none', width: 'fit-content' }}
      >
        <ArrowLeft size={16} color="var(--text-secondary)" />
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Help Center
        </span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* ── Main column ── */}
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {/* Topic banner */}
          <div
            className="flex items-center"
            style={{
              gap: '14px', padding: '26px 24px', borderRadius: '20px',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg-base)' }}
            >
              <Icon size={20} color="var(--brand-brown)" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {category}
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {articles === null ? '…' : `${list.length} article${list.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>

          {/* Articles */}
          {articles === null ? (
            <div className="flex flex-col animate-pulse" style={{ gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-[14px] bg-[var(--bg-surface-elevated)]" style={{ height: '52px' }} />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center text-center" style={{ padding: '40px 20px', gap: '10px' }}>
              <HelpCircle size={30} color="var(--text-muted)" />
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Nothing here yet</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <Link href="/help" style={{ color: 'var(--brand-brown)' }}>Browse other topics</Link> or{' '}
                <Link href="/help/contact" style={{ color: 'var(--brand-brown)' }}>contact support</Link>.
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex flex-col overflow-hidden"
                style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
              >
                {list.slice(0, visible).map((a, i) => (
                  <Link
                    key={a._id}
                    href={`/help/${a._id}`}
                    className="flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
                    style={{
                      padding: '16px 20px', textDecoration: 'none',
                      borderTop: i > 0 ? '1px solid var(--border-glass)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</span>
                    <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
              {list.length > visible && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="mx-auto transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    padding: '11px 28px', borderRadius: '100px', cursor: 'pointer',
                    border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
                    fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  Load More
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Right rail ── */}
        <HelpRail categories={categories} active={category} />
      </div>
    </div>
  );
}
