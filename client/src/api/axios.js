import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT (stored in localStorage via AuthContext) to every request.
// NOTE: localStorage is used for portfolio simplicity. In production an
// httpOnly cookie is the more secure choice.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medicare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the shared { success, data, message } envelope and normalize errors
// so every caller can `try { const { data } = await ... } catch (e) { e.message }`.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || error.message || 'Network error';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.errors = payload?.errors || [];
    return Promise.reject(normalized);
  }
);

export default api;
