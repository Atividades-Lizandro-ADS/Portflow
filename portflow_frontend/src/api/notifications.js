import api from './client';

export const getNotifications = (page = 1) =>
  api.get('/api/notifications/', { params: { page } });

export const getUnreadCount = () =>
  api.get('/api/notifications/unread_count/');

export const markAsRead = (id) =>
  api.patch(`/api/notifications/${id}/`, { is_read: true });

export const markAllRead = () =>
  api.patch('/api/notifications/mark_all_read/');
