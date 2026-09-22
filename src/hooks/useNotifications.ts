'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// In-app notification inbox — GET /notifications (paginated), PATCH :id/read,
// PATCH mark-all-read, GET /notifications/unread-count.

export interface AppNotification {
  _id: string;
  category: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { page: p, limit: 20 } });
      const rows: AppNotification[] = res.data?.data ?? [];
      setNotifications((prev) => (append ? [...prev, ...rows] : rows));
      setPage(res.data?.meta?.page ?? p);
      setTotalPages(res.data?.meta?.totalPages ?? 1);
      setError(null);
    } catch {
      setError('Could not load your notifications.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchPage(1, false);
  }, [enabled, fetchPage]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) fetchPage(page + 1, true);
  };

  // Optimistic: flip locally, tell the backend in the background.
  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)),
    );
    api.patch(`/notifications/${id}/read`).catch(() => undefined);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    api.patch('/notifications/mark-all-read').catch(() => undefined);
  };

  return {
    notifications,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    loadMore,
    markRead,
    markAllRead,
  };
}

/** Lightweight unread-count poll for badges (profile menu row). */
export function useUnreadNotificationCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!enabled) return;
    api.get('/notifications/unread-count')
      .then((res) => setCount(res.data?.data?.total ?? 0))
      .catch(() => undefined);
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
