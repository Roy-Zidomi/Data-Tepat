import api from './api';

/**
 * Auth service - handles login, profile, and password change API calls.
 */
const authService = {
  login: (emailOrUsername, password) =>
    api.post('/auth/login', { emailOrUsername, password }),

  getMe: () => api.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export default authService;
