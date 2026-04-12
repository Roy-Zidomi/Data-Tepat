import { useState, useEffect } from 'react';
import { Briefcase, Search, Eye, Car, Bike, Home as HomeIcon, Landmark } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const AssetTag = ({ has, label, icon: Icon }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${has ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500 line-through'}`}>
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </div>
);

const HouseholdAssetList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/household-data/assets', { params: { search, limit: 50 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data aset');
    } finally { setLoading(false); }
  };

  const countAssets = (item) => {
    let c = 0;
    if (item.owns_house) c++;
    if (item.has_bicycle) c++;
    if (item.has_motorcycle) c++;
    if (item.has_car) c++;
    if (item.has_other_land) c++;
    return c;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Aset Rumah Tangga</h1>
        <p className="text-sm text-surface-500 mt-1">Data kepemilikan kendaraan, tanah, tabungan, dan aset produktif</p>
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
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">{item.household?.nama_kepala_keluarga}</h3>
                    <span className="text-xs text-surface-500">{item.household?.nomor_kk}</span>
                  </div>
                </div>
                <span className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full font-bold text-surface-600 dark:text-surface-300">
                  {countAssets(item)} aset
                </span> 
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <AssetTag has={item.owns_house} label="Rumah" icon={HomeIcon} />
                <AssetTag has={item.has_bicycle} label="Sepeda" icon={Bike} />
                <AssetTag has={item.has_motorcycle} label="Motor" icon={Car} />
                <AssetTag has={item.has_car} label="Mobil" icon={Car} />
                <AssetTag has={item.has_other_land} label="Tanah Lain" icon={Landmark} />
              </div>

              {item.savings_range && (
                <div className="text-xs text-surface-500">Tabungan: <span className="font-medium text-surface-700 dark:text-surface-300">{item.savings_range}</span></div>
              )}

              <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
                <Button size="xs" variant="ghost" icon={Eye} onClick={() => setDetailModal(item)}>Detail</Button>
              </div>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada data aset rumah tangga.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Aset Rumah Tangga" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold text-sm dark:text-white mb-1">{detailModal.household?.nama_kepala_keluarga}</h3>
              <p className="text-xs text-surface-500">KK: {detailModal.household?.nomor_kk}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AssetTag has={detailModal.owns_house} label="Memiliki Rumah" icon={HomeIcon} />
              <AssetTag has={detailModal.has_bicycle} label="Sepeda" icon={Bike} />
              <AssetTag has={detailModal.has_motorcycle} label="Motor" icon={Car} />
              <AssetTag has={detailModal.has_car} label="Mobil" icon={Car} />
              <AssetTag has={detailModal.has_other_land} label="Tanah Lain" icon={Landmark} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Aset Produktif</span><span className="font-medium dark:text-white">{detailModal.productive_assets || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Range Tabungan</span><span className="font-medium dark:text-white">{detailModal.savings_range || '-'}</span></div>
              <div className="col-span-2"><span className="text-surface-500 block text-xs">Aset Lainnya</span><span className="font-medium dark:text-white">{detailModal.other_assets || '-'}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HouseholdAssetList;
