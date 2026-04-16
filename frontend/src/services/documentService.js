import api from './api';

const documentService = {
  getMyDocuments: () => api.get('/documents/my'),
  
  uploadDocument: (data) => api.post('/documents', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  getHouseholdDocuments: (householdId) => api.get(`/documents/household/${householdId}`),
  
  verifyDocument: (id, data) => api.patch(`/documents/${id}/verify`, data),
};

export default documentService;
