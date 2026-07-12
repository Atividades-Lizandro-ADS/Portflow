import api from './client';

export const getTier = (id) => api.get(`/api/commission-tiers/${id}/`);

export const createTier = (formData) =>
  api.post('/api/commission-tiers/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTier = (id, formData) =>
  api.patch(`/api/commission-tiers/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTier = (id) => api.delete(`/api/commission-tiers/${id}/`);
