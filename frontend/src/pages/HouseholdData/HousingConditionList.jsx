import { useState, useEffect } from 'react';
import { Building2, Search, Eye, Droplets, Zap, Home } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const BoolBadge = ({ value, labelTrue = 'Ya', labelFalse = 'Tidak' }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
    {value ? labelTrue : labelFalse}
  </span>
);

const conditionColor = (val) => {
  if (!val) return 'text-surface-500';
  const v = val.toLowerCase();
  if (v === 'baik' || v === 'good') return 'text-emerald-600';
  if (v === 'sedang' || v === 'fair') return 'text-amber-600';
  return 'text-red-600';
};

const HousingConditionList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/household-data/housing-conditions', { params: { search, limit: 50 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Kondisi Tempat Tinggal</h1>
        <p className="text-sm text-surface-500 mt-1">Data kepemilikan rumah, jenis lantai, dinding, atap, dan sanitasi</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-3 max-w-md">
          <div className="flex-1"><Input icon={Search} placeholder="Cari nama KK..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item.id} className="hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">{item.household?.nama_kepala_keluarga}</h3>
                    <span className="text-xs text-surface-500">{item.household?.nomor_kk}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase ${conditionColor(item.house_condition)}`}>
                  {item.house_condition || '?'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">Status Kepemilikan</span><span className="font-medium dark:text-white">{item.home_ownership_status || '-'}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Lantai</span><span className="font-medium dark:text-white">{item.floor_type || '-'}</span></div>
                <div className="flex justify-between"><span className="text-surface-500">Dinding</span><span className="font-medium dark:text-white">{item.wall_type || '-'}</span></div>
                <div className="flex gap-3 mt-2">
                  <div className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /><BoolBadge value={item.clean_water_access} labelTrue="Air Bersih" labelFalse="No" /></div>
                  <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /><BoolBadge value={item.electricity_access} labelTrue="Listrik" labelFalse="No" /></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
                <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailModal(item)}>Detail</Button>
              </div>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada data kondisi tempat tinggal.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Kondisi Tempat Tinggal" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold text-sm text-surface-900 dark:text-white mb-1">{detailModal.household?.nama_kepala_keluarga}</h3>
              <p className="text-xs text-surface-500">KK: {detailModal.household?.nomor_kk}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Status Kepemilikan</span><span className="font-medium dark:text-white">{detailModal.home_ownership_status || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Kondisi Rumah</span><span className={`font-bold ${conditionColor(detailModal.house_condition)}`}>{detailModal.house_condition || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Jenis Lantai</span><span className="font-medium dark:text-white">{detailModal.floor_type || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Jenis Atap</span><span className="font-medium dark:text-white">{detailModal.roof_type || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Jenis Dinding</span><span className="font-medium dark:text-white">{detailModal.wall_type || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Sanitasi</span><span className="font-medium dark:text-white">{detailModal.sanitation_type || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Kamar Tidur</span><span className="font-medium dark:text-white">{detailModal.bedroom_count ?? '-'} kamar</span></div>
              <div><span className="text-surface-500 block text-xs">Air Bersih</span><BoolBadge value={detailModal.clean_water_access} /></div>
              <div><span className="text-surface-500 block text-xs">Listrik</span><BoolBadge value={detailModal.electricity_access} /></div>
            </div>
            {detailModal.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm"><span className="font-medium text-amber-700">Catatan:</span> {detailModal.notes}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HousingConditionList;
