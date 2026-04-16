import { useState, useEffect } from 'react';
import { Users, FileCheck, ClipboardList, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';

const RelawanDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetch dashboard aggregations
    setTimeout(() => { setLoading(false); }, 700);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Relawan Workspace</h1>
          <p className="text-sm text-surface-500 mt-1">
            Ringkasan tugas lapangan dan status survei daerah Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Tugas Survei Baru</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">12</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Survei Selesai (Bulan ini)</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">48</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500">Total KK Didaftarkan</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">124</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold dark:text-white">Tugas Prioritas Tinggi</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/surveys')}>Lihat Semua</Button>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map(task => (
              <div key={task} className="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary-300 cursor-pointer" onClick={() => navigate('/surveys/1')}>
                <div className="flex flex-col gap-1">
                  <span className="text-xs bg-red-100 text-red-700 w-max px-2 rounded font-medium">Overdue</span>
                  <h3 className="font-semibold dark:text-white">Keluarga Bpk. Santoso</h3>
                  <p className="text-xs text-surface-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Target: 2 Hari Lalu</p>
                </div>
                <span className="text-primary-600 font-medium text-sm">Mulai &rarr;</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-primary-50 dark:bg-primary-900/20 text-center py-8">
            <p className="text-primary-800 dark:text-primary-200 font-medium mb-3">Punya kendala mencari alamat Warga?</p>
            <Button onClick={() => window.alert('Koordinat GPS integrasi...')} className="mx-auto">Buka Peta Komunitas</Button>
          </Card>

          <Card className="text-center py-6 border-dashed">
            <p className="text-surface-600 dark:text-surface-400 font-medium mb-3">Dampingi warga yang buta huruf mendaftar.</p>
            <Button onClick={() => navigate('/households/create')} variant="outline" className="mx-auto">Daftarkan KK Baru</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RelawanDashboard;
