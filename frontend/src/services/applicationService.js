import api from './api';

/**
 * Application service - CRUD operations for aid applications.
 */
const applicationService = {
  getAll: (params = {}) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

export default applicationService;
