import { useState, useEffect } from 'react';
import { History, Search, ArrowRight, Clock, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const statusLabels = {
  recorded: 'Tercatat',
  allocated: 'Dialokasikan',
  sent: 'Dikirim',
  delivered: 'Diterima',
  completed: 'Selesai',
  failed: 'Gagal',
};

const statusColors = {
  recorded: 'bg-surface-200 text-surface-600',
  allocated: 'bg-blue-100 text-blue-700',
  sent: 'bg-amber-100 text-amber-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-600 text-white',
  failed: 'bg-red-100 text-red-700',
};

const DistributionHistory = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/distribution-history', { params: { search, limit: 100 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat distribusi');
    } finally { setLoading(false); }
  };

  // Group by distribution
  const grouped = data.reduce((acc, item) => {
    const key = item.distribution?.distribution_code || item.distribution_id;
    if (!acc[key]) acc[key] = { distribution: item.distribution, entries: [] };
    acc[key].entries.push(item);
    return acc;
  }, {});

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Riwayat Distribusi</h1>
        <p className="text-sm text-surface-500 mt-1">
          {user?.role === 'pengawas'
            ? 'Lacak perubahan status distribusi dan siapa yang melakukannya untuk kebutuhan audit.'
            : 'Timeline lengkap riwayat perubahan status distribusi'}
        </p>
      </div>

      {user?.role === 'pengawas' && (
        <Alert type="info" title="Akses Pengawas">
          Timeline ini read-only dan membantu mencocokkan distribusi dengan audit log serta bukti lapangan.
        </Alert>
      )}

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-3 max-w-md">
          <div className="flex-1"><Input icon={Search} placeholder="Cari kode distribusi / nama penerima..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([code, group]) => (
            <Card key={code} className="overflow-hidden">
              {/* Header */}
              <div className="bg-surface-50 dark:bg-surface-800/50 px-5 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold dark:text-white">{group.distribution?.recipient_name || '-'}</h3>
                  <span className="text-xs text-surface-500">{code} • {group.distribution?.aidType?.name || '-'}</span>
                </div>
                <span className="text-xs text-surface-400">{group.entries.length} perubahan</span>
              </div>

              {/* Timeline */}
              <div className="p-5">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-200 dark:bg-surface-700" />

                  <div className="space-y-4">
                    {group.entries.map((entry, idx) => (
                      <div key={entry.id} className="relative flex gap-4">
                        {/* Dot */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-surface-900 ${
                          idx === 0 ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.old_status && (
                              <>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[entry.old_status] || 'bg-surface-200 text-surface-600'}`}>
                                  {statusLabels[entry.old_status] || entry.old_status}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-surface-400" />
                              </>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[entry.new_status] || 'bg-surface-200 text-surface-600'}`}>
                              {statusLabels[entry.new_status] || entry.new_status}
                            </span>
                          </div>

                          {entry.reason && (
                            <p className="text-xs text-surface-500 mt-1">{entry.reason}</p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-surface-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.changed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {entry.changedByUser && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {entry.changedByUser.name} ({entry.changedByUser.role})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {data.length === 0 && (
            <div className="text-center py-10 text-surface-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada riwayat perubahan status distribusi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistributionHistory;
