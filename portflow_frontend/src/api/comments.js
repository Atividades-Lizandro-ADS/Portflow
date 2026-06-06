import api from './client';

export const getComments = (postId) =>
  api.get('/api/comments/', { params: { post: postId } });

export const getMyComments = () =>
  api.get('/api/comments/', { params: { from_this_user: true } });

export const createComment = (postId, text) =>
  api.post('/api/comments/', { comment_post: postId, comment_text: text });

export const updateComment = (id, text) =>
  api.patch(`/api/comments/${id}/`, { comment_text: text });

export const deleteComment = (id) => api.delete(`/api/comments/${id}/`);
