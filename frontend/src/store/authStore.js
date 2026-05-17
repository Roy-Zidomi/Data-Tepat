import { create } from 'zustand';

/**
 * Auth Store - Manages user authentication state, JWT token, and login/logout.
 */
const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('bt_user') || 'null'),
  token: localStorage.getItem('bt_token') || null,
  csrfToken: localStorage.getItem('bt_csrf_token') || null,
  isAuthenticated: !!localStorage.getItem('bt_user'), // Initial guess based on local cache
  isCheckingAuth: true, // Used for initial load spinner

  /** Check auth against the backend using the httpOnly cookie or stored bearer token */
  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const api = (await import('../services/api')).default;
      const { data } = await api.get('/auth/me');
      const { csrfToken, ...user } = data.data;
      if (csrfToken) {
        localStorage.setItem('bt_csrf_token', csrfToken);
      }
      set({
        user,
        token: get().token,
        csrfToken: csrfToken || get().csrfToken,
        isAuthenticated: true,
        isCheckingAuth: false
      });
      localStorage.setItem('bt_user', JSON.stringify(user));
    } catch (error) {
      // Token invalid or doesn't exist
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      localStorage.removeItem('bt_user');
      localStorage.removeItem('bt_token');
      localStorage.removeItem('bt_csrf_token');
    }
  },

  /** Save login data to state and local storage */
  login: (user, token = null, csrfToken = null) => {
    localStorage.setItem('bt_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('bt_token', token);
    }
    if (csrfToken) {
      localStorage.setItem('bt_csrf_token', csrfToken);
    }
    set({
      user,
      token: token || get().token,
      csrfToken: csrfToken || get().csrfToken,
      isAuthenticated: true
    });
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
      localStorage.removeItem('bt_token');
      localStorage.removeItem('bt_csrf_token');
      set({ user: null, token: null, csrfToken: null, isAuthenticated: false });
      const publicAuthPages = ['/login', '/reset-password', '/forgot-password'];
      if (!publicAuthPages.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
  },

  /** Update the user object in state and local storage */
  setUser: (user) => {
    localStorage.setItem('bt_user', JSON.stringify(user));
    set({ user });
  },

  /** Clear must_change_password flag after password change */
  clearMustChangePassword: () => {
    const current = get().user;
    if (current) {
      const updated = { ...current, must_change_password: false };
      localStorage.setItem('bt_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));

export default useAuthStore;
