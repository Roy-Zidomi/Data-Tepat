import api from './api';

/**
 * Survey service - CRUD operations for field surveys.
 */
const surveyService = {
  getAll: (params = {}) => api.get('/surveys', { params }),
  getById: (id) => api.get(`/surveys/${id}`),
  create: (data) => api.post('/surveys', data),
  update: (id, data) => api.put(`/surveys/${id}`, data),

  // Photo Endpoints
  getPhotos: (surveyId) => api.get(`/surveys/${surveyId}/photos`),
  uploadPhotos: (surveyId, formData) => api.post(`/surveys/${surveyId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (surveyId, photoId) => api.delete(`/surveys/${surveyId}/photos/${photoId}`),
};

export default surveyService;
