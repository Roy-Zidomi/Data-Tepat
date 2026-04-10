import { create } from 'zustand';

/**
 * Auth Store - Manages user authentication state, JWT token, and login/logout.
 */
const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('bt_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('bt_user'), // Initial guess based on local cache
  isCheckingAuth: true, // Used for initial load spinner

  /** Check auth against the backend using the httpOnly cookie */
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const api = (await import('../services/api')).default;
      const { data } = await api.get('/auth/me');
      set({
        user: data.data,
        isAuthenticated: true,
        isCheckingAuth: false
      });
      localStorage.setItem('bt_user', JSON.stringify(data.data));
    } catch (error) {
      // Token invalid or doesn't exist
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      localStorage.removeItem('bt_user');
    }
  },

  /** Save login data to state and local storage */
  login: (user) => {
    localStorage.setItem('bt_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  /** Clear auth state and hit logout endpoint */
  logout: async () => {
    try {
      const api = (await import('../services/api')).default;
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('bt_user');
      set({ user: null, isAuthenticated: false });
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },

  /** Update the user object in state and local storage */
  setUser: (user) => {
    localStorage.setItem('bt_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
