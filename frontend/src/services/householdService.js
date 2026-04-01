import api from './api';

/**
 * Household service - CRUD operations for the households module.
 */
const householdService = {
  getAll: (params = {}) => api.get('/households', { params }),
  getById: (id) => api.get(`/households/${id}`),
  create: (data) => api.post('/households', data),
  update: (id, data) => api.put(`/households/${id}`, data),
  delete: (id) => api.delete(`/households/${id}`),
};

export default householdService;
