import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import { PageLoader } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/audit-logs');
      setLogs(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat audit logs');
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
          {row.action.toUpperCase()}
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
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400';
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Laporan transparansi aktivitas kritikal dalam sistem BantuTepat
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
