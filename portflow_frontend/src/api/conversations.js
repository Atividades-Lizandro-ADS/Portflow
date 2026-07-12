import api from './client';

export const getConversations = () => api.get('/api/conversations/');

export const getConversation = (id) => api.get(`/api/conversations/${id}/`);

export const createConversation = (tierId) =>
  api.post('/api/conversations/', { tier: tierId });

export const getChatMessages = (conversationId) =>
  api.get('/api/chat-messages/', { params: { conversation: conversationId } });

export const sendChatMessage = (conversationId, body, attachments = []) => {
  const form = new FormData();
  form.append('conversation', conversationId);
  form.append('body', body ?? '');
  attachments.forEach((file) => {
    form.append('attachments[]', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' });
  });
  return api.post('/api/chat-messages/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
