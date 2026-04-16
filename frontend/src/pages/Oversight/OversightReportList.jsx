import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, FileSearch, Search, Send } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import complaintService from '../../services/complaintService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { COMPLAINT_STATUS, COMPLAINT_TYPE } from '../../utils/constants';
import { capitalizeWords, formatDateTime } from '../../utils/formatters';
import { clampText, FORM_LIMITS } from '../../utils/formLimits';

const OVERSIGHT_PREFIX = '[Laporan Pengawas:';

const formatOversightDescription = (description) => {
  if (!description) return '-';
  return description.replace(/^\[Laporan Pengawas:[^\]]+\]\s*/i, '');
};

const OversightReportList = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchReports = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await complaintService.getMine();
      const records = response.data.data || [];
      const ownOversightReports = records.filter((record) =>
        record.description?.startsWith(OVERSIGHT_PREFIX)
      );
      const keyword = searchTerm.trim().toLowerCase();
      const filtered = keyword
        ? ownOversightReports.filter((record) =>
            [
              record.description,
              record.application?.application_no,
              record.household?.nama_kepala_keluarga,
              record.complaint_type,
            ]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(keyword))
          )
        : ownOversightReports;
      setReports(filtered);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan pengawasan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'pengawas') {
      fetchReports();
    }
  }, [user?.role]);

  const handleSearchChange = (event) => {
    const nextValue = clampText(event.target.value, FORM_LIMITS.search);
    setSearch(nextValue);
    fetchReports(nextValue);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Laporan Pengawasan</h1>
          <p className="mt-1 text-sm text-surface-500">
            Catat kejanggalan yang ditemukan saat memeriksa hasil kelayakan staff dan teruskan ke admin utama.
          </p>
        </div>
        <Button icon={Send} onClick={() => navigate('/oversight-reports/create')}>
          Buat Laporan
        </Button>
      </div>

      <Alert type="info" title="Alur Pengawasan">
        Laporan yang Anda kirim akan masuk ke antrean admin utama melalui modul pengaduan internal, lengkap dengan jejak waktu dan akun pelapor.
      </Alert>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-md">
          <Input
            icon={Search}
            placeholder="Cari no. permohonan, keluarga, atau isi laporan..."
            value={search}
            onChange={handleSearchChange}
            maxLength={FORM_LIMITS.search}
          />
        </div>
      </Card>

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card>
          <p className="text-sm text-surface-500">Memuat laporan pengawasan...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="py-12 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Belum ada laporan pengawasan</h2>
          <p className="mt-1 text-sm text-surface-500">
            Gunakan tombol di atas saat Anda menemukan kejanggalan yang perlu ditindaklanjuti admin utama.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge statusMap={COMPLAINT_STATUS} value={report.status} />
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">
                      {COMPLAINT_TYPE[report.complaint_type]?.label || capitalizeWords(report.complaint_type)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      {report.application?.application_no || 'Tanpa nomor permohonan'}
                    </p>
                    <p className="text-sm text-surface-500">
                      {report.household?.nama_kepala_keluarga || 'Kepala keluarga tidak tersedia'}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                    {formatOversightDescription(report.description)}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-surface-500 lg:min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(report.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-4 w-4" />
                    {report.application?.aidType?.name || 'Jenis bantuan belum tercatat'}
                  </div>
                  {report.resolution_note && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      <span className="font-semibold">Catatan admin:</span> {report.resolution_note}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OversightReportList;
