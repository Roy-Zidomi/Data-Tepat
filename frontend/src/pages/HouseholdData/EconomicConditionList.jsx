import { useState, useEffect } from 'react';
import { DollarSign, Search, Pencil, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatCurrency = (val) => {
  if (!val) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const EconomicConditionList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/household-data/economic-conditions', { params: { search, limit: 50 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kondisi ekonomi');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Kondisi Ekonomi</h1>
        <p className="text-sm text-surface-500 mt-1">Data pendapatan, pengeluaran, dan sumber ekonomi rumah tangga</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-3 max-w-md">
          <div className="flex-1">
            <Input icon={Search} placeholder="Cari nama kepala keluarga..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item.id} className="hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">{item.household?.nama_kepala_keluarga}</h3>
                    <span className="text-xs text-surface-500">{item.household?.nomor_kk}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Pendapatan/Bulan</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.monthly_income_total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Pengeluaran/Bulan</span>
                  <span className="font-medium dark:text-white">{formatCurrency(item.monthly_basic_expense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Pekerjaan KK</span>
                  <span className="font-medium dark:text-white">{item.head_job_status || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Tanggungan</span>
                  <span className="font-medium dark:text-white">{item.dependents_count ?? '-'} orang</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-700 flex gap-2">
                <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailModal(item)}>Detail</Button>
              </div>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada data kondisi ekonomi yang tercatat.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Kondisi Ekonomi" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold text-sm text-surface-900 dark:text-white mb-1">{detailModal.household?.nama_kepala_keluarga}</h3>
              <p className="text-xs text-surface-500">KK: {detailModal.household?.nomor_kk}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Pendapatan Total/Bulan</span><span className="font-semibold text-lg text-emerald-600">{formatCurrency(detailModal.monthly_income_total)}</span></div>
              <div><span className="text-surface-500 block text-xs">Pengeluaran Pokok/Bulan</span><span className="font-semibold text-lg">{formatCurrency(detailModal.monthly_basic_expense)}</span></div>
              <div><span className="text-surface-500 block text-xs">Sumber Pendapatan</span><span className="font-medium dark:text-white">{detailModal.income_source || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Status Pekerjaan KK</span><span className="font-medium dark:text-white">{detailModal.head_job_status || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Jumlah Tanggungan</span><span className="font-medium dark:text-white">{detailModal.dependents_count ?? '-'} orang</span></div>
              <div><span className="text-surface-500 block text-xs">Sumber Lain?</span><span className="font-medium dark:text-white">{detailModal.has_other_income_source ? 'Ya' : 'Tidak'}</span></div>
              <div><span className="text-surface-500 block text-xs">Estimasi Utang</span><span className="font-medium dark:text-white">{formatCurrency(detailModal.debt_estimation)}</span></div>
            </div>
            {detailModal.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm"><span className="font-medium text-amber-700 dark:text-amber-400">Catatan:</span> {detailModal.notes}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EconomicConditionList;
