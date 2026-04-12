import { useState, useEffect } from 'react';
import { ClipboardList, Search, Eye, MapPin, Camera, CheckSquare, Calendar, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const surveyStatusConfig = {
  scheduled: { label: 'Dijadwalkan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'Berjalan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const recommendationLabels = {
  strongly_recommended: { label: 'Sangat Layak', color: 'text-emerald-600 dark:text-emerald-400' },
  recommended: { label: 'Layak', color: 'text-blue-600 dark:text-blue-400' },
  conditional: { label: 'Bersyarat', color: 'text-amber-600 dark:text-amber-400' },
  not_recommended: { label: 'Tidak Layak', color: 'text-red-600 dark:text-red-400' },
};

const SurveyResultList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/survey-results', {
        params: { search, status: filterStatus || undefined, limit: 50 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat hasil survei');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Hasil Survei Lapangan</h1>
        <p className="text-sm text-surface-500 mt-1">Ringkasan hasil survei dari relawan untuk setiap permohonan</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari nama KK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="scheduled">Dijadwalkan</option>
            <option value="in_progress">Berjalan</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((item) => {
            const scfg = surveyStatusConfig[item.status] || surveyStatusConfig.scheduled;
            const rcfg = recommendationLabels[item.recommendation] || {};
            return (
              <Card key={item.id} className="hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">{item.application?.household?.nama_kepala_keluarga || '-'}</h3>
                    <span className="text-xs text-surface-500">{item.application?.application_no}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${scfg.color}`}>{scfg.label}</span>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-surface-400" />
                    <span className="text-surface-500">Tanggal:</span>
                    <span className="font-medium dark:text-white">{new Date(item.survey_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-surface-400" />
                    <span className="text-surface-500">Surveyor:</span>
                    <span className="font-medium dark:text-white">{item.surveyor?.name || '-'}</span>
                  </div>
                  {item.recommendation && (
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-surface-400" />
                      <span className="text-surface-500">Rekomendasi:</span>
                      <span className={`font-bold ${rcfg.color || ''}`}>{rcfg.label || item.recommendation}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-surface-400 mb-3">
                  <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{item._count?.checklists || 0} checklist</span>
                  <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{item._count?.photos || 0} foto</span>
                  {item.matches_submitted_data !== null && (
                    <span className={`flex items-center gap-1 ${item.matches_submitted_data ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.matches_submitted_data ? '✓ Data cocok' : '✗ Data tidak cocok'}
                    </span>
                  )}
                </div>

                <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailModal(item)}>Detail</Button>
              </Card>
            );
          })}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada hasil survei yang tersedia.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Hasil Survei" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold dark:text-white">{detailModal.application?.household?.nama_kepala_keluarga}</h3>
              <p className="text-xs text-surface-500">{detailModal.application?.application_no} • Alamat: {detailModal.application?.household?.alamat || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Tanggal Survei</span><span className="font-medium dark:text-white">{new Date(detailModal.survey_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              <div><span className="text-surface-500 block text-xs">Surveyor</span><span className="font-medium dark:text-white">{detailModal.surveyor?.name || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Status</span><span className={`font-bold ${(surveyStatusConfig[detailModal.status] || {}).color || ''} px-2 py-0.5 rounded-full text-xs`}>{(surveyStatusConfig[detailModal.status] || {}).label || detailModal.status}</span></div>
              <div><span className="text-surface-500 block text-xs">Data Cocok dengan Pengajuan?</span><span className={`font-bold ${detailModal.matches_submitted_data ? 'text-emerald-600' : 'text-red-600'}`}>{detailModal.matches_submitted_data ? 'Ya, Cocok' : 'Tidak Cocok'}</span></div>
              <div><span className="text-surface-500 block text-xs">Rekomendasi</span><span className={`font-bold ${(recommendationLabels[detailModal.recommendation] || {}).color || ''}`}>{(recommendationLabels[detailModal.recommendation] || {}).label || detailModal.recommendation || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Jumlah Checklist</span><span className="font-medium dark:text-white">{detailModal._count?.checklists || 0} item</span></div>
            </div>

            {(detailModal.location_lat || detailModal.location_lng) && (
              <div className="flex items-center gap-2 text-xs text-surface-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Koordinat: {detailModal.location_lat}, {detailModal.location_lng}</span>
              </div>
            )}

            {detailModal.summary && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
                <span className="font-medium text-amber-700 dark:text-amber-400">Ringkasan:</span>
                <p className="mt-1 text-surface-600 dark:text-surface-400">{detailModal.summary}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SurveyResultList;
