import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, FileText, Home, MapPin, Shield } from 'lucide-react';
import applicationService from '../../services/applicationService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS, DECISION_STATUS, PRIORITY_LEVEL } from '../../utils/constants';
import { capitalizeWords, formatCurrency, formatDate, formatDateTime, maskNIK } from '../../utils/formatters';

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-surface-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-surface-900 dark:text-surface-100">{value || '-'}</p>
  </div>
);

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await applicationService.getById(id);
        setApplication(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat detail permohonan.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" title="Error">{error}</Alert>;
  if (!application) return <Alert type="warning" title="Data tidak ditemukan">Permohonan bantuan tidak tersedia.</Alert>;

  const latestScore = application.scoringResults?.[0];
  const household = application.household || {};
  const decision = application.beneficiaryDecision;
  const surveys = application.surveys || [];
  const statusHistories = application.statusHistories || [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/applications')} className="-ml-4">
        Kembali ke Permohonan
      </Button>

      <div className="flex flex-col gap-4 border-b border-surface-200 pb-6 dark:border-surface-700 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{application.application_no}</h1>
            <StatusBadge statusMap={APPLICATION_STATUS} value={application.status} />
            {decision?.decision_status && (
              <StatusBadge statusMap={DECISION_STATUS} value={decision.decision_status} />
            )}
          </div>
          <p className="mt-2 text-sm text-surface-500">
            {household.nama_kepala_keluarga || '-'} • {application.aidType?.name || '-'} • Diajukan {formatDate(application.submission_date || application.created_at)}
          </p>
        </div>
        {user?.role === 'pengawas' && (
          <Alert type="info" title="Mode Pengawasan" className="max-w-md">
            Detail ini hanya untuk peninjauan status, skor, dan jejak proses permohonan.
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Profil Rumah Tangga</Card.Title>
            </Card.Header>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailRow label="Nama Kepala Keluarga" value={household.nama_kepala_keluarga} />
              <DetailRow label="Nomor KK" value={household.nomor_kk} />
              <DetailRow label="NIK Kepala Keluarga" value={maskNIK(household.nik_kepala_keluarga)} />
              <DetailRow label="Nomor Telepon" value={household.phone} />
              <div className="md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-surface-500">Alamat</p>
                <div className="mt-1 flex items-start gap-2 text-sm font-medium text-surface-900 dark:text-surface-100">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-surface-400" />
                  <span>{household.alamat || '-'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Dokumen & Data Pendukung</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              {(household.documents || []).length === 0 ? (
                <p className="text-sm text-surface-500">Belum ada dokumen yang tercatat.</p>
              ) : (
                household.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-700">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-surface-400" />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-surface-100">
                          {capitalizeWords(document.document_type)}
                        </p>
                        <p className="text-xs text-surface-500">{document.original_filename || document.file_url}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">
                      {capitalizeWords(document.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Hasil Survei & Riwayat Status</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              {surveys.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-surface-200 p-4 dark:border-surface-700">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">Ringkasan Survei</p>
                  {surveys.map((survey) => (
                    <div key={survey.id} className="rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
                      <p className="font-medium text-surface-900 dark:text-surface-100">
                        Survei {formatDate(survey.survey_date)}
                      </p>
                      <p className="mt-1 text-sm text-surface-500">{survey.summary || 'Tidak ada ringkasan survei.'}</p>
                      <p className="mt-2 text-xs text-surface-500">
                        Status {capitalizeWords(survey.status)} • Rekomendasi {capitalizeWords(survey.recommendation)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {statusHistories.length === 0 ? (
                  <p className="text-sm text-surface-500">Belum ada riwayat status permohonan.</p>
                ) : (
                  statusHistories.map((history) => (
                    <div key={history.id} className="rounded-xl border border-surface-200 p-4 dark:border-surface-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-surface-500">
                          {capitalizeWords(history.old_status) || 'Mulai'}
                        </span>
                        <span className="text-xs text-surface-400">→</span>
                        <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                          {capitalizeWords(history.new_status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-surface-500">{history.reason || 'Tanpa catatan.'}</p>
                      <p className="mt-2 text-xs text-surface-400">{formatDateTime(history.changed_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <div className="flex items-center gap-2 text-sm font-medium opacity-90">
              <Shield className="h-4 w-4" />
              Rekomendasi Prioritas
            </div>
            <div className="py-6 text-center">
              <p className="text-5xl font-black">{latestScore?.total_score ?? '-'}</p>
              <div className="mt-3">
                {latestScore?.priority_level ? (
                  <StatusBadge statusMap={PRIORITY_LEVEL} value={latestScore.priority_level} />
                ) : (
                  <span className="text-sm opacity-80">Belum ada hasil scoring</span>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Keputusan & Kelayakan</Card.Title>
            </Card.Header>
            {decision ? (
              <div className="space-y-4">
                <StatusBadge statusMap={DECISION_STATUS} value={decision.decision_status} />
                <DetailRow label="Nominal / Keterangan Bantuan" value={decision.approved_amount || '-'} />
                <DetailRow label="Catatan Keputusan" value={decision.approved_note || '-'} />
              </div>
            ) : (
              <p className="text-sm text-surface-500">Belum ada keputusan final untuk permohonan ini.</p>
            )}
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Profil Keluarga Singkat</Card.Title>
            </Card.Header>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
                <Home className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {formatCurrency(household.economicCondition?.monthly_income_total)}
                  </p>
                  <p className="text-xs text-surface-500">Pendapatan bulanan</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 p-4 dark:bg-surface-900/50">
                <ClipboardList className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {(household.familyMembers || []).length} anggota keluarga
                  </p>
                  <p className="text-xs text-surface-500">Tercatat pada profil rumah tangga</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
