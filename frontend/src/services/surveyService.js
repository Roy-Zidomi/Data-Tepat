import api from './api';

/**
 * Survey service - CRUD operations for field surveys.
 */
const surveyService = {
  getAll: (params = {}) => api.get('/surveys', { params }),
  getById: (id) => api.get(`/surveys/${id}`),
  create: (data) => api.post('/surveys', data),
  update: (id, data) => api.put(`/surveys/${id}`, data),
  submitFromHousehold: (householdId, data = {}) => api.post(`/surveys/households/${householdId}/submit`, data),
  getMyResults: (params = {}) => api.get('/surveys/my-results', { params }),
};

export default surveyService;
