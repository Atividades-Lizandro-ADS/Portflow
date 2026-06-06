import api from './client';

export const getProfile = (id) => api.get(`/api/profiles/${id}/`);

export const searchProfiles = (query, page = 1) =>
  api.get('/api/profiles/', { params: { search: query, page } });

export const updateProfile = (id, formData) =>
  api.patch(`/api/profiles/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
