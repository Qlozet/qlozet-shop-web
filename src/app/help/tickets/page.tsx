'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MessageSquare,
  Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// My Tickets — the customer's own support conversations (GET /tickets is
// scoped to the signed-in customer by the backend). Replying posts to
// POST /tickets/:id/replies; support replies also arrive as notifications.

interface TicketReply {
  _id: string;
  message: string;
  sender?: { _id?: string; full_name?: string; type?: string } | string | null;
  createdAt?: string;
}

interface CustomerTicket {
  _id: string;
  issue_type: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  replies?: TicketReply[];
  createdAt?: string;
}

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  open: { label: 'Open', bg: 'rgba(59,130,246,0.12)', fg: '#2563EB' },
  in_progress: { label: 'In Progress', bg: 'rgba(234,179,8,0.14)', fg: '#A16207' },
  resolved: { label: 'Resolved', bg: 'rgba(16,185,129,0.12)', fg: '#059669' },
  closed: { label: 'Closed', bg: 'rgba(107,114,128,0.14)', fg: '#6B7280' },
};

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

function TicketCard({ ticket, onReplied }: { ticket: CustomerTicket; onReplied: () => void }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const meta = STATUS_META[ticket.status] ?? STATUS_META.open;
  const isSupport = (r: TicketReply) =>
    typeof r.sender === 'object' && r.sender?.type === 'platform';

  const sendReply = async () => {
    const body = reply.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api.post(`/tickets/${ticket._id}/replies`, { message: body });
      setReply('');
      onReplied();
    } catch {
      /* keep the draft so the customer can retry */
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ borderRadius: '20px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
        style={{ padding: '16px 18px', cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left' }}
      >
        <div className="flex flex-col" style={{ gap: '4px', minWidth: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {ticket.issue_type}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {fmtDate(ticket.createdAt)} · {(ticket.replies ?? []).length} repl{(ticket.replies ?? []).length === 1 ? 'y' : 'ies'}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', background: meta.bg, color: meta.fg, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {meta.label}
          </span>
          <ChevronDown size={16} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {open && (
        <div className="flex flex-col" style={{ gap: '12px', padding: '0 18px 18px' }}>
          {/* Original message */}
          <div style={{ padding: '12px 14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>You wrote</p>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
          </div>

          {/* Thread */}
          {(ticket.replies ?? []).map((r) => (
            <div
              key={r._id}
              style={{
                padding: '12px 14px', borderRadius: '14px',
                background: isSupport(r) ? 'rgba(212,175,55,0.08)' : 'var(--bg-surface-elevated)',
                border: isSupport(r) ? '1px solid rgba(212,175,55,0.25)' : 'none',
              }}
            >
              <p style={{ fontSize: '11px', fontWeight: 700, color: isSupport(r) ? '#A16207' : 'var(--text-muted)', marginBottom: '4px' }}>
                {isSupport(r) ? 'Qlozet Support' : 'You'} · {fmtDate(r.createdAt)}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.message}</p>
            </div>
          ))}

          {/* Reply box — closed tickets are read-only */}
          {ticket.status !== 'closed' && (
            <div className="flex items-center" style={{ gap: '8px' }}>
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Write a reply…"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '100px',
                  border: '1px solid var(--border-glass)', background: 'var(--bg-base)',
                  fontSize: '13px', color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="flex items-center justify-center transition-transform active:scale-95"
                style={{
                  width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'var(--brand-fill)', color: 'var(--brand-fill-text)',
                  opacity: sending || !reply.trim() ? 0.5 : 1,
                }}
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyTicketsContent() {
  const { user } = useApp();
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get('submitted') === '1';

  const [tickets, setTickets] = useState<CustomerTicket[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get('/tickets')
      .then((res) => {
        const d = res.data?.data ?? res.data;
        const rows = d?.rows ?? d?.items ?? d ?? [];
        if (!cancelled) setTickets(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setTickets([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  return (
    <div className="flex flex-col w-full animate-fade-in mx-auto self-center" style={{ gap: '20px', maxWidth: '640px' }}>
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

      <div className="flex items-center justify-between flex-wrap" style={{ gap: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>My Tickets</h1>
        <Link
          href="/help/contact"
          style={{
            padding: '10px 20px', borderRadius: '100px', background: 'var(--brand-fill)',
            color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none',
          }}
        >
          New Ticket
        </Link>
      </div>

      {justSubmitted && (
        <div
          className="flex items-center"
          style={{ gap: '10px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            Your message is with our support team — replies will appear here and in your notifications.
          </p>
        </div>
      )}

      {!user ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--brand-brown)' }}>Sign in</Link> to see your support tickets.
        </p>
      ) : tickets === null ? (
        <div className="flex flex-col animate-pulse" style={{ gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-[var(--bg-surface-elevated)]" style={{ height: '72px' }} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center text-center" style={{ padding: '48px 20px', gap: '10px' }}>
          <MessageSquare size={30} color="var(--text-muted)" />
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>No tickets yet</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px' }}>
            When you contact support, the conversation lives here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {tickets.map((t) => (
            <TicketCard key={t._id} ticket={t} onReplied={() => setReloadKey((k) => k + 1)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={null}>
      <MyTicketsContent />
    </Suspense>
  );
}
