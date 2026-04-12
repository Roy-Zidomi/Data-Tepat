import api from './api';

/**
 * Application service - CRUD operations for aid applications.
 */
const applicationService = {
  getAll: (params = {}) => api.get('/aid-applications/all', { params }),
  getMine: () => api.get('/aid-applications/my'),
  getById: (id) => api.get(`/aid-applications/${id}`),
  create: (data) => api.post('/aid-applications', data),
  updateStatus: (id, data) => api.patch(`/aid-applications/${id}/status`, data),
};

export default applicationService;
