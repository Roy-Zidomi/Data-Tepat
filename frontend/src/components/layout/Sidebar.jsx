import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, FileText, ClipboardList,
  CheckSquare, Truck, MessageSquare, Shield, ChevronLeft, ChevronRight, X, Heart,
  MapPin, Package, FileIcon, ChevronDown,
  DollarSign, Building2, Briefcase, AlertTriangle,
  FileSearch, BarChart3, Eye, Camera, History, Activity
} from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

/**
 * Grouped navigation structure for the sidebar.
 * Each group can have sub-items that expand/collapse.
 * role filtering happens at both group and item level.
 */
const navStructure = [
  // 1. Dashboard (standalone)
  {
    type: 'item',
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'],
  },

  // 2. Data Warga (group) — admin_main full, relawan & warga limited
  {
    type: 'group',
    label: 'Data Warga',
    icon: Home,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'],
    children: [
      { path: '/households', label: 'Rumah Tangga', icon: Home, roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'] },
      { path: '/family-members', label: 'Anggota Keluarga', icon: Users, roles: ['admin_main', 'relawan', 'warga'] },
      { path: '/economic-conditions', label: 'Kondisi Ekonomi', icon: DollarSign, roles: ['admin_main'] },
      { path: '/housing-conditions', label: 'Kondisi Tempat Tinggal', icon: Building2, roles: ['admin_main'] },
      { path: '/household-assets', label: 'Aset Rumah Tangga', icon: Briefcase, roles: ['admin_main'] },
      { path: '/vulnerabilities', label: 'Kerentanan', icon: AlertTriangle, roles: ['admin_main'] },
    ],
  },

  // 3. Permohonan Bantuan (group)
  {
    type: 'group',
    label: 'Permohonan Bantuan',
    icon: FileText,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'],
    children: [
      { path: '/applications', label: 'Daftar Permohonan', icon: FileText, roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'] },
      { path: '/document-verification', label: 'Verifikasi Dokumen', icon: FileSearch, roles: ['admin_main'] },
      { path: '/survey-results', label: 'Hasil Survei', icon: ClipboardList, roles: ['admin_main'] },
      { path: '/scoring-results', label: 'Hasil Skoring', icon: BarChart3, roles: ['admin_main'] },
      { path: '/decisions', label: 'Review & Keputusan', icon: CheckSquare, roles: ['admin_main'] },
    ],
  },

  // 4. Distribusi Bantuan (group)
  {
    type: 'group',
    label: 'Distribusi Bantuan',
    icon: Truck,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan'],
    children: [
      { path: '/distributions', label: 'Daftar Distribusi', icon: Truck, roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan'] },
      { path: '/distribution-tracking', label: 'Status Distribusi', icon: Eye, roles: ['admin_main'] },
      { path: '/distribution-proofs', label: 'Bukti Distribusi', icon: Camera, roles: ['admin_main', 'admin_staff', 'pengawas'] },
      { path: '/distribution-history', label: 'Riwayat Distribusi', icon: History, roles: ['admin_main', 'admin_staff', 'pengawas'] },
    ],
  },

  // 5. Manajemen Pengguna (group) — admin_main only
  {
    type: 'group',
    label: 'Manajemen Pengguna',
    icon: Users,
    roles: ['admin_main'],
    children: [
      { path: '/users', label: 'Daftar Pengguna', icon: Users, roles: ['admin_main'] },
      { path: '/admin/create-warga', label: 'Buat Akun Warga', icon: Users, roles: ['admin_main'] },
    ],
  },

  // 6. Wilayah (standalone)
  {
    type: 'item',
    path: '/regions',
    label: 'Wilayah',
    icon: MapPin,
    roles: ['admin_main', 'admin_staff'],
  },

  // 7. Jenis Bantuan (standalone)
  {
    type: 'item',
    path: '/aid-types',
    label: 'Jenis Bantuan',
    icon: Package,
    roles: ['admin_main', 'admin_staff'],
  },

  // 8. Audit & Monitoring (group)
  {
    type: 'group',
    label: 'Audit & Monitoring',
    icon: Shield,
    roles: ['admin_main', 'pengawas'],
    children: [
      { path: '/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['admin_main', 'pengawas'] },
      { path: '/user-activity', label: 'Aktivitas Pengguna', icon: Activity, roles: ['admin_main'] },
    ],
  },

  // 9. Pengaduan (standalone)
  {
    type: 'item',
    path: '/complaints',
    label: 'Pengaduan',
    icon: MessageSquare,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'],
  },

  // ── Modul Khusus Relawan ──
  {
    type: 'group',
    label: 'Survei Lapangan',
    icon: ClipboardList,
    roles: ['relawan'],
    children: [
      { path: '/surveys', label: 'Tugas Survei', icon: ClipboardList, roles: ['relawan'] },
      { path: '/survey-checklists', label: 'Checklist Survei', icon: ClipboardList, roles: ['relawan'] },
      { path: '/survey-photos', label: 'Foto Survei', icon: Camera, roles: ['relawan'] },
    ],
  },

  // ── Modul Khusus Warga ──
  {
    type: 'item',
    path: '/documents',
    label: 'Dokumen Saya',
    icon: FileIcon,
    roles: ['warga'],
  },
];

/**
 * Collapsible sidebar group component
 */
const SidebarGroup = ({ group, isOpen, onToggle, sidebarOpen, onNavClick }) => {
  const hasActiveChild = group.children.some(child => 
    window.location.pathname.startsWith(child.path)
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 group
          ${hasActiveChild
            ? 'bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400'
            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
          }
        `}
      >
        <group.icon className="w-5 h-5 flex-shrink-0" />
        {sidebarOpen && (
          <>
            <span className="whitespace-nowrap flex-1 text-left">{group.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Collapsible children */}
      {sidebarOpen && isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-surface-200 dark:border-surface-700 pl-3 animate-fade-in">
          {group.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavClick}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-200'
                }
              `}
            >
              <child.icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  // Filter navigation by role
  const filteredNav = navStructure
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => {
      if (item.type === 'group') {
        return {
          ...item,
          children: item.children.filter(child => child.roles.includes(user?.role)),
        };
      }
      return item;
    })
    .filter((item) => item.type !== 'group' || item.children.length > 0);

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
          {filteredNav.map((item) => {
            if (item.type === 'group') {
              return (
                <SidebarGroup
                  key={item.label}
                  group={item}
                  isOpen={expandedGroups[item.label] ?? false}
                  onToggle={() => toggleGroup(item.label)}
                  sidebarOpen={sidebarOpen}
                  onNavClick={handleNavClick}
                />
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
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
            );
          })}
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
