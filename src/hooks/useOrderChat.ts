'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

// A single message in a bespoke order's customer <-> tailor thread.
export interface ChatMessage {
  _id: string;
  order_reference: string;
  sender: string;
  sender_role: 'customer' | 'vendor' | 'admin';
  content: string;
  createdAt?: string;
  created_at?: string;
}

// The Socket.IO server lives at the API origin without the `/api` suffix.
function socketOrigin(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'https://qlozet-backend.fly.dev/api';
  return base.replace(/\/api\/?$/, '');
}

interface UseOrderChatOptions {
  /** Only load/connect when the thread is actually open. */
  enabled: boolean;
}

/**
 * Bespoke order chat: loads history over REST, sends over REST, and receives
 * new messages live over Socket.IO (deduped by id against optimistic appends).
 */
export function useOrderChat(
  reference: string | null,
  { enabled }: UseOrderChatOptions
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const append = useCallback((m: ChatMessage) => {
    setMessages((prev) =>
      prev.some((x) => x._id === m._id) ? prev : [...prev, m]
    );
  }, []);

  const load = useCallback(async () => {
    if (!reference) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${reference}/messages`);
      const list = res.data?.data ?? res.data ?? [];
      setMessages(Array.isArray(list) ? list : []);
    } catch {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, [reference]);

  // Load history when opened.
  useEffect(() => {
    if (!enabled || !reference) return;
    load();
  }, [enabled, reference, load]);

  // Live delivery.
  useEffect(() => {
    if (!enabled || !reference || typeof window === 'undefined') return;
    const token = localStorage.getItem('qlozet_access_token');
    if (!token) return;

    const socket = io(socketOrigin(), {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    const onMessage = (m: ChatMessage) => {
      if (m.order_reference === reference) append(m);
    };
    socket.on('order-message', onMessage);

    return () => {
      socket.off('order-message', onMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, reference, append]);

  const send = useCallback(
    async (content: string) => {
      const body = content.trim();
      if (!reference || !body) return;
      setSending(true);
      setError(null);
      try {
        const res = await api.post(`/orders/${reference}/messages`, {
          content: body,
        });
        const msg: ChatMessage | undefined = res.data?.data ?? res.data;
        if (msg?._id) append(msg);
      } catch (err: unknown) {
        const anyErr = err as {
          response?: { data?: { message?: string | string[] } };
        };
        const m = anyErr?.response?.data?.message;
        setError(
          (Array.isArray(m) ? m[0] : m) || 'Could not send your message.'
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [reference, append]
  );

  return { messages, loading, sending, error, send, reload: load };
}
