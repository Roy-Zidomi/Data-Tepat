import { useEffect, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import applicationService from '../../services/applicationService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS, DECISION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ApplicationList = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const isOwnView = user?.role === 'warga';
  const canCreate = ['admin_main', 'admin_staff', 'warga'].includes(user?.role);

  const fetchApplications = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true);
      setError('');

      if (isOwnView) {
        const response = await applicationService.getMine();
        const records = response.data.data || [];
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const filteredRecords = normalizedSearch
          ? records.filter((record) =>
              [
                record.application_no,
                record.household?.nama_kepala_keluarga,
                record.household?.nomor_kk,
                record.aidType?.name,
              ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedSearch))
            )
          : records;

        setData(filteredRecords);
        setMeta(null);
        return;
      }

      const response = await applicationService.getAll({
        page,
        limit: 10,
        search: searchTerm,
      });

      const payload = response.data.data || {};
      setData(payload.records || []);
      setMeta(payload.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar permohonan bantuan.');
      toast.error('Gagal memuat daftar permohonan bantuan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) {
      fetchApplications();
    }
  }, [user?.role]);

  const columns = [
    {
      key: 'application_no',
      label: 'No. Permohonan',
      render: (value) => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {value}
        </span>
      ),
    },
    {
      key: 'household',
      label: 'Rumah Tangga',
      sortable: false,
      render: (_, row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">
            {row.household?.nama_kepala_keluarga || '-'}
          </p>
          <p className="text-xs text-surface-500">{row.household?.nomor_kk || '-'}</p>
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
      key: 'scoringResults',
      label: 'Skor',
      sortable: false,
      render: (value) => {
        const latestScore = value?.[0];
        return latestScore ? `${latestScore.total_score ?? latestScore.score} (${latestScore.priority_level || '-'})` : '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge statusMap={APPLICATION_STATUS} value={value} />,
    },
    {
      key: 'beneficiaryDecision',
      label: 'Keputusan',
      sortable: false,
      render: (value) => (
        value?.decision_status
          ? <StatusBadge statusMap={DECISION_STATUS} value={value.decision_status} />
          : <span className="text-xs text-surface-500">Belum ada</span>
      ),
    },
    {
      key: 'submission_date',
      label: 'Tanggal',
      render: (value, row) => formatDate(value || row.created_at),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (_, row) => (
        <div className="flex justify-end">
          <Button size="xs" variant="ghost" icon={Eye} onClick={() => navigate(`/applications/${row.id}`)}>
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isOwnView ? 'Permohonan Bantuan Saya' : 'Permohonan Bantuan'}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {user?.role === 'pengawas'
              ? 'Pantau seluruh permohonan bantuan secara read-only untuk memastikan proses berjalan adil dan akuntabel.'
              : isOwnView
                ? 'Lihat status permohonan bantuan yang Anda ajukan.'
                : 'Daftar permohonan bantuan untuk verifikasi, review, dan pemantauan.'}
          </p>
        </div>
        {canCreate && (
          <Button icon={Plus} onClick={() => navigate('/applications/new')}>
            Buat Permohonan
          </Button>
        )}
      </div>

      {user?.role === 'pengawas' && (
        <Alert type="info" title="Akses Pengawas">
          Daftar ini hanya untuk pemantauan. Semua aksi operasional tetap dilakukan oleh admin berwenang.
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
            onPageChange={(page) => fetchApplications(page, search)}
            onSearch={(searchTerm) => {
              setSearch(searchTerm);
              fetchApplications(1, searchTerm);
            }}
            searchPlaceholder="Cari nomor permohonan, nama KK, atau program..."
            emptyMessage="Belum ada permohonan bantuan yang ditemukan."
          />
        </div>
      </Card>
    </div>
  );
};

export default ApplicationList;
