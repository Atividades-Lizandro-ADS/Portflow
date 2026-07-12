import api from './client';

export const createBriefing = (formData) =>
  api.post('/api/briefings/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const acceptBriefing = (id) =>
  api.post(`/api/briefings/${id}/accept/`);

export const declineBriefing = (id, declineReason = '') =>
  api.post(`/api/briefings/${id}/decline/`, { decline_reason: declineReason });
