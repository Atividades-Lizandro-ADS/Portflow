import api from './client';

export const updatePostImage = (id, data) => api.patch(`/api/post-images/${id}/`, data);
export const deletePostImage = (id) => api.delete(`/api/post-images/${id}/`);
