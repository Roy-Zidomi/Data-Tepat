import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

/**
 * Axios instance configured with base URL, JWT interceptor, and error handling.
 */
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach JWT token
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
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Sesi habis. Silakan login kembali.');
    } else if (status === 403) {
      toast.error('Anda tidak memiliki akses untuk tindakan ini.');
    } else if (status >= 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi.');
    }

    return Promise.reject(error);
  }
);

export default api;