import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, FileSearch, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import complaintService from '../../services/complaintService';
import decisionService from '../../services/decisionService';
import { clampText } from '../../utils/formLimits';
import { formatCurrency } from '../../utils/formatters';

const DESCRIPTION_LIMIT = 2000;

const OVERSIGHT_GROUPS = {
  application: {
    label: 'Kelayakan & Keputusan',
    helper: 'Gunakan untuk data keluarga, alasan kelayakan, prioritas, atau nominal bantuan yang janggal.',
    categories: [
      { value: 'data_tidak_sinkron', label: 'Data keluarga tidak sinkron' },
      { value: 'alasan_tidak_memadai', label: 'Catatan staff belum memadai' },
      { value: 'prioritas_tidak_sesuai', label: 'Prioritas skoring tidak sesuai' },
      { value: 'nominal_tidak_wajar', label: 'Nominal / jenis bantuan tidak wajar' },
      { value: 'lainnya', label: 'Kejanggalan kelayakan lainnya' },
    ],
  },
  distribution: {
    label: 'Distribusi Bantuan',
    helper: 'Gunakan bila temuan pengawas berkaitan dengan kesiapan atau rencana distribusi bantuan.',
    categories: [
      { value: 'jadwal_tidak_konsisten', label: 'Jadwal distribusi tidak konsisten' },
      { value: 'penerima_tidak_tepat', label: 'Penerima berpotensi tidak tepat' },
      { value: 'bukti_belum_memadai', label: 'Bukti distribusi belum memadai' },
      { value: 'lainnya', label: 'Kejanggalan distribusi lainnya' },
    ],
  },
  general: {
    label: 'Audit Umum',
    helper: 'Gunakan untuk temuan lintas modul yang perlu perhatian admin utama.',
    categories: [
      { value: 'indikasi_duplikasi', label: 'Indikasi duplikasi / data ganda' },
      { value: 'proses_tidak_transparan', label: 'Proses tidak transparan' },
      { value: 'temuan_lapangan', label: 'Temuan lapangan lain' },
      { value: 'lainnya', label: 'Temuan umum lainnya' },
    ],
  },
};

const OversightReportCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    decision_id: searchParams.get('decisionId') || '',
    complaint_type: 'application',
    issue_category: 'data_tidak_sinkron',
    description: '',
  });

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await decisionService.getAll({ decision_status: 'approved', limit: 100 });
        setDecisions(response.data.data?.records || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat daftar laporan kelayakan staff.');
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, []);

  const selectedDecision = decisions.find(
    (decision) => String(decision.id) === String(formData.decision_id)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'complaint_type') {
      const defaultCategory = OVERSIGHT_GROUPS[value]?.categories?.[0]?.value || 'lainnya';
      setFormData((prev) => ({ ...prev, complaint_type: value, issue_category: defaultCategory }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'description' ? clampText(value, DESCRIPTION_LIMIT) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedDecision?.application?.household?.id || !selectedDecision?.application?.id) {
      toast.error('Pilih laporan kelayakan staff yang valid sebelum mengirim laporan.');
      return;
    }

    if (formData.description.trim().length < 10) {
      toast.error('Deskripsi laporan minimal 10 karakter.');
      return;
    }

    const group = OVERSIGHT_GROUPS[formData.complaint_type];
    const category = group?.categories.find((item) => item.value === formData.issue_category);
    const composedDescription = `[Laporan Pengawas: ${category?.label || 'Temuan'}] ${formData.description.trim()}`;

    try {
      setSubmitting(true);
      await complaintService.create({
        household_id: selectedDecision.application.household.id,
        application_id: selectedDecision.application.id,
        complaint_type: formData.complaint_type,
        description: composedDescription,
      });
      toast.success('Laporan pengawasan berhasil dikirim ke admin utama.');
      navigate('/oversight-reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim laporan pengawasan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Buat Laporan Pengawasan</h1>
        <p className="mt-1 text-sm text-surface-500">
          Laporkan temuan atau kejanggalan pada hasil kelayakan staff agar admin utama bisa meninjau ulang.
        </p>
      </div>

      <Alert type="warning" title="Pastikan laporan spesifik">
        Hubungkan laporan ke satu permohonan yang relevan agar admin utama bisa langsung menelusuri jejak keputusan staff, dokumen, dan data keluarga terkait.
      </Alert>

      <Card className="p-6 md:p-8">
        {loading ? (
          <p className="text-sm text-surface-500">Memuat data laporan kelayakan staff...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert type="error" title="Error">
                {error}
              </Alert>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Pilih laporan kelayakan staff
              </label>
              <select
                name="decision_id"
                value={formData.decision_id}
                onChange={handleChange}
                className="w-full rounded-lg border-surface-300 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
                required
              >
                <option value="">Pilih permohonan yang ingin dilaporkan</option>
                {decisions.map((decision) => (
                  <option key={decision.id} value={decision.id}>
                    {decision.application?.application_no || 'Tanpa nomor'} - {decision.application?.household?.nama_kepala_keluarga || 'Tanpa nama'}
                  </option>
                ))}
              </select>
            </div>

            {selectedDecision && (
              <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
                  <FileSearch className="h-4 w-4 text-primary-500" />
                  Ringkasan keputusan staff
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    <span className="font-medium">No. permohonan:</span> {selectedDecision.application?.application_no || '-'}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    <span className="font-medium">Kepala keluarga:</span> {selectedDecision.application?.household?.nama_kepala_keluarga || '-'}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    <span className="font-medium">Jenis bantuan:</span> {selectedDecision.approvedAidType?.name || selectedDecision.application?.aidType?.name || '-'}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    <span className="font-medium">Nominal:</span> {formatCurrency(selectedDecision.approved_amount)}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-300 md:col-span-2">
                    <span className="font-medium">Catatan staff:</span> {selectedDecision.approved_note || '-'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Kelompok masalah
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {Object.entries(OVERSIGHT_GROUPS).map(([value, group]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'complaint_type', value } })}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      formData.complaint_type === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800'
                    }`}
                  >
                    <p className="font-semibold">{group.label}</p>
                    <p className="mt-1 text-xs opacity-80">{group.helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Jenis kejanggalan
              </label>
              <select
                name="issue_category"
                value={formData.issue_category}
                onChange={handleChange}
                className="w-full rounded-lg border-surface-300 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
              >
                {OVERSIGHT_GROUPS[formData.complaint_type].categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Detail temuan pengawas
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
                maxLength={DESCRIPTION_LIMIT}
                className="w-full rounded-lg border-surface-300 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white"
                placeholder="Jelaskan letak kejanggalan, data yang tidak cocok, dan tindak lanjut yang Anda sarankan..."
              />
              <p className="mt-1 text-right text-xs text-surface-500">
                {formData.description.length}/{DESCRIPTION_LIMIT}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p>
                  Laporan ini bersifat internal. Admin utama akan meninjau ulang kasus yang Anda kirim dan keputusan akhir tetap dicatat melalui jejak audit sistem.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/oversight-reports')}>
                Batal
              </Button>
              <Button type="submit" icon={Send} iconPosition="right" loading={submitting}>
                Kirim ke Admin Utama
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default OversightReportCreate;
