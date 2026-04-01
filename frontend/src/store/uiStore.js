import { create } from 'zustand';

/**
 * UI Store - Manages sidebar state, dark mode toggle, and global search.
 */
const useUIStore = create((set) => ({
  sidebarOpen: true,
  darkMode: localStorage.getItem('bt_theme') === 'dark',
  globalSearch: '',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      localStorage.setItem('bt_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: next };
    }),

  setGlobalSearch: (globalSearch) => set({ globalSearch }),
}));

// Initialize dark mode class on page load
if (localStorage.getItem('bt_theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

export default useUIStore;
