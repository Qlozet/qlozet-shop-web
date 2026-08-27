'use client';

import React, { useEffect, useRef, useState } from 'react';
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

const BROWN = '#462814';

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
    isOpen ? orderReference : null,
    { enabled: isOpen }
  );
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="flex w-full flex-col bg-white sm:max-w-md"
        style={{
          borderRadius: '24px 24px 0 0',
          maxWidth: '440px',
          height: 'min(80vh, 640px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-full flex-col overflow-hidden sm:rounded-[24px]"
          style={{ borderRadius: 'inherit' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '16px 18px', borderBottom: '1px solid #F0F0F0' }}
          >
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: '38px', height: '38px', background: '#F5F3F0' }}
              >
                <Store size={18} color={BROWN} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>
                  {vendorName || 'Your tailor'}
                </span>
                <span style={{ fontSize: '11px', color: '#999' }}>
                  Order {orderReference}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#888" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAF9F7' }}
          >
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 size={20} className="animate-spin" color="#BBB" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center" style={{ gap: '6px', padding: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#555' }}>No messages yet</p>
                <p style={{ fontSize: '12px', color: '#999', maxWidth: '260px' }}>
                  Chat with your tailor about fit, fabric, and progress on this bespoke order.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.sender_role === 'customer';
                const isAdmin = m.sender_role === 'admin';
                if (isAdmin) {
                  return (
                    <div key={m._id} className="flex justify-center">
                      <span style={{ fontSize: '11px', color: '#8A6D3B', background: '#FBF3E0', padding: '6px 12px', borderRadius: '10px', maxWidth: '85%' }}>
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
                        background: mine ? BROWN : '#FFFFFF',
                        color: mine ? '#FFFFFF' : '#1A1A1A',
                        border: mine ? 'none' : '1px solid #EEE',
                      }}
                    >
                      <p style={{ fontSize: '13px', lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.content}
                      </p>
                      <span style={{ display: 'block', marginTop: '3px', fontSize: '9.5px', textAlign: 'right', color: mine ? 'rgba(255,255,255,0.7)' : '#AAA' }}>
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
            <div className="flex items-end" style={{ gap: '8px', padding: '12px 14px', borderTop: '1px solid #F0F0F0' }}>
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
                style={{ flex: 1, maxHeight: '96px', padding: '10px 14px', borderRadius: '18px', border: '1px solid #E5E5E5', fontSize: '13px', color: '#1A1A1A', resize: 'none', outline: 'none' }}
              />
              <button
                onClick={submit}
                disabled={!draft.trim() || sending}
                className="flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: BROWN, border: 'none', cursor: draft.trim() && !sending ? 'pointer' : 'default', flexShrink: 0 }}
              >
                {sending ? <Loader2 size={17} className="animate-spin" color="#FFF" /> : <Send size={17} color="#FFF" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ gap: '8px', padding: '14px', borderTop: '1px solid #F0F0F0', background: '#FAFAFA' }}>
              <Lock size={13} color="#999" />
              <span style={{ fontSize: '11.5px', color: '#999', textAlign: 'center' }}>
                Chat opens once your order is in production.
              </span>
            </div>
          )}

          {error && (
            <p style={{ fontSize: '11px', color: '#DC2626', textAlign: 'center', padding: '0 14px 10px' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
