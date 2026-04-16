import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

/**
 * Axios instance configured with base URL, JWT interceptor, and error handling.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor - attach JWT token (keep for fallback/compatibility)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Don't show toast or redirect if we're just checking the initial status or already at login
      const isMeEndpoint = error.config?.url?.includes('/auth/me');
      const isLogoutEndpoint = error.config?.url?.includes('/auth/logout');
      const isLoginPage = window.location.pathname === '/login';

      // Only trigger logout logic if the request wasn't already a logout attempt
      // This prevents an infinite loop where logout fails with 401 and calls logout again
      if (!isLogoutEndpoint) {
        useAuthStore.getState().logout();
      }
      
      if (!isMeEndpoint && !isLogoutEndpoint && !isLoginPage) {
        window.location.href = '/login';
        toast.error('Sesi habis. Silakan login kembali.');
      }
    } else if (status === 403) {
      toast.error('Anda tidak memiliki akses untuk tindakan ini.');
    } else if (status >= 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi.');
    }

    return Promise.reject(error);
  }
);

export default api;
