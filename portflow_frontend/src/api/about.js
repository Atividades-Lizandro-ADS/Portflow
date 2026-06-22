import api from './client';

export const getAbout = (id) => api.get(`/api/about/${id}/`);

export const updateAbout = (id, data) => api.patch(`/api/about/${id}/`, data);
