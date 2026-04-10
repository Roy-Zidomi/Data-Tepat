import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Heart, Users, Truck, CheckCircle, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Mock Public Data
const mockStats = {
  totalPenerima: 45020,
  totalTersalurkan: 85, // percentage
  danaTerkumpul: 1250000000, 
  programAktif: 4,
  distribusiPerProgram: [
    { name: 'PKH', value: 45 },
    { name: 'BLT UMKM', value: 25 },
    { name: 'Sembako', value: 30 },
  ],
  trendPenyaluran: [
    { bulan: 'Jan', total: 1200 },
    { bulan: 'Feb', total: 2100 },
    { bulan: 'Mar', total: 3400 },
    { bulan: 'Apr', total: 4500 },
  ]
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

const PublicDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      setStats(mockStats);
    }, 500);
  }, []);

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900"><div className="animate-pulse flex items-center gap-2"><Heart className="w-6 h-6 text-primary-500 animate-bounce" /> Memuat Data Publik...</div></div>;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Public Header */}
      <nav className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                 <Heart className="w-6 h-6 text-white" />
               </div>
               <span className="text-xl font-bold gradient-text hidden sm:block">BantuTepat Publik</span>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="ghost" onClick={() => navigate('/login')}>Login Sistem</Button>
               <Button onClick={() => navigate('/donasi')} icon={Heart} className="shadow-lg shadow-primary-500/30">Donasi Sekarang</Button>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-50 to-surface-50 dark:from-surface-800 dark:to-surface-900 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
         <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white leading-tight">
               Transparansi Distribusi <br/><span className="text-primary-600 dark:text-primary-400">Bantuan Sosial</span>
            </h1>
            <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
               Memastikan hak mereka yang membutuhkan tersalurkan dengan tepat sasaran, akuntabel, dan transparan melalui teknologi AI dan Survei Lapangan.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 space-y-8">
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4 shadow-xl shadow-surface-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
               <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users className="w-6 h-6" /></div>
               <div>
                  <p className="text-sm font-medium text-surface-500">Keluarga Penerima</p>
                  <h3 className="text-2xl font-bold dark:text-white">{stats.totalPenerima.toLocaleString()}</h3>
               </div>
            </Card>
            <Card className="flex items-center gap-4 shadow-xl shadow-surface-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
               <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
               <div>
                  <p className="text-sm font-medium text-surface-500">Tingkat Penyaluran</p>
                  <h3 className="text-2xl font-bold dark:text-white">{stats.totalTersalurkan}%</h3>
               </div>
            </Card>
            <Card className="flex items-center gap-4 shadow-xl shadow-surface-200/20 dark:shadow-none hover:-translate-y-1 transition-transform">
               <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Heart className="w-6 h-6" /></div>
               <div>
                  <p className="text-sm font-medium text-surface-500">Donasi Publik (Rp)</p>
                  <h3 className="text-2xl font-bold dark:text-white">{(stats.danaTerkumpul / 1000000).toLocaleString()} Jt</h3>
               </div>
            </Card>
            <Card className="flex items-center gap-4 shadow-xl shadow-surface-200/20 dark:shadow-none hover:-translate-y-1 transition-transform border-primary-200 dark:border-primary-800">
               <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
               <div>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Verifikasi Berlapis</p>
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white mt-1">AI + Survei Lapangan</h3>
               </div>
            </Card>
         </div>

         {/* Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <Card className="lg:col-span-2 p-6 shadow-xl shadow-surface-200/20 dark:shadow-none">
               <h3 className="text-lg font-bold mb-6 dark:text-white">Tren Penyaluran Bantuan Bulanan</h3>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={stats.trendPenyaluran}>
                        <XAxis dataKey="bulan" axisLine={false} tickLine={false} className="text-xs" />
                        <YAxis axisLine={false} tickLine={false} className="text-xs" width={40} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            <Card className="p-6 shadow-xl shadow-surface-200/20 dark:shadow-none relative">
               <h3 className="text-lg font-bold mb-2 dark:text-white">Sebaran Program</h3>
               <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={stats.distribusiPerProgram} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                           {stats.distribusiPerProgram.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                        </Pie>
                        <RechartsTooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               {/* Legend */}
               <div className="mt-2 space-y-2">
                  {stats.distribusiPerProgram.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx]}} />
                          <span className="text-surface-600 dark:text-surface-400">{entry.name}</span>
                       </div>
                       <span className="font-bold dark:text-white">{entry.value}%</span>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Ingin Berpartisipasi?</h2>
            <p className="text-surface-600 dark:text-surface-400 max-w-xl mx-auto mb-6">
              Bantu kami menjangkau lebih banyak nyawa yang membutuhkan uluran tangan dengan berdonasi melalui platform resmi BantuTepat.
            </p>
            <Button size="lg" icon={Heart} onClick={() => navigate('/donasi')}>Mulai Berdonasi</Button>
         </div>
      </div>
    </div>
  );
};

export default PublicDashboard;
