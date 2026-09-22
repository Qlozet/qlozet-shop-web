'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, BellOff, Package, Truck, Wallet, Scissors, Tag, Info, Loader2, CheckCheck,
} from 'lucide-react';
import { cardStyle } from '../styles';
import { useApp } from '@/context/AppContext';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';

// ─── Category presentation ───────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  order: { icon: Package, bg: 'rgba(212,175,55,0.10)', color: '#B8941F', label: 'Order' },
  shipping: { icon: Truck, bg: 'rgba(59,130,246,0.08)', color: '#3B82F6', label: 'Shipping' },
  payment: { icon: Wallet, bg: 'rgba(16,185,129,0.08)', color: '#10B981', label: 'Payment' },
  bespoke: { icon: Scissors, bg: 'rgba(99,102,241,0.08)', color: '#6366F1', label: 'Bespoke' },
  product: { icon: Tag, bg: 'rgba(234,88,12,0.08)', color: '#EA580C', label: 'Product' },
  system: { icon: Info, bg: 'rgba(107,114,128,0.08)', color: '#6B7280', label: 'Qlozet' },
};

const metaFor = (category: string) => CATEGORY_META[category] ?? CATEGORY_META.system;

// "2m ago" / "3h ago" / "5d ago" / "12 Aug"
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!then) return '';
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function NotificationRow({
  n, isLast, onOpen,
}: {
  n: AppNotification;
  isLast: boolean;
  onOpen: (n: AppNotification) => void;
}) {
  const meta = metaFor(n.category);
  const Icon = meta.icon;
  return (
    <button
      onClick={() => onOpen(n)}
      className="w-full text-left flex items-start transition-colors hover:bg-[var(--bg-surface-elevated)]"
      style={{
        gap: '14px',
        padding: '16px 18px',
        background: 'none',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--border-glass)',
        cursor: 'pointer',
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: '38px', height: '38px', borderRadius: '12px', background: meta.bg, marginTop: '2px' }}
      >
        <Icon size={17} color={meta.color} strokeWidth={2} />
      </span>

      <span className="flex-1 min-w-0 flex flex-col" style={{ gap: '3px' }}>
        <span className="flex items-center justify-between" style={{ gap: '10px' }}>
          <span
            className="min-w-0"
            style={{
              fontSize: '13px',
              fontWeight: n.is_read ? 600 : 800,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {n.title}
          </span>
          <span className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {timeAgo(n.createdAt)}
            </span>
            {!n.is_read && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-brown)', flexShrink: 0 }} />
            )}
          </span>
        </span>
        <span
          style={{
            fontSize: '12px',
            color: n.is_read ? 'var(--text-muted)' : 'var(--text-secondary)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {n.body}
        </span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
            color: meta.color,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginTop: '3px',
          }}
        >
          {meta.label}
        </span>
      </span>
    </button>
  );
}

export default function Notifications() {
  const router = useRouter();
  const { user } = useApp();
  const {
    notifications, loading, loadingMore, error, hasMore, loadMore, markRead, markAllRead,
  } = useNotifications(Boolean(user));

  const unread = notifications.filter((n) => !n.is_read).length;

  const openNotification = (n: AppNotification) => {
    if (!n.is_read) markRead(n._id);
    if (n.action_url && n.action_url.startsWith('/')) {
      router.push(n.action_url);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card */}
      <div style={cardStyle}>
        <div className="flex items-start justify-between" style={{ padding: '24px 20px', gap: '12px' }}>
          <div>
            <Bell size={28} color="var(--brand-brown)" strokeWidth={1.5} />
            <div className="flex items-center" style={{ gap: '10px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Notifications
              </h3>
              {unread > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-fill-text)', background: 'var(--brand-fill)', padding: '2px 9px', borderRadius: '100px' }}>
                  {unread} new
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
              Order updates, bespoke approvals and payments — all in one place.
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center flex-shrink-0 transition-all hover:opacity-80"
              style={{ gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={cardStyle}>
          <div className="flex flex-col animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start" style={{ gap: '14px', padding: '16px 18px', borderBottom: i === 3 ? 'none' : '1px solid var(--border-glass)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--bg-surface-elevated)', flexShrink: 0 }} />
                <div className="flex-1 flex flex-col" style={{ gap: '8px' }}>
                  <div style={{ height: '12px', width: '55%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
                  <div style={{ height: '10px', width: '85%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div style={cardStyle}>
          <div className="flex flex-col items-center" style={{ padding: '40px 20px', gap: '8px' }}>
            <BellOff size={26} color="var(--text-muted)" strokeWidth={1.5} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{error}</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div style={cardStyle}>
          <div className="flex flex-col items-center text-center" style={{ padding: '48px 24px', gap: '10px' }}>
            <div className="flex items-center justify-center" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}>
              <Bell size={24} color="var(--text-muted)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              You&apos;re all caught up
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '280px' }}>
              Updates about your orders, bespoke pieces and payments will land here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <div className="flex flex-col">
              {notifications.map((n, i) => (
                <NotificationRow
                  key={n._id}
                  n={n}
                  isLast={i === notifications.length - 1}
                  onOpen={openNotification}
                />
              ))}
            </div>
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {loadingMore && <Loader2 size={13} className="animate-spin" />}
              {loadingMore ? 'Loading…' : 'Load older notifications'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
