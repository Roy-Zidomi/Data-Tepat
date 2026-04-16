import api from './api';

/**
 * Decision service - API calls for beneficiary decisions.
 */
const decisionService = {
  getAll: (params = {}) => api.get('/decisions', { params }),
  getById: (id) => api.get(`/decisions/${id}`),
  create: (data) => api.post('/decisions', data),
  revise: (id, data) => api.patch(`/decisions/${id}/revise`, data),
  reportToMain: (id) => api.patch(`/decisions/${id}/report-main`),
};

export default decisionService;
