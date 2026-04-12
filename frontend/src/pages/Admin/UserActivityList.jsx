import { useState, useEffect } from 'react';
import { Activity, Search, Shield, User, Clock, ShieldAlert } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const roleColors = {
  admin_main: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin_staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pengawas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  relawan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warga: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
};

const UserActivityList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/user-activity', {
        params: { search, role: roleFilter || undefined, limit: 50 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat aktivitas pengguna');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Aktivitas Pengguna</h1>
          <p className="text-sm text-surface-500 mt-1">Monitor aktivitas login dan perubahan data oleh setiap pengguna (7 hari terakhir)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/30">
          <ShieldAlert className="w-4 h-4" />
          Admin Main Only
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Peran</option>
            <option value="admin_main">Admin Utama</option>
            <option value="admin_staff">Admin Staff</option>
            <option value="pengawas">Pengawas</option>
            <option value="relawan">Relawan</option>
            <option value="warga">Warga</option>
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((user) => (
            <Card key={user.id} className="hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.is_active ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-surface-200 text-surface-500 dark:bg-surface-700'
                  }`}>
                    {user.role.includes('admin') ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold dark:text-white truncate" title={user.name}>{user.name}</h3>
                    <p className="text-xs text-surface-500 truncate" title={user.email}>{user.email || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColors[user.role] || roleColors.warga}`}>
                  {user.role.replace('_', ' ')}
                </span>
                {!user.is_active && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Nonaktif
                  </span>
                )}
              </div>

              <div className="space-y-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Aksi (7 hari)</span>
                  </div>
                  <span className="font-bold text-sm dark:text-white">{user.recent_activity_count}</span>
                </div>
                
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Bergabung pada:</span>
                    <span className="font-medium dark:text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {user.latest_action && (
                <div className="mt-3 text-xs flex gap-2 w-full">
                  <span className="text-surface-400 flex-shrink-0"><Clock className="w-3.5 h-3.5 inline mr-1"/>Terbaru:</span>
                  <span className="truncate text-surface-700 dark:text-surface-300">
                    <span className="font-medium">{user.latest_action.action}</span> {user.latest_action.entity_type}
                  </span>
                </div>
              )}
            </Card>
          ))}
          
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Tidak ada data aktivitas pengguna.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserActivityList;
