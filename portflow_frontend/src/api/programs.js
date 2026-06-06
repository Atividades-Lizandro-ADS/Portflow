import api from './client';

export const getPrograms = (search = '') =>
  api.get('/api/programs/', { params: { ...(search ? { search } : {}) } });
