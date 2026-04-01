import api from './api';

/**
 * Distribution service - API calls for aid distributions.
 */
const distributionService = {
  getAll: (params = {}) => api.get('/distributions', { params }),
  getById: (id) => api.get(`/distributions/${id}`),
  create: (data) => api.post('/distributions', data),
  update: (id, data) => api.put(`/distributions/${id}`, data),
  updateStatus: (id, data) => api.patch(`/distributions/${id}/status`, data),
};

export default distributionService;
