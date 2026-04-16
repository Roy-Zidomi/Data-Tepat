import { useEffect, useState } from 'react';
import { FileCheck2, Search, UserCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import decisionService from '../../services/decisionService';

const EligibilityReportList = () => {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await decisionService.getAll({
        decision_status: 'approved',
        reported_to_main: 'true',
        application_no: search || undefined,
        household_name: search || undefined,
        limit: 100,
      });
      setRecords(response.data.data?.records || []);
      setMeta(response.data.data?.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan kelayakan staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Laporan Kelayakan Staff</h1>
          <p className="text-sm text-surface-500 mt-1">
            Daftar warga yang telah difinalisasi staff dan dikirim ke antrean admin utama.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <UserCheck className="h-4 w-4" />
          {meta?.total || records.length} laporan siap proses
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReports();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-[220px] flex-1">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. permohonan / nama kepala keluarga..."
            />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? (
        <Alert type="error" title="Error">{error}</Alert>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-surface-800 dark:bg-surface-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-surface-500 dark:border-surface-800 dark:bg-surface-800/40 dark:text-surface-400">
              <tr>
                <th className="px-5 py-3">No Permohonan</th>
                <th className="px-5 py-3">Kepala Keluarga</th>
                <th className="px-5 py-3">Ringkasan Alasan</th>
                <th className="px-5 py-3">Bukti</th>
                <th className="px-5 py-3">Diputus Staff</th>
                <th className="px-5 py-3">Revisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 text-surface-700 dark:divide-surface-800/60 dark:text-surface-300">
              {records.map((record) => {
                const evidenceCount = Array.isArray(record.evidence_items) ? record.evidence_items.length : 0;
                return (
                  <tr key={record.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                    <td className="px-5 py-4 font-semibold text-surface-900 dark:text-white">
                      {record.application?.application_no || '-'}
                    </td>
                    <td className="px-5 py-4">{record.application?.household?.nama_kepala_keluarga || '-'}</td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="line-clamp-2">{record.reason_summary || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <FileCheck2 className="h-3.5 w-3.5" />
                        {evidenceCount} item
                      </span>
                    </td>
                    <td className="px-5 py-4">{record.decidedByUser?.name || '-'}</td>
                    <td className="px-5 py-4">v{record.latest_revision_no || 1}</td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Belum ada laporan kelayakan yang dikirim staff.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EligibilityReportList;
