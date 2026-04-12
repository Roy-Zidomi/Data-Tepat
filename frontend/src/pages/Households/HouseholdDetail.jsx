import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Home, MapPin } from 'lucide-react';
import householdService from '../../services/householdService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS, HOUSEHOLD_STATUS } from '../../utils/constants';
import { capitalizeWords, formatCurrency, formatDate, maskNIK } from '../../utils/formatters';

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-surface-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-surface-900 dark:text-surface-100">{value || '-'}</p>
  </div>
);

const HouseholdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await householdService.getById(id);
        setHousehold(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat detail rumah tangga.');
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [id]);

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" title="Error">{error}</Alert>;
  if (!household) return <Alert type="warning" title="Data tidak ditemukan">Rumah tangga tidak tersedia.</Alert>;

  const latestApplications = household.aidApplications || [];
  const documents = household.documents || [];
  const familyMembers = household.familyMembers || [];
  const canUploadDocuments = ['admin_main', 'admin_staff', 'relawan', 'warga'].includes(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/households')} className="-ml-4">
        Kembali ke Data Warga
      </Button>

      <div className="flex flex-col gap-4 border-b border-surface-200 pb-6 dark:border-surface-700 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              {household.nama_kepala_keluarga}
            </h1>
            <StatusBadge statusMap={HOUSEHOLD_STATUS} value={household.status_data} />
          </div>
          <p className="mt-2 text-sm text-surface-500">
            KK {household.nomor_kk} • Dibuat {formatDate(household.created_at)}
          </p>
        </div>
        {user?.role === 'pengawas' && (
          <Alert type="info" title="Mode Pengawasan" className="max-w-md">
            Halaman ini read-only untuk pemantauan integritas data warga.
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <Card.Header>
            <Card.Title>Profil Rumah Tangga</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Nama Kepala Keluarga" value={household.nama_kepala_keluarga} />
            <InfoRow label="NIK Kepala Keluarga" value={maskNIK(household.nik_kepala_keluarga)} />
            <InfoRow label="Nomor KK" value={household.nomor_kk} />
            <InfoRow label="Telepon" value={household.phone || '-'} />
            <InfoRow label="Sumber Registrasi" value={capitalizeWords(household.registration_source)} />
            <InfoRow label="Didaftarkan Oleh" value={capitalizeWords(household.registered_by_role)} />
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-surface-500">Alamat</p>
              <div className="mt-1 flex items-start gap-2 text-sm font-medium text-surface-900 dark:text-surface-100">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-surface-400" />
                <span>
                  {household.alamat || '-'}
                  {household.region ? `, ${household.region.village}, ${household.region.district}, ${household.region.city_regency}` : ''}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Ringkasan Monitoring</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">Anggota Keluarga</p>
              <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-200">{familyMembers.length}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
              <p className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-300">Dokumen</p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-200">{documents.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Permohonan Bantuan</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{latestApplications.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Kondisi Sosial Ekonomi</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Pendapatan Bulanan" value={formatCurrency(household.economicCondition?.monthly_income_total)} />
            <InfoRow label="Pengeluaran Dasar" value={formatCurrency(household.economicCondition?.monthly_basic_expense)} />
            <InfoRow label="Jumlah Tanggungan" value={household.economicCondition?.dependents_count?.toString() || '-'} />
            <InfoRow label="Pekerjaan Kepala Keluarga" value={capitalizeWords(household.economicCondition?.head_job_status)} />
            <InfoRow label="Status Kepemilikan Rumah" value={capitalizeWords(household.housingCondition?.home_ownership_status)} />
            <InfoRow label="Kondisi Rumah" value={capitalizeWords(household.housingCondition?.house_condition)} />
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Kerentanan & Aset</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Ada Lansia" value={household.vulnerability?.has_elderly_member ? 'Ya' : 'Tidak'} />
            <InfoRow label="Ada Disabilitas" value={household.vulnerability?.has_disabled_member ? 'Ya' : 'Tidak'} />
            <InfoRow label="Korban Bencana" value={household.vulnerability?.is_disaster_victim ? 'Ya' : 'Tidak'} />
            <InfoRow label="PHK Baru-baru Ini" value={household.vulnerability?.lost_job_recently ? 'Ya' : 'Tidak'} />
            <InfoRow label="Punya Motor" value={household.householdAsset?.has_motorcycle ? 'Ya' : 'Tidak'} />
            <InfoRow label="Punya Mobil" value={household.householdAsset?.has_car ? 'Ya' : 'Tidak'} />
          </div>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Anggota Keluarga</Card.Title>
        </Card.Header>
        <div className="space-y-3">
          {familyMembers.length === 0 ? (
            <p className="text-sm text-surface-500">Belum ada data anggota keluarga.</p>
          ) : (
            familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-2 rounded-xl border border-surface-200 p-4 dark:border-surface-700 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-100">{member.name}</p>
                  <p className="text-sm text-surface-500">
                    {capitalizeWords(member.relationship_to_head)} • {capitalizeWords(member.occupation)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-surface-500">
                  <span className="rounded-full bg-surface-100 px-2 py-1 dark:bg-surface-700">
                    NIK {maskNIK(member.nik)}
                  </span>
                  <span className="rounded-full bg-surface-100 px-2 py-1 dark:bg-surface-700">
                    Usia {member.age || '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Dokumen</Card.Title>
          </Card.Header>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-surface-500">Belum ada dokumen yang diunggah.</p>
            ) : (
              documents.map((document) => (
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
          {canUploadDocuments && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate(`/households/${household.id}/documents`)}>
                Kelola Dokumen
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Permohonan Bantuan Terkait</Card.Title>
          </Card.Header>
          <div className="space-y-3">
            {latestApplications.length === 0 ? (
              <p className="text-sm text-surface-500">Belum ada permohonan bantuan untuk rumah tangga ini.</p>
            ) : (
              latestApplications.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => navigate(`/applications/${application.id}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-surface-200 p-4 text-left transition-colors hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-800/50"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-surface-400" />
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-100">{application.application_no}</p>
                      <p className="text-xs text-surface-500">{application.aidType?.name || '-'}</p>
                    </div>
                  </div>
                  <StatusBadge statusMap={APPLICATION_STATUS} value={application.status} />
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdDetail;
