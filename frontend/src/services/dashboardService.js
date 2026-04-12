import api from './api';

/**
 * Dashboard service - API calls for aggregated dashboard data.
 */
const dashboardService = {
  getStats: () => api.get('/admin/dashboard-stats'),
};

export default dashboardService;
