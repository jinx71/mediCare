import api from './axios';

export const getAvailability = (doctor, date) =>
  api.get('/appointments/availability', { params: { doctor, date } });

export const bookAppointment = (payload) => api.post('/appointments', payload);

export const getMyAppointments = () => api.get('/appointments/me');

export const getAllAppointments = (params = {}) => api.get('/appointments', { params });

export const cancelAppointment = (id) => api.patch(`/appointments/${id}/cancel`);

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status });
