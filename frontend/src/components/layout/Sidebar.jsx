import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, FileText, ClipboardList, BarChart3,
  CheckSquare, Truck, MessageSquare, Shield, ChevronLeft, ChevronRight, X, Heart,
  MapPin, Package, FileIcon
} from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

/**
 * Sidebar - Collapsible navigation sidebar for the dashboard layout.
 */
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'] },
  
  // Modul Admin - Master Data & Administrasi
  { path: '/admin/create-warga', label: 'Akun Warga', icon: Users, roles: ['admin_main'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['admin_main'] },
  { path: '/regions', label: 'Regions', icon: MapPin, roles: ['admin_main', 'admin_staff'] },
  { path: '/aid-types', label: 'Aid Types', icon: Package, roles: ['admin_main', 'admin_staff'] },
  { path: '/applications', label: 'Applications', icon: FileText, roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'] },
  { path: '/decisions', label: 'Decisions', icon: CheckSquare, roles: ['admin_main'] },
  { path: '/distributions', label: 'Distributions', icon: Truck, roles: ['admin_main', 'admin_staff', 'relawan'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['admin_main', 'admin_staff', 'pengawas'] },
  
  // Modul Relawan, Petugas & Warga - Data Lapangan
  { path: '/households', label: 'Households', icon: Home, roles: ['admin_main', 'admin_staff', 'relawan', 'warga'] },
  { path: '/family-members', label: 'Family Members', icon: Users, roles: ['relawan', 'warga'] },
  { path: '/documents', label: 'Documents', icon: FileIcon, roles: ['relawan', 'warga'] },
  
  // Modul Survei (Khusus Relawan)
  { path: '/surveys', label: 'Surveys', icon: ClipboardList, roles: ['relawan'] },
  { path: '/survey-checklists', label: 'Survey Checklists', icon: ClipboardList, roles: ['relawan'] },
  { path: '/survey-photos', label: 'Survey Photos', icon: FileIcon, roles: ['relawan'] },
  
  // Modul Interaksi (Warga & Admin)
  { path: '/complaints', label: 'Complaints', icon: MessageSquare, roles: ['warga', 'admin_main', 'admin_staff'] },
];

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white dark:bg-surface-900
          border-r border-surface-200 dark:border-surface-700
          transition-all duration-300 ease-in-out flex flex-col
          lg:relative lg:z-auto
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold gradient-text whitespace-nowrap">
                BantuTepat
              </span>
            )}
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block p-3 border-t border-surface-200 dark:border-surface-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label={sidebarOpen ? 'Perkecil sidebar' : 'Perbesar sidebar'}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="whitespace-nowrap">Perkecil</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;