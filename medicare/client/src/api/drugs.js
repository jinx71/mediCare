import api from './axios';

export const searchDrugs = (q) => api.get('/drugs/search', { params: { q } });

export const getDrugInfo = (name) => api.get('/drugs/info', { params: { name } });
