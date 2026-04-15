import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { PageLoader } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import auditService from '../../services/auditService';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await auditService.getAll();
      // Handle both flat array (old format) and paginated (new format)
      if (data.data?.records) {
        setLogs(data.data.records);
      } else if (Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('Anda tidak memiliki izin untuk mengakses audit log.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Waktu',
      accessor: (row) => formatDateTime(row.created_at),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(row.action)}`}>
          {row.action?.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Entitas',
      accessor: (row) => `${row.entity_type} (#${row.entity_id})`,
    },
    {
      header: 'User / Peran',
      accessor: (row) => row.user ? `${row.user.name} (${row.user.role})` : 'System',
    },
    {
      header: 'Alasan / Detail',
      accessor: (row) => row.reason || '-',
    },
  ];

  const getActionColor = (action) => {
    if (!action) return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400';
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'approve': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reject': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'distribute': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400';
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {user?.role === 'pengawas'
            ? 'Jejak aktivitas kritikal untuk memastikan proses bantuan sosial tetap transparan dan akuntabel.'
            : 'Laporan transparansi aktivitas kritikal dalam sistem BantuTepat'}
        </p>
      </div>

      {error ? (
        <Alert type="error" title="Error">{error}</Alert>
      ) : (
        <Card>
          <div className="p-0">
            <DataTable
              columns={columns}
              data={logs}
              emptyMessage="Belum ada catatan aktivitas sistem"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuditLogList;
