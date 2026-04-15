import { useState, useEffect } from 'react';
import { Plus, Users, MapPin, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import householdService from '../../services/householdService';
import useAuthStore from '../../store/authStore';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { HOUSEHOLD_STATUS } from '../../utils/constants';
import Alert from '../../components/ui/Alert';
import { formatDate, maskIdentifier, maskNIK } from '../../utils/formatters';
import toast from 'react-hot-toast';

const HouseholdList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isPengawas = user?.role === 'pengawas';
  const canManageHouseholds = user?.role && !isPengawas;

  const fetchHouseholds = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await householdService.getAll({
        page,
        limit: meta.limit,
        search: searchQuery
      });
      
      const { records, meta: newMeta } = res.data.data;
      setData(records);
      setMeta(newMeta);
    } catch (err) {
      toast.error('Gagal memuat data rumah tangga.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds(1, search);
  }, []);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    // Debounce is ideal here, but for starter directly call
    fetchHouseholds(1, searchTerm);
  };

  const columns = [
    {
      key: 'nomor_kk',
      label: 'Nomor KK',
      render: (val) => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {isPengawas ? maskIdentifier(val) : val}
        </span>
      ),
    },
    { key: 'nama_kepala_keluarga', label: 'Kepala Keluarga' },
    {
      key: 'nik_kepala_keluarga',
      label: 'NIK',
      render: (value) => (isPengawas ? maskNIK(value) : value),
    },
    {
      key: 'region',
      label: 'Wilayah',
      sortable: false,
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{val?.village}, RT {val?.rt}/{val?.rw}</span>
        </div>
      )
    },
    {
      key: '_count',
      label: 'Anggota',
      sortable: false,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-surface-400" />
          <span>{val?.familyMembers || 0}</span>
        </div>
      )
    },
    {
      key: 'status_data',
      label: 'Status',
      render: (val) => <StatusBadge statusMap={HOUSEHOLD_STATUS} value={val} />
    },
    {
      key: 'created_at',
      label: 'Tanggal Register',
      render: (val) => <span className="text-xs">{formatDate(val)}</span>
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            variant="ghost"
            icon={Eye}
            onClick={() => navigate(`/households/${row.id}`)}
          >
            Detail
          </Button>
          {canManageHouseholds && (
            <Button
              size="xs"
              variant="ghost"
              icon={Edit}
              onClick={() => navigate(`/households/${row.id}/edit`)}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700"
            />
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Data Rumah Tangga</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {isPengawas
              ? 'Pantau profil rumah tangga dan integritas data warga secara read-only.'
              : 'Kelola data rumah tangga dan kepala keluarga'}
          </p>
        </div>
        {canManageHouseholds && (
          <Button
            icon={Plus}
            onClick={() => navigate('/households/create')}
          >
            Tambah Data
          </Button>
        )}
      </div>

      {isPengawas && (
        <Alert type="info" title="Mode Pengawasan">
          Data sensitif ditampilkan seperlunya untuk pemantauan. Semua perubahan data tetap dilakukan oleh petugas operasional.
        </Alert>
      )}

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            meta={meta}
            onPageChange={(page) => fetchHouseholds(page, search)}
            onSearch={handleSearch}
            searchPlaceholder="Cari KK, Nama..."
            emptyMessage="Tidak ada data rumah tangga ditemukan."
          />
        </div>
      </Card>
    </div>
  );
};

export default HouseholdList;
