import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  CheckSquare,
  ClipboardList,
  FileCheck2,
  Home,
  Send,
  Shield,
  Truck,
  Users,
  UserCheck,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import dashboardService from '../../services/dashboardService';
import { capitalizeWords, formatNumber } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import WargaDashboard from './WargaDashboard';
import RelawanDashboard from './RelawanDashboard';

const StatCard = ({ colorClass, icon: Icon, title, value }) => (
  <Card className="flex items-center gap-4 hover:shadow-card-hover transition-all">
    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${colorClass}`}>
      <Icon className="h-7 w-7" />
    </div>
    <div>
      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-100">{formatNumber(value)}</h3>
    </div>
  </Card>
);

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await dashboardService.getStats();
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data statistik dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (['admin_main', 'admin_staff', 'pengawas'].includes(user?.role)) {
      fetchStats();
      return;
    }

    setLoading(false);
  }, [user?.role]);

  const chartData = useMemo(
    () =>
      (stats?.applicationsByStatus || []).map((item) => ({
        name: capitalizeWords(item.status),
        total: item.count,
      })),
    [stats?.applicationsByStatus]
  );

  if (user?.role === 'warga') return <WargaDashboard />;
  if (user?.role === 'relawan') return <RelawanDashboard />;
  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" title="Error">{error}</Alert>;

  const isStaff = user?.role === 'admin_staff';
  const isMain = user?.role === 'admin_main';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isStaff ? 'Dashboard Operasional Staff' : 'Dashboard Overview'}
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {isStaff
              ? 'Fokus pada antrian verifikasi, finalisasi keputusan, revisi, dan laporan ke admin utama.'
              : 'Ringkasan kondisi sistem bantuan sosial untuk monitoring dan pengawasan.'}
          </p>
        </div>
        {user?.role === 'pengawas' && (
          <Alert type="info" title="Mode Pengawasan" className="max-w-md">
            Anda berada pada mode read-only untuk memantau transparansi, akuntabilitas, dan jejak aktivitas sistem.
          </Alert>
        )}
      </div>

      {!isStaff && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Rumah Tangga"
            value={stats?.totalHouseholds ?? 0}
            icon={Home}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            title="Total Permohonan"
            value={stats?.totalApplications ?? 0}
            icon={ClipboardList}
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <StatCard
            title="Keputusan Disetujui"
            value={stats?.approvedDecisions ?? 0}
            icon={CheckSquare}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <StatCard
            title="Distribusi Bantuan"
            value={stats?.totalDistributions ?? 0}
            icon={Truck}
            colorClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
          />
          <StatCard
            title="Pengaduan Aktif"
            value={stats?.openComplaints ?? 0}
            icon={AlertTriangle}
            colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          />
          <StatCard
            title="Total Pengguna"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          />
        </div>
      )}

      {isStaff && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Menunggu Verifikasi Dokumen"
            value={stats?.staffMetrics?.pendingDocumentVerification ?? 0}
            icon={FileCheck2}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            title="Menunggu Validasi Survei"
            value={stats?.staffMetrics?.pendingSurveyValidation ?? 0}
            icon={ClipboardList}
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <StatCard
            title="Menunggu Finalisasi"
            value={stats?.staffMetrics?.pendingFinalization ?? 0}
            icon={Shield}
            colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <StatCard
            title="Approved Minggu Ini"
            value={stats?.staffMetrics?.finalizedApprovedThisWeek ?? 0}
            icon={CheckSquare}
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <StatCard
            title="Revisi Aktif"
            value={stats?.staffMetrics?.revisedCases ?? 0}
            icon={AlertTriangle}
            colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          />
          <StatCard
            title="Belum Dilaporkan ke Utama"
            value={stats?.staffMetrics?.unreportedEligible ?? 0}
            icon={Send}
            colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <Card.Header>
            <Card.Title>Status Permohonan Bantuan</Card.Title>
          </Card.Header>
          {chartData.length === 0 ? (
            <p className="text-sm text-surface-500">Belum ada data status permohonan untuk ditampilkan.</p>
          ) : (
            <div className="mt-4 h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-surface-500" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-surface-500" allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#1e293b',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{isStaff ? 'Prioritas Staff' : 'Ringkasan Monitoring'}</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            {!isStaff && (
              <>
                <div className="rounded-2xl bg-surface-50 p-4 dark:bg-surface-900/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300">
                    <UserCheck className="h-4 w-4" />
                    Laporan Staff Masuk
                  </div>
                  <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-white">
                    {formatNumber(stats?.mainMetrics?.reportedEligible ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-50 p-4 dark:bg-surface-900/50">
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
                    Antrian Buat Akun Warga
                  </p>
                  <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">
                    {formatNumber(stats?.mainMetrics?.pendingAccountCreation ?? 0)}
                  </p>
                </div>
                <Alert type="info" title="Arah Tindak Lanjut">
                  Fokus pada antrian akun warga, kasus revisi, dan pengaduan yang belum terselesaikan.
                </Alert>
              </>
            )}

            {isStaff && (
              <>
                <div className="rounded-2xl bg-surface-50 p-4 dark:bg-surface-900/50">
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-300">Rejected Minggu Ini</p>
                  <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">
                    {formatNumber(stats?.staffMetrics?.finalizedRejectedThisWeek ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-50 p-4 dark:bg-surface-900/50">
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-300">Pengaduan Butuh Eskalasi</p>
                  <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">
                    {formatNumber(stats?.staffMetrics?.complaintsNeedEscalation ?? 0)}
                  </p>
                </div>
                <Alert type="info" title="Arah Operasional">
                  Selesaikan finalisasi, kirim laporan warga layak ke admin utama, lalu tindak lanjuti bukti distribusi.
                </Alert>
              </>
            )}
          </div>
        </Card>
      </div>

      {isMain && (
        <Card>
          <Card.Header>
            <Card.Title>Kontrol Admin Utama</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
              <p className="text-sm text-surface-500">Laporan Staff Minggu Ini</p>
              <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">
                {formatNumber(stats?.mainMetrics?.reportedThisWeek ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
              <p className="text-sm text-surface-500">Kasus Dengan Revisi</p>
              <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">
                {formatNumber(stats?.mainMetrics?.revisedCases ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
              <p className="text-sm text-surface-500">Pengaduan Belum Selesai</p>
              <p className="mt-2 text-xl font-bold text-surface-900 dark:text-white">
                {formatNumber(stats?.openComplaints ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
