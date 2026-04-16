import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MapPin, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { HOUSEHOLD_STATUS } from '../../utils/constants';
import api from '../../services/api';

const SurveyList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async (searchValue = search) => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/households', {
        params: {
          page: 1,
          limit: 50,
          search: searchValue || undefined,
          sort_by: 'updated_at',
          sort_dir: 'desc',
        },
      });

      setTasks(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar tugas survei.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Tugas Survei Lapangan</h1>
        <p className="text-sm text-surface-500 mt-1">
          Pilih rumah tangga untuk mengisi atau memperbarui data lapangan (ekonomi, kondisi rumah, aset, kerentanan, dan foto bukti).
        </p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchTasks(search); }} className="flex gap-3 max-w-2xl">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Cari nama kepala keluarga, nomor KK, atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {!error && tasks.length === 0 && (
        <Card>
          <div className="py-10 text-center text-surface-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Belum ada data rumah tangga untuk ditugaskan ke relawan.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((household) => (
          <Card key={household.id} className="hover:shadow-card-hover transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                    {household.nama_kepala_keluarga}
                  </h3>
                  <p className="text-xs text-surface-500 mt-1">KK: {household.nomor_kk}</p>
                </div>
                <StatusBadge statusMap={HOUSEHOLD_STATUS} value={household.status_data} />
              </div>

              <div className="text-sm text-surface-600 dark:text-surface-300 space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-surface-400" />
                  <span>
                    {household.alamat || '-'}
                    {household.region
                      ? `, ${household.region.village}, RT ${household.region.rt || '-'} / RW ${household.region.rw || '-'}`
                      : ''}
                  </span>
                </div>
                <p className="text-xs text-surface-500">
                  Dokumen: {household._count?.documents || 0} | Anggota keluarga: {household._count?.familyMembers || 0}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-200 dark:border-surface-700 flex justify-end">
                <Button size="sm" onClick={() => navigate(`/surveys/${household.id}`)}>
                  Isi / Edit Data Lapangan
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveyList;
