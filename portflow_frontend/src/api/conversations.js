import api from './client';

export const getConversations = () => api.get('/api/conversations/');

export const getConversation = (id) => api.get(`/api/conversations/${id}/`);

export const createConversation = (tierId) =>
  api.post('/api/conversations/', { tier: tierId });

export const getChatMessages = (conversationId) =>
  api.get('/api/chat-messages/', { params: { conversation: conversationId } });

export const sendChatMessage = (conversationId, body) =>
  api.post('/api/chat-messages/', { conversation: conversationId, body });
