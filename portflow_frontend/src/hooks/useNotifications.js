import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from '../api/notifications';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export function useNotifications({ enabled = false } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : pageRef.current;
      const res = await getNotifications(currentPage);
      const { results, next } = res.data;
      setNotifications(prev => (reset ? results : [...prev, ...results]));
      setHasMore(!!next);
      pageRef.current = reset ? 2 : pageRef.current + 1;
    } catch {
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [enabled]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    refresh: () => {
      pageRef.current = 1;
      fetchNotifications(true);
    },
  };
}
