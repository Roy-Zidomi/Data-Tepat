import { useEffect, useState } from 'react';
import { Home, FileText, Truck, AlertTriangle, FileSearch, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <Card className="hover:shadow-card-hover transition-all cursor-pointer group" onClick={onClick}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
        <p className="text-2xl font-black text-surface-900 dark:text-white">{value}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
    </div>
  </Card>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat statistik dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" title="Error">{error}</Alert>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard Staff</h1>
        <p className="text-sm text-surface-500 mt-1">Ringkasan tugas operasional Anda</p>
      </div>

      {/* Task Notification Cards — Separated fields (Revisi #6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Home}
          label="Data Warga Belum Lengkap"
          value={stats.incompleteHouseholds || 0}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          onClick={() => navigate('/households')}
        />
        <StatCard
          icon={FileText}
          label="Permohonan Diproses"
          value={stats.processingApplications || 0}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          onClick={() => navigate('/applications')}
        />
        <StatCard
          icon={FileSearch}
          label="Dokumen Menunggu Verifikasi"
          value={stats.pendingDocumentVerification || 0}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          onClick={() => navigate('/document-verification')}
        />
        <StatCard
          icon={ClipboardList}
          label="Survei Selesai (Perlu Review)"
          value={stats.pendingSurveyReview || 0}
          color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          onClick={() => navigate('/survey-results')}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Truck}
          label="Total Distribusi"
          value={stats.totalDistributions || 0}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          onClick={() => navigate('/distributions')}
        />
        <StatCard
          icon={MessageSquare}
          label="Pengaduan Aktif"
          value={stats.openComplaints || 0}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Rumah Tangga"
          value={stats.totalHouseholds || 0}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          onClick={() => navigate('/households')}
        />
      </div>

      {/* Recent Distributions */}
      {stats.recentDistributions?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold dark:text-white">Distribusi Terbaru</h2>
            <button onClick={() => navigate('/distributions')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Lihat Semua →
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentDistributions.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium dark:text-white">{d.recipient_name || d.household_head || '-'}</p>
                  <p className="text-xs text-surface-500">{d.aid_type} — {d.distribution_code}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    d.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    d.status === 'delivered' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{d.status}</span>
                  <p className="text-xs text-surface-400 mt-1">{formatDateTime(d.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StaffDashboard;
