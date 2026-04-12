import api from './api';

/**
 * Aid Type service - API calls for aid type management.
 */
const aidTypeService = {
  getAll: (params = {}) => api.get('/aid-types-admin', { params }),
  getById: (id) => api.get(`/aid-types-admin/${id}`),
  create: (data) => api.post('/aid-types-admin', data),
  update: (id, data) => api.put(`/aid-types-admin/${id}`, data),
  delete: (id) => api.delete(`/aid-types-admin/${id}`),
};

export default aidTypeService;
