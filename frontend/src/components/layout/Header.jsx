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
    <header className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
      {/* Left side: Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 -ml-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 dark:text-surface-400 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Right side: Tools & Profile */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-surface-200 dark:bg-surface-700 hidden sm:block mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-surface-800 dark:text-surface-200 leading-tight">
              {truncateText(user?.name, 20) || 'Pengguna'}
            </p>
            <p className="text-[11px] text-surface-400 dark:text-surface-500 capitalize">
              {user?.role || '-'}
            </p>
          </div>
          <div className="relative group">
            <button className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-surface-900">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
            </button>
            
            {/* Simple dropdown on hover */}
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-surface-800 rounded-xl shadow-elevated border border-surface-200 dark:border-surface-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
              <div className="p-1.5">
                <div className="px-3 py-2 sm:hidden border-b border-surface-100 dark:border-surface-700 mb-1">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user?.name}</p>
                  <p className="text-[11px] text-surface-400">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
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
