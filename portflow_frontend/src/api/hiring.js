import api from './client';

export const getHiringOptions = () => api.get('/api/hiring/');
export const getSkillOptions = () => api.get('/api/skills/');
