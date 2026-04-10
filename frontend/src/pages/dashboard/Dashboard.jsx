import { useEffect, useState } from 'react';
import { Users, Home, ClipboardList, CheckSquare } from 'lucide-react';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import dashboardService from '../../services/dashboardService';
import { formatNumber, formatDateTime } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/authStore';
import WargaDashboard from './WargaDashboard';
import RelawanDashboard from './RelawanDashboard';

const Dashboard = () => {
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dummy data fallback for demo purposes
  const dummyStats = {
    totalHouseholds: 1245,
    pendingApplications: 56,
    approvedApplications: 892,
    totalSurveys: 430,
    applicationsByMonth: [
      { name: 'Jan', total: 40 },
      { name: 'Feb', total: 65 },
      { name: 'Mar', total: 85 },
      { name: 'Apr', total: 120 },
      { name: 'Mei', total: 90 },
      { name: 'Jun', total: 110 },
    ]
  };

  useEffect(() => {
    // In a real app we would call dashboardService.getStats()
    // For now we simulate loading
    const fetchStats = async () => {
      try {
        setLoading(true);
        // const res = await dashboardService.getStats();
        // setStats(res.data.data);
        setTimeout(() => {
          setStats(dummyStats);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Gagal memuat data statistik dashboard.');
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (user?.role === 'warga') {
    return <WargaDashboard />;
  }

  if (user?.role === 'relawan') {
    return <RelawanDashboard />;
  }

  if (loading) return <PageLoader />;

  if (error) return <Alert type="error" title="Error">{error}</Alert>;

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card className="flex items-center gap-4 hover:shadow-card-hover transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100 leading-none">
          {formatNumber(value)}
        </h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Ringkasan data bantuan sosial BantuTepat
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rumah Tangga"
          value={stats.totalHouseholds}
          icon={Home}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Permohonan Masuk"
          value={stats.pendingApplications}
          icon={ClipboardList}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          title="Permohonan Disetujui"
          value={stats.approvedApplications}
          icon={CheckSquare}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          title="Survei Lapangan"
          value={stats.totalSurveys}
          icon={Users}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Trend Permohonan Bantuan</Card.Title>
          </Card.Header>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.applicationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-surface-500" />
                <YAxis axisLine={false} tickLine={false} className="text-xs fill-surface-500" />
                <RechartsTooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity placeholder */}
        <Card>
          <Card.Header>
            <Card.Title>Aktivitas Terbaru</Card.Title>
          </Card.Header>
          <div className="space-y-4 mt-2">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="flex items-start gap-3 relative pb-4 border-b border-surface-100 dark:border-surface-800 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    Permohonan APP-100{idx} diverifikasi
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;