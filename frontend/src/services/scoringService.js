import api from './api';

/**
 * Scoring service - API calls for scoring results.
 */
const scoringService = {
  getAll: (params = {}) => api.get('/scoring', { params }),
  getByApplicationId: (appId) => api.get(`/scoring/application/${appId}`),
  calculate: (applicationId) => api.post('/scoring/calculate', { applicationId }),
};

export default scoringService;
