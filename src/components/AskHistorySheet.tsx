'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Trash2, PenLine, MessageSquare, Loader2 } from 'lucide-react';

import type { ApiAskConversationSummary } from '@/lib/api-types';

interface AskHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ApiAskConversationSummary[];
  loading: boolean;
  error: string | null;
  /** Thread currently open on the page, if any — highlighted in the list. */
  activeId: string | null;
  /** The one being fetched after a tap, so the row can show it. */
  openingId: string | null;
  signedIn: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNew: () => void;
}

/** "Just now", "5m ago", "3h ago", "Yesterday", "12 Mar". */
function whenLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

// ─── Shared list content ──────────────────────────────────────
const HistoryList: React.FC<Pick<
  AskHistorySheetProps,
  'conversations' | 'loading' | 'error' | 'activeId' | 'openingId' | 'signedIn' | 'onSelect' | 'onDelete'
>> = ({ conversations, loading, error, activeId, openingId, signedIn, onSelect, onDelete }) => {
  if (!signedIn) {
    return (
      <Empty icon={<Clock size={22} color="var(--text-muted)" strokeWidth={1.5} />}>
        Sign in and your stylist conversations will be saved here, so you can pick any of them up again.
      </Empty>
    );
  }
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ padding: '40px 0', gap: '8px' }}>
        <Loader2 size={16} className="animate-spin" color="var(--text-muted)" />
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Loading your conversations…</span>
      </div>
    );
  }
  if (error) {
    return (
      <Empty icon={<Clock size={22} color="var(--text-muted)" strokeWidth={1.5} />}>{error}</Empty>
    );
  }
  if (conversations.length === 0) {
    return (
      <Empty icon={<MessageSquare size={22} color="var(--text-muted)" strokeWidth={1.5} />}>
        No conversations yet. Ask the stylist anything and it will be saved here.
      </Empty>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      {conversations.map((c) => {
        const active = c._id === activeId;
        const opening = c._id === openingId;
        return (
          <div
            key={c._id}
            className="flex items-start transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{
              gap: '8px',
              padding: '12px 10px 12px 14px',
              borderRadius: '14px',
              border: `1px solid ${active ? 'var(--brand-brown)' : 'var(--border-glass)'}`,
              background: active ? 'var(--bg-surface-elevated)' : 'var(--bg-base)',
            }}
          >
            <button
              onClick={() => onSelect(c._id)}
              className="flex-1 min-w-0 text-left"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-current={active ? 'true' : undefined}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '13.5px',
                  fontWeight: active ? 800 : 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {c.title}
              </p>
              <span className="flex items-center" style={{ gap: '6px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                {opening ? <Loader2 size={11} className="animate-spin" /> : null}
                <span>{whenLabel(c.last_message_at)}</span>
                <span aria-hidden>·</span>
                <span>{Math.max(1, Math.floor(c.message_count / 2))} {c.message_count > 2 ? 'questions' : 'question'}</span>
              </span>
            </button>
            <button
              onClick={() => onDelete(c._id)}
              aria-label="Delete conversation"
              className="flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--border-glass)]"
              style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={14} color="var(--text-muted)" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Empty: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex flex-col items-center text-center" style={{ padding: '28px 16px', gap: '8px', border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
    {icon}
    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>{children}</p>
  </div>
);

// ─── AskHistorySheet ──────────────────────────────────────────
// Same shell as the size guide: a bottom sheet on mobile, a floating panel
// on the left on desktop, portalled so it stays put while the page scrolls.
export const AskHistorySheet: React.FC<AskHistorySheetProps> = (props) => {
  const { isOpen, onClose, conversations, signedIn, onClearAll, onNew } = props;

  const closeBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--bg-surface-elevated)', border: 'none', cursor: 'pointer',
  };

  const Header = (
    <>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Your conversations</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {signedIn ? 'Pick one up where you left it' : 'Stylist history'}
        </span>
      </div>
      <button onClick={onClose} className="flex items-center justify-center transition-colors hover:bg-[var(--border-glass)]" style={closeBtnStyle} aria-label="Close">
        <X size={16} color="var(--text-primary)" strokeWidth={2.5} />
      </button>
    </>
  );

  const Footer = (
    <>
      {signedIn && conversations.length > 0 && (
        <button
          onClick={onClearAll}
          className="flex-1 transition-colors hover:opacity-90"
          style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          Clear all
        </button>
      )}
      <button
        onClick={onNew}
        className="flex-1 flex items-center justify-center transition-opacity hover:opacity-90"
        style={{ gap: '8px', padding: '14px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
      >
        <PenLine size={14} />
        New conversation
      </button>
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet ══════ */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />
        <div
          className={`fixed left-3 right-3 bottom-3 z-[70] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)] pointer-events-none'}`}
          style={{ maxHeight: '85vh', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          role="dialog"
          aria-label="Your conversations"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
          </div>
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px' }}>
            {Header}
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
            <HistoryList {...props} />
          </div>
          <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-glass)' }}>
            {Footer}
          </div>
        </div>
      </div>

      {/* ══════ DESKTOP: Floating side panel ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}
          style={{ left: '120px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[400px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-glass)' }}
            role="dialog"
            aria-label="Your conversations"
          >
            <div className="flex items-center justify-between shrink-0" style={{ padding: '24px 24px 20px 24px' }}>
              {Header}
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
              <HistoryList {...props} />
            </div>
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-glass)' }}>
              {Footer}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
