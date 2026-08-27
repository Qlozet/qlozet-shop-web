'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Store, Loader2, Lock } from 'lucide-react';
import { useOrderChat, type ChatMessage } from '@/hooks/useOrderChat';

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  vendorName?: string;
  /** True while the order is in production/transit — messages can be sent. */
  canSend: boolean;
}

function timeOf(m: ChatMessage): string {
  const iso = m.createdAt || m.created_at;
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  isOpen,
  onClose,
  orderReference,
  vendorName,
  canSend,
}) => {
  const { messages, loading, sending, error, send } = useOrderChat(
    orderReference,
    { enabled: isOpen }
  );
  const [draft, setDraft] = useState('');
  // Drives the slide/fade — matches the explore filter sheet's behaviour.
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animate in on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Animate out, then unmount.
  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 480);
  };

  // Keep pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, visible]);

  if (!isOpen || typeof document === 'undefined') return null;

  const submit = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    try {
      await send(body);
      setDraft('');
    } catch {
      /* error surfaced by the hook */
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Floating sheet — bottom on mobile, right panel on desktop */}
      <div
        className={`fixed left-3 right-3 bottom-3 lg:left-auto lg:right-12 lg:top-12 lg:bottom-12 lg:w-[400px] z-[100] rounded-[24px] flex flex-col overflow-hidden transition-all duration-500 ease-out max-h-[70vh] lg:max-h-[640px] ${
          visible
            ? 'translate-y-0 lg:translate-x-0 opacity-100'
            : 'translate-y-[calc(100%+20px)] lg:translate-y-0 lg:translate-x-8 lg:opacity-0'
        }`}
        style={{
          backgroundColor: 'var(--bg-base)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-glass)' }}
        >
          <div className="flex items-center" style={{ gap: '10px' }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: '38px', height: '38px', background: 'var(--bg-surface-elevated)' }}
            >
              <Store size={18} color="var(--brand-brown)" />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {vendorName || 'Your tailor'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Order {orderReference}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center transition-colors hover:bg-[var(--bg-surface-elevated)]"
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={20} className="animate-spin" color="var(--text-muted)" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ gap: '6px', padding: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>No messages yet</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '260px' }}>
                Chat with your tailor about fit, fabric, and progress on this bespoke order.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_role === 'customer';
              if (m.sender_role === 'admin') {
                return (
                  <div key={m._id} className="flex justify-center">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', padding: '6px 12px', borderRadius: '10px', maxWidth: '85%' }}>
                      {m.content}
                    </span>
                  </div>
                );
              }
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '9px 13px',
                      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: mine ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                      color: mine ? 'var(--brand-fill-text)' : 'var(--text-primary)',
                      border: mine ? 'none' : '1px solid var(--border-glass)',
                    }}
                  >
                    <p style={{ fontSize: '13px', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.content}
                    </p>
                    <span style={{ display: 'block', marginTop: '3px', fontSize: '9.5px', textAlign: 'right', color: mine ? 'color-mix(in srgb, var(--brand-fill-text) 70%, transparent)' : 'var(--text-muted)' }}>
                      {timeOf(m)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        {canSend ? (
          <div className="flex items-end shrink-0" style={{ gap: '8px', padding: '12px 14px', borderTop: '1px solid var(--border-glass)' }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message your tailor…"
              rows={1}
              style={{ flex: 1, maxHeight: '96px', padding: '10px 14px', borderRadius: '18px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', fontSize: '13px', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
            />
            <button
              onClick={submit}
              disabled={!draft.trim() || sending}
              className="flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--brand-fill)', border: 'none', cursor: draft.trim() && !sending ? 'pointer' : 'default', flexShrink: 0 }}
            >
              {sending ? <Loader2 size={17} className="animate-spin" color="var(--brand-fill-text)" /> : <Send size={17} color="var(--brand-fill-text)" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center shrink-0" style={{ gap: '8px', padding: '14px', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)' }}>
            <Lock size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Chat opens once your order is in production.
            </span>
          </div>
        )}

        {error && (
          <p className="shrink-0" style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center', padding: '0 14px 10px' }}>{error}</p>
        )}
      </div>
    </>,
    document.body
  );
};
