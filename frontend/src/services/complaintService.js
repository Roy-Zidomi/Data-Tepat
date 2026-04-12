import api from './api';

/**
 * Complaint service - API calls for complaint management.
 */
const complaintService = {
  getAll: (params = {}) => api.get('/complaints/all', { params }),
  getMine: () => api.get('/complaints/my'),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  resolve: (id, data) => api.patch(`/complaints/${id}/resolve`, data),
};

export default complaintService;
