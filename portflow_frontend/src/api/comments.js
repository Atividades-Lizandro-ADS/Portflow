import api from './client';

export const getComments = (postId) =>
  api.get('/api/comments/', { params: { post: postId } });

export const getMyComments = () =>
  api.get('/api/comments/', { params: { from_this_user: true } });

export const createComment = (postId, content) =>
  api.post('/api/comments/', { comment_post: postId, content });

export const deleteComment = (id) => api.delete(`/api/comments/${id}/`);
