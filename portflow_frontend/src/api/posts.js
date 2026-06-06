import api from './client';

export const getPosts = (page = 1, search = '') =>
  api.get('/api/posts/', { params: { page, ...(search ? { search } : {}) } });

export const getPost = (id) => api.get(`/api/posts/${id}/`);

export const createPost = (formData) =>
  api.post('/api/posts/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePost = (id, formData) =>
  api.patch(`/api/posts/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePost = (id) => api.delete(`/api/posts/${id}/`);

export const toggleLike = (id) => api.post(`/api/posts/${id}/like/`);

export const toggleFavorite = (id) => api.post(`/api/posts/${id}/favorite/`);
