import api from './api';

/**
 * Audit log service - API calls for viewing audit trail.
 */
const auditService = {
  getAll: (params = {}) => api.get('/audit-logs', { params }),
};

export default auditService;
