'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ApiCollection } from '@/lib/api-types';

interface CollectionsGridProps {
  collections: ApiCollection[];
  title?: string;
  loading?: boolean;
}

/**
 * Platform-collection cards for the explore pages. Each card is a cover image +
 * title that links to /collections/{slug} (the collection's product list).
 * Self-hides when there are no collections.
 */
export function CollectionsGrid({ collections, title = 'Collections', loading }: CollectionsGridProps) {
  if (!loading && (!collections || collections.length === 0)) return null;

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      <div className="flex items-center" style={{ gap: '8px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </h2>
        <ChevronRight size={14} color="var(--text-primary)" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ aspectRatio: '4/5', borderRadius: '20px', background: 'var(--bg-surface-elevated)' }} />
            ))
          : collections.map((c) => {
              const slug = c.slug || c._id;
              const name = c.title || c.name || 'Collection';
              const cover = c.cover_image || (c as { image?: { url?: string } }).image?.url;
              return (
                <Link
                  key={c._id}
                  href={`/collections/${slug}`}
                  className="relative overflow-hidden group flex flex-col justify-end"
                  style={{ aspectRatio: '4/5', borderRadius: '20px', background: cover ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)', textDecoration: 'none' }}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                  <div className="relative flex items-center justify-between" style={{ padding: '14px' }}>
                    <span className="truncate" style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {name}
                    </span>
                    <ChevronRight size={16} color="#FFFFFF" className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
