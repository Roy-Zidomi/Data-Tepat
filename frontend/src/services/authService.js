import api from './api';

/**
 * Auth service - handles login, profile, password change, and password reset API calls.
 */
const authService = {
  login: (emailOrUsername, password, role) =>
    api.post('/auth/login', { emailOrUsername, password, role }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export default authService;
