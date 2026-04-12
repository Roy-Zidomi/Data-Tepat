import { useState, useEffect } from 'react';
import { BarChart3, Search, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const priorityConfig = {
  critical: { label: 'Kritis', color: 'bg-red-600 text-white', bar: 'bg-red-500' },
  high: { label: 'Tinggi', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', bar: 'bg-red-400' },
  medium: { label: 'Sedang', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', bar: 'bg-amber-400' },
  low: { label: 'Rendah', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', bar: 'bg-emerald-400' },
};

const ScoreBar = ({ label, score, max = 20 }) => {
  const pct = Math.min((parseFloat(score || 0) / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-surface-500">{label}</span>
        <span className="font-bold dark:text-white">{parseFloat(score || 0).toFixed(1)}</span>
      </div>
      <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ScoringResultList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/scoring-results', {
        params: { search, priority_level: filterPriority || undefined, limit: 50 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat hasil skoring');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Hasil Skoring</h1>
        <p className="text-sm text-surface-500 mt-1">Skor prioritas kelayakan bantuan berdasarkan semua parameter</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari nama KK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Prioritas</option>
            <option value="critical">Kritis</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((item) => {
            const pcfg = priorityConfig[item.priority_level?.toLowerCase()] || priorityConfig.low;
            return (
              <Card key={item.id} className="hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">{item.application?.household?.nama_kepala_keluarga || '-'}</h3>
                    <span className="text-xs text-surface-500">{item.application?.application_no}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pcfg.color}`}>
                    {pcfg.label}
                  </span>
                </div>

                {/* Total score circle */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200 dark:text-surface-700" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3"
                        strokeDasharray={`${parseFloat(item.total_score || 0)}, 100`}
                        className="text-primary-500" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black dark:text-white">
                      {parseFloat(item.total_score || 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex-1 text-xs text-surface-500">
                    <div>Jenis: <span className="font-medium text-surface-700 dark:text-surface-300">{item.application?.aidType?.name || '-'}</span></div>
                    <div>Status: <span className="font-medium text-surface-700 dark:text-surface-300">{item.application?.status || '-'}</span></div>
                    <div>Versi: <span className="font-medium text-surface-700 dark:text-surface-300">{item.scoring_version || '-'}</span></div>
                  </div>
                </div>

                <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailModal(item)} className="w-full justify-center">Lihat Detail Skor</Button>
              </Card>
            );
          })}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada hasil skoring yang tersedia.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Skor Kelayakan" size="lg">
        {detailModal && (
          <div className="space-y-5">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold dark:text-white">{detailModal.application?.household?.nama_kepala_keluarga}</h3>
                <p className="text-xs text-surface-500">{detailModal.application?.application_no} • {detailModal.application?.aidType?.name}</p>
              </div>
              <div className="text-center">
                <span className="text-3xl font-black text-primary-600">{parseFloat(detailModal.total_score || 0).toFixed(1)}</span>
                <span className={`block text-xs font-bold mt-1 px-3 py-0.5 rounded-full ${(priorityConfig[detailModal.priority_level?.toLowerCase()] || priorityConfig.low).color}`}>
                  {(priorityConfig[detailModal.priority_level?.toLowerCase()] || priorityConfig.low).label}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold dark:text-white">Breakdown Skor</h4>
              <ScoreBar label="Pendapatan" score={detailModal.income_score} />
              <ScoreBar label="Tanggungan" score={detailModal.dependents_score} />
              <ScoreBar label="Tempat Tinggal" score={detailModal.housing_score} />
              <ScoreBar label="Aset" score={detailModal.asset_score} />
              <ScoreBar label="Kerentanan" score={detailModal.vulnerability_score} />
              <ScoreBar label="Riwayat Bantuan" score={detailModal.history_aid_score} />
            </div>

            {detailModal.score_note && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <span className="font-medium text-blue-700 dark:text-blue-400">Catatan:</span> {detailModal.score_note}
              </div>
            )}

            <div className="text-xs text-surface-400 text-right">
              Dinilai oleh: {detailModal.scoredByUser?.name || 'System'} • {new Date(detailModal.scored_at).toLocaleDateString('id-ID')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScoringResultList;
