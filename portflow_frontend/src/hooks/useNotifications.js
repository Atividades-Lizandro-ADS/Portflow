import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import EventSource from 'react-native-sse';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../api/client';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from '../api/notifications';

const RECONNECT_DELAY_MS = 1500;

async function refreshAccessToken() {
  try {
    const refresh = await SecureStore.getItemAsync('refresh_token');
    if (!refresh) return null;
    const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, { refresh });
    await SecureStore.setItemAsync('access_token', data.access);
    if (data.refresh) await SecureStore.setItemAsync('refresh_token', data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

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

    let es = null;
    let reconnectTimer = null;
    let stopped = false;

    const closeStream = () => {
      clearTimeout(reconnectTimer);
      es?.close();
      es = null;
    };

    const openStream = async () => {
      if (stopped || AppState.currentState !== 'active') return;
      const token = await SecureStore.getItemAsync('access_token');
      if (!token || stopped) return;

      closeStream();
      es = new EventSource(`${BASE_URL}/api/notif-stream/?token=${token}`);

      es.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat_message' || data.type === 'briefing_updated') return;
          setUnreadCount((c) => c + 1);
        } catch {}
      });

      es.addEventListener('error', () => {
        closeStream();
        if (stopped) return;
        reconnectTimer = setTimeout(async () => {
          const refreshed = await refreshAccessToken();
          if (refreshed) openStream();
        }, RECONNECT_DELAY_MS);
      });
    };

    openStream();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchUnreadCount();
        openStream();
      } else {
        closeStream();
      }
    });

    return () => {
      stopped = true;
      closeStream();
      subscription.remove();
    };
  }, [enabled, fetchUnreadCount]);

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
