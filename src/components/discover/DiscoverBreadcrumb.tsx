'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface DiscoverBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function DiscoverBreadcrumb({ items }: DiscoverBreadcrumbProps) {
  return (
    <nav className="flex items-center justify-center flex-wrap" style={{ gap: '6px' }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
            {isLast ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}
                className="hover:underline"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
