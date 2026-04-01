import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { truncateText } from '../../utils/formatters';

/**
 * Header - Top navigation bar with dark mode toggle and user profile dropdown.
 */
const Header = () => {
  const { toggleSidebar, toggleDarkMode, darkMode } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right side: Tools & Profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 hidden sm:block"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 leading-tight">
              {truncateText(user?.name, 20) || 'Pengguna'}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
              {user?.role || '-'}
            </p>
          </div>
          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </button>
            
            {/* Simple dropdown on hover (for starter) */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 sm:hidden border-b border-surface-100 dark:border-surface-700 mb-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{user?.name}</p>
                  <p className="text-xs text-surface-500">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
