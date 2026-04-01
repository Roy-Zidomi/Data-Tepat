import api from './api';

/**
 * Dashboard service - API calls for aggregated dashboard data.
 */
const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
};

export default dashboardService;
