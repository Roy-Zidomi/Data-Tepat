import api from './api';

/**
 * Decision service - API calls for beneficiary decisions.
 */
const decisionService = {
  getAll: (params = {}) => api.get('/decisions', { params }),
  getById: (id) => api.get(`/decisions/${id}`),
  create: (data) => api.post('/decisions', data),
  update: (id, data) => api.put(`/decisions/${id}`, data),
};

export default decisionService;
