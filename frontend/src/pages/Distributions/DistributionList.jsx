import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import distributionService from '../../services/distributionService';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { DISTRIBUTION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const DistributionList = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchDistributions = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const response = await distributionService.getAll({
        page,
        limit: 10,
        search: searchTerm,
      });
      const payload = response.data.data || {};
      setData(payload.records || []);
      setMeta(payload.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data distribusi bantuan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  const columns = [
    {
      key: 'distribution_code',
      label: 'Kode Distribusi',
      render: (value) => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {value}
        </span>
      ),
    },
    {
      key: 'recipient_name',
      label: 'Penerima',
      render: (value, row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{value || '-'}</p>
          <p className="text-xs text-surface-500">
            {row.decision?.application?.household?.nama_kepala_keluarga || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'aidType',
      label: 'Program',
      sortable: false,
      render: (value) => value?.name || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge statusMap={DISTRIBUTION_STATUS} value={value} />,
    },
    {
      key: 'decision',
      label: 'Permohonan',
      sortable: false,
      render: (value) => value?.application?.application_no || '-',
    },
    {
      key: '_count',
      label: 'Bukti',
      sortable: false,
      render: (value) => value?.proofs || 0,
    },
    {
      key: 'planned_date',
      label: 'Tanggal Rencana',
      render: (value) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Distribusi Bantuan</h1>
        <p className="mt-1 text-sm text-surface-500">
          {user?.role === 'pengawas'
            ? 'Pantau status distribusi, penerima, dan bukti penyaluran secara read-only.'
            : 'Ringkasan distribusi bantuan untuk pelacakan dan pemantauan.'}
        </p>
      </div>

      {user?.role === 'pengawas' && (
        <Alert type="info" title="Akses Pengawas">
          Pengawas hanya dapat memantau penyaluran. Perubahan status dan upload bukti tetap dilakukan petugas operasional.
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            meta={meta}
            onPageChange={(page) => fetchDistributions(page, search)}
            onSearch={(searchTerm) => {
              setSearch(searchTerm);
              fetchDistributions(1, searchTerm);
            }}
            searchPlaceholder="Cari kode distribusi atau nama penerima..."
            emptyMessage="Belum ada data distribusi yang ditemukan."
          />
        </div>
      </Card>
    </div>
  );
};

export default DistributionList;
