'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { config } from '@/lib/config';

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
    config.apiUrl;
  return base.replace(/\/api\/?$/, '');
}

// The response interceptor wraps the service's `{ data: ... }` return inside its
// own `data`, so the payload sits a couple of `.data` levels deep. Dig down to
// the array (thread) / message object regardless of nesting depth.
function digArray(v: unknown): ChatMessage[] {
  if (Array.isArray(v)) return v as ChatMessage[];
  if (v && typeof v === 'object' && 'data' in v) {
    return digArray((v as { data: unknown }).data);
  }
  return [];
}
function digMessage(v: unknown): ChatMessage | null {
  if (v && typeof v === 'object') {
    if ('_id' in v) return v as ChatMessage;
    if ('data' in v) return digMessage((v as { data: unknown }).data);
  }
  return null;
}

function msgTime(m: ChatMessage): number {
  const t = Date.parse(m.createdAt || m.created_at || '');
  return Number.isNaN(t) ? 0 : t;
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
      setMessages(digArray(res.data));
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

  // Fetch the thread again and merge it in, without a spinner or wiping what's
  // on screen if it fails. Fills in anything missed while the connection was
  // down. The request also renews an expired login (the api client refreshes
  // on 401), so a reconnect after it picks up the fresh token.
  const sync = useCallback(async () => {
    if (!reference) return;
    try {
      const res = await api.get(`/orders/${reference}/messages`);
      const fresh = digArray(res.data);
      setMessages((prev) => {
        const byId = new Map<string, ChatMessage>();
        for (const m of prev) byId.set(m._id, m);
        for (const m of fresh) byId.set(m._id, m);
        return [...byId.values()].sort(
          (a, b) => msgTime(a) - msgTime(b)
        );
      });
    } catch {
      // Keep what's shown; the next reconnect or tab focus tries again.
    }
  }, [reference]);

  // Live delivery.
  useEffect(() => {
    if (!enabled || !reference || typeof window === 'undefined') return;
    if (!localStorage.getItem('qlozet_access_token')) return;

    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 2000;

    const socket = io(socketOrigin(), {
      // A function, so every reconnect sends the newest token.
      auth: (cb) => cb({ token: localStorage.getItem('qlozet_access_token') }),
      transports: ['websocket'],
    });
    socketRef.current = socket;

    const onMessage = (m: ChatMessage) => {
      if (m.order_reference === reference) append(m);
    };
    // Every (re)connect: catch up on anything sent while we weren't listening.
    const onConnect = () => {
      retryDelay = 2000;
      sync();
    };
    // The server only hangs up on its own when the login is no longer valid.
    // Renew it with a normal request, then reconnect, backing off up to 30s.
    const onDisconnect = (reason: string) => {
      if (stopped || reason !== 'io server disconnect') return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(async () => {
        await sync();
        if (stopped || !localStorage.getItem('qlozet_access_token')) return;
        retryDelay = Math.min(retryDelay * 2, 30000);
        socket.connect();
      }, retryDelay);
    };
    // A phone waking up or a tab coming back: catch up straight away rather
    // than waiting for the connection to notice it went stale.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      sync();
      if (!socket.connected) socket.connect();
    };

    socket.on('order-message', onMessage);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onVisible);

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onVisible);
      socket.off('order-message', onMessage);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, reference, append, sync]);

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
        const msg = digMessage(res.data);
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
