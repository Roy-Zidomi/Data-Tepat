import api from './api';

/**
 * Region service - API calls for region management.
 */
const regionService = {
  getAll: (params = {}) => api.get('/regions', { params }),
  getById: (id) => api.get(`/regions/${id}`),
  create: (data) => api.post('/regions', data),
  update: (id, data) => api.put(`/regions/${id}`, data),
  delete: (id) => api.delete(`/regions/${id}`),
};

export default regionService;
