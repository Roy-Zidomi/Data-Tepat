import { create } from 'zustand';

/**
 * Auth Store - Manages user authentication state, JWT token, and login/logout.
 */
const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('bt_user') || 'null'),
  token: localStorage.getItem('bt_token') || null,
  isAuthenticated: !!localStorage.getItem('bt_token'),

  /** Save login data to state and local storage */
  login: (user, token) => {
    localStorage.setItem('bt_token', token);
    localStorage.setItem('bt_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  /** Clear auth state and local storage */
  logout: () => {
    localStorage.removeItem('bt_token');
    localStorage.removeItem('bt_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  /** Update the user object in state and local storage */
  setUser: (user) => {
    localStorage.setItem('bt_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
