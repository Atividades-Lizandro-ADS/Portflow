import api from './client';

export const createConversation = (tierId) =>
  api.post('/api/conversations/', { tier: tierId });

export const sendChatMessage = (conversationId, body) =>
  api.post('/api/chat-messages/', { conversation: conversationId, body });
