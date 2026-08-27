'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ApiCollection } from '@/lib/api-types';

interface CollectionsGridProps {
  collections: ApiCollection[];
  title?: string;
  loading?: boolean;
}

/**
 * Platform-collection cards for the explore pages — styled like the discover
 * hero banners (cover image + label + description + circular arrow) and laid
 * out as a horizontal scroll row. Each card links to /collections/{slug}.
 */
export function CollectionsGrid({ collections, loading }: CollectionsGridProps) {
  if (!loading && (!collections || collections.length === 0)) return null;

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      <div className="flex overflow-x-auto hide-scrollbar snap-x" style={{ gap: '16px', paddingBottom: '4px' }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse snap-start"
                style={{ flex: '1 0 0%', minWidth: '220px', height: '200px', borderRadius: '20px', background: 'var(--bg-surface-elevated)' }}
              />
            ))
          : collections.map((c) => {
              const slug = c.slug || c._id;
              const name = c.title || c.name || 'Collection';
              const desc = c.description || '';
              const cover = c.cover_image || (c as { image?: { url?: string } }).image?.url;
              return (
                <Link
                  key={c._id}
                  href={`/collections/${slug}`}
                  className="relative overflow-hidden group snap-start"
                  style={{ flex: '1 0 0%', minWidth: '220px', height: '200px', borderRadius: '20px', textDecoration: 'none', background: 'var(--bg-surface-elevated)' }}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div className="flex flex-col" style={{ gap: '2px', minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                        }}
                      >
                        {name}
                      </span>
                      {desc && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {desc}
                        </span>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-center transition-transform group-hover:translate-x-1 flex-shrink-0"
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', marginLeft: '8px' }}
                    >
                      <ArrowRight size={16} color="#FFF" />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
