import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileCheck2, Search, Send, UserCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import decisionService from '../../services/decisionService';
import { clampText, FORM_LIMITS } from '../../utils/formLimits';
import { formatCurrency } from '../../utils/formatters';

const EligibilityReportList = () => {
  const navigate = useNavigate();
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
        limit: 100,
      });
      const fetchedRecords = response.data.data?.records || [];
      const keyword = search.trim().toLowerCase();
      setRecords(
        keyword
          ? fetchedRecords.filter((record) =>
              [
                record.application?.application_no,
                record.application?.household?.nama_kepala_keluarga,
                record.approved_note,
                record.decidedByUser?.name,
              ]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword))
            )
          : fetchedRecords
      );
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
            Tinjau keputusan staff yang sudah disetujui dan laporkan ke admin utama bila Anda menemukan kejanggalan.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <UserCheck className="h-4 w-4" />
          {meta?.total || records.length} keputusan siap ditinjau
        </div>
      </div>

      <Alert type="info" title="Mode Pengawas">
        Halaman ini bersifat read-only. Jika ada data keluarga, nominal bantuan, atau catatan staff yang terasa janggal, gunakan tombol laporan untuk meneruskannya ke admin utama.
      </Alert>

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
              onChange={(e) => setSearch(clampText(e.target.value, FORM_LIMITS.search))}
              maxLength={FORM_LIMITS.search}
              placeholder="Cari no. permohonan, keluarga, atau catatan staff..."
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
                <th className="px-5 py-3">Catatan Staff</th>
                <th className="px-5 py-3">Skor / Prioritas</th>
                <th className="px-5 py-3">Nominal</th>
                <th className="px-5 py-3">Diputus Staff</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 text-surface-700 dark:divide-surface-800/60 dark:text-surface-300">
              {records.map((record) => {
                const latestScore = record.application?.scoringResults?.[0];
                return (
                  <tr key={record.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                    <td className="px-5 py-4 font-semibold text-surface-900 dark:text-white">
                      {record.application?.application_no || '-'}
                    </td>
                    <td className="px-5 py-4">{record.application?.household?.nama_kepala_keluarga || '-'}</td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="line-clamp-2">{record.approved_note || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <FileCheck2 className="h-3.5 w-3.5" />
                          {latestScore?.priority_level || 'Belum ada prioritas'}
                        </div>
                        <p className="text-xs text-surface-500">
                          Total skor: {latestScore?.total_score || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        {formatCurrency(record.approved_amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">{record.decidedByUser?.name || '-'}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="xs"
                        icon={Send}
                        onClick={() => navigate(`/oversight-reports/create?decisionId=${record.id}`)}
                      >
                        Laporkan
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
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
