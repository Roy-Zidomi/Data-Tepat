import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  Camera,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileSearch,
  FileText,
  Heart,
  History,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Send,
  Shield,
  Truck,
  Users,
  X,
} from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const navStructure = [
  {
    type: 'item',
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'],
  },
  {
    type: 'group',
    label: 'Data Warga',
    labelByRole: { relawan: 'Registrasi & Survei' },
    icon: Home,
    roles: ['admin_staff', 'pengawas', 'relawan'],
    children: [
      { path: '/households', label: 'Rumah Tangga', icon: Home, roles: ['admin_staff', 'pengawas', 'relawan'] },
      { path: '/family-members', label: 'Anggota Keluarga', icon: Users, roles: ['admin_staff', 'relawan'] },
      { path: '/surveys', label: 'Tugas Survei', icon: ClipboardList, roles: ['relawan'] },
      { path: '/my-survey-results', label: 'Hasil Survei Saya', icon: CheckSquare, roles: ['relawan'] },
      { path: '/economic-conditions', label: 'Kondisi Ekonomi', icon: DollarSign, roles: ['admin_staff'] },
      { path: '/housing-conditions', label: 'Kondisi Tempat Tinggal', icon: Home, roles: ['admin_staff'] },
      { path: '/household-assets', label: 'Aset Rumah Tangga', icon: Briefcase, roles: ['admin_staff'] },
      { path: '/vulnerabilities', label: 'Kerentanan', icon: AlertTriangle, roles: ['admin_staff'] },
    ],
  },
  {
    type: 'item',
    path: '/family-members',
    label: 'Anggota Keluarga',
    icon: Users,
    roles: ['warga'],
  },
  {
    type: 'group',
    label: 'Penilaian Kelayakan',
    icon: FileText,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'],
    children: [
      { path: '/eligibility-reports', label: 'Laporan Kelayakan Staff', icon: FileSearch, roles: ['pengawas'] },
      { path: '/oversight-reports', label: 'Hasil Laporan Pengawas', icon: AlertTriangle, roles: ['admin_main'] },
      { path: '/document-verification', label: 'Verifikasi Dokumen', icon: FileSearch, roles: ['admin_staff'] },
      { path: '/survey-results', label: 'Hasil Survei Relawan', icon: ClipboardList, roles: ['admin_staff'] },
      { path: '/scoring-results', label: 'Hasil Skoring', icon: BarChart3, roles: ['admin_staff'] },
      { path: '/decisions', label: 'Finalisasi & Revisi', icon: CheckSquare, roles: ['admin_staff'] },
      { path: '/decision-reports', label: 'Laporan ke Admin Utama', icon: Send, roles: ['admin_staff'] },
    ],
  },
  {
    type: 'group',
    label: 'Distribusi Bantuan',
    icon: Truck,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan'],
    children: [
      { path: '/distributions', label: 'Daftar Distribusi', icon: Truck, roles: ['admin_main', 'admin_staff', 'pengawas', 'relawan'] },
      { path: '/distribution-tracking', label: 'Status Distribusi', icon: Activity, roles: ['admin_main', 'pengawas'] },
      { path: '/distribution-proofs', label: 'Bukti Distribusi', icon: Camera, roles: ['admin_main', 'admin_staff', 'pengawas'] },
      { path: '/distribution-history', label: 'Riwayat Distribusi', icon: History, roles: ['admin_main', 'admin_staff', 'pengawas'] },
    ],
  },
  {
    type: 'group',
    label: 'Manajemen Pengguna',
    icon: Users,
    roles: ['admin_main'],
    children: [
      { path: '/users', label: 'Daftar Pengguna', icon: Users, roles: ['admin_main'] },
      { path: '/admin/create-warga', label: 'Antrian Buat Akun Warga', icon: Users, roles: ['admin_main'] },
    ],
  },
  {
    type: 'item',
    path: '/regions',
    label: 'Wilayah',
    icon: MapPin,
    roles: ['admin_main'],
  },
  {
    type: 'item',
    path: '/aid-types',
    label: 'Jenis Bantuan',
    icon: Package,
    roles: ['admin_main'],
  },
  {
    type: 'group',
    label: 'Audit & Monitoring',
    icon: Shield,
    roles: ['admin_main', 'pengawas'],
    children: [
      { path: '/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['admin_main', 'pengawas'] },
      { path: '/oversight-reports', label: 'Laporan Pengawasan', icon: AlertTriangle, roles: ['pengawas'] },
      { path: '/user-activity', label: 'Aktivitas Pengguna', icon: Activity, roles: ['admin_main'] },
    ],
  },
  {
    type: 'item',
    path: '/complaints',
    label: 'Pengaduan',
    icon: MessageSquare,
    roles: ['admin_main', 'admin_staff', 'pengawas', 'warga'],
  },

];

const SidebarGroup = ({ group, isOpen, onToggle, sidebarOpen, onNavClick, userRole }) => {
  const hasActiveChild = group.children.some((child) => window.location.pathname.startsWith(child.path));
  const displayLabel = (group.labelByRole && group.labelByRole[userRole]) || group.label;

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
          hasActiveChild
            ? 'bg-primary-50 dark:bg-primary-900/15 text-primary-700 dark:text-primary-400'
            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-800 dark:hover:text-surface-200'
        }`}
      >
        <group.icon className="w-[18px] h-[18px] flex-shrink-0" />
        {sidebarOpen && (
          <>
            <span className="whitespace-nowrap flex-1 text-left">{displayLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {sidebarOpen && isOpen && (
        <div className="ml-[18px] mt-0.5 space-y-px border-l border-surface-200 dark:border-surface-700/80 pl-3 animate-fade-in">
          {group.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/15 text-primary-700 dark:text-primary-400'
                    : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-200'
                }`
              }
            >
              <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
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
  const user = useAuthStore((state) => state.user);
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const filteredNav = navStructure
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => {
      if (item.type === 'group') {
        return {
          ...item,
          children: item.children.filter((child) => child.roles.includes(user?.role)),
        };
      }
      if (user?.role === 'warga' && item.path === '/complaints') {
        return {
          ...item,
          label: 'Pengaduan Saya',
        };
      }
      return item;
    })
    .filter((item) => item.type !== 'group' || item.children.length > 0);

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-in-out flex flex-col lg:relative lg:z-auto ${
          sidebarOpen ? 'w-60 translate-x-0' : 'w-0 -translate-x-full lg:w-[60px] lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-surface-200 dark:border-surface-800 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className="text-sm font-bold text-surface-900 dark:text-white whitespace-nowrap">BantuTepat</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4 text-surface-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
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
                  userRole={user?.role}
                />
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/15 text-primary-700 dark:text-primary-400'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-800 dark:hover:text-surface-200'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:block p-2.5 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-600 transition-colors"
            aria-label={sidebarOpen ? 'Perkecil sidebar' : 'Perbesar sidebar'}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Perkecil</span>
              </>
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
