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
  uploadProof: (id, formData) =>
    api.post(`/distributions/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default distributionService;
