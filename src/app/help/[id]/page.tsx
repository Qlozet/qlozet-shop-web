'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ThumbsDown, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';
import { HelpMarkdown, extractHeadings } from '@/components/HelpMarkdown';
import {
  categoriesOf,
  HelpRail,
  useHelpArticles,
} from '@/components/help/help-lib';

interface HelpArticleDetail {
  _id: string;
  title: string;
  body: string;
  category: string;
}

export default function HelpArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const allArticles = useHelpArticles();
  const categories = useMemo(
    () => (allArticles ? categoriesOf(allArticles) : []),
    [allArticles]
  );

  const [article, setArticle] = useState<HelpArticleDetail | null | undefined>(
    undefined // undefined = loading, null = not found
  );
  const [voted, setVoted] = useState<null | boolean>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .get(`/help/articles/${id}`)
      .then((res) => {
        const a = res.data?.data ?? res.data;
        if (!cancelled) setArticle(a && a.title ? a : null);
      })
      .catch(() => {
        if (!cancelled) setArticle(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const headings = useMemo(
    () => (article ? extractHeadings(article.body) : []),
    [article]
  );

  const vote = (helpful: boolean) => {
    if (voted !== null || !id) return;
    setVoted(helpful); // optimistic — feedback is fire-and-forget
    api.post(`/help/articles/${id}/feedback`, { helpful }).catch(() => {});
  };

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
          {article === undefined && (
            <div className="flex flex-col animate-pulse" style={{ gap: '12px' }}>
              <div className="rounded bg-[var(--bg-surface-elevated)]" style={{ height: '28px', width: '70%' }} />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded bg-[var(--bg-surface-elevated)]" style={{ height: '14px' }} />
              ))}
            </div>
          )}

          {article === null && (
            <div className="flex flex-col items-center text-center" style={{ padding: '48px 20px', gap: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Article not found</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                It may have been unpublished.{' '}
                <Link href="/help" style={{ color: 'var(--brand-brown)' }}>Back to the Help Center</Link>
              </p>
            </div>
          )}

          {article && (
            <div
              className="flex flex-col"
              style={{
                gap: '18px', padding: '28px 26px', borderRadius: '20px',
                border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
              }}
            >
              <div className="flex flex-col" style={{ gap: '6px' }}>
                <Link
                  href={`/help/category/${encodeURIComponent(article.category)}`}
                  style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}
                >
                  {article.category}
                </Link>
                <h1 style={{ fontSize: '23px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {article.title}
                </h1>
              </div>

              {/* Table of contents — only when the article has real sections */}
              {headings.length >= 2 && (
                <div className="flex flex-col" style={{ gap: '6px', paddingBottom: '4px' }}>
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="transition-opacity hover:opacity-70"
                      style={{
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
                        textDecoration: 'underline', textUnderlineOffset: '3px', width: 'fit-content',
                      }}
                    >
                      {h.text}
                    </a>
                  ))}
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-glass)' }} />

              <HelpMarkdown content={article.body} />
            </div>
          )}

          {/* Was this helpful? */}
          {article && (
            <div
              className="flex items-center justify-between flex-wrap"
              style={{ gap: '12px', padding: '16px 18px', borderRadius: '16px', background: 'var(--bg-surface-elevated)' }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {voted === null ? 'Was this helpful?' : voted ? 'Thanks for the feedback! 🎉' : 'Thanks — we’ll improve this article.'}
              </span>
              {voted === null && (
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => vote(true)}
                    className="flex items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      gap: '6px', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
                      border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
                      fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)',
                    }}
                  >
                    <ThumbsUp size={13} /> Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => vote(false)}
                    className="flex items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      gap: '6px', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
                      border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
                      fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)',
                    }}
                  >
                    <ThumbsDown size={13} /> No
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right rail ── */}
        <HelpRail categories={categories} active={article?.category} />
      </div>
    </div>
  );
}
