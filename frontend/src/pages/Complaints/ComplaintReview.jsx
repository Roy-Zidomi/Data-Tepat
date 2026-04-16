import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Home, MessageSquare, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import complaintService from '../../services/complaintService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { COMPLAINT_STATUS, COMPLAINT_TYPE } from '../../utils/constants';
import { capitalizeWords, formatDateTime } from '../../utils/formatters';

const ComplaintReview = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const isOwnView = user?.role === 'warga';
  const canResolve = user?.role === 'admin_main';

  const getComplaintTypeLabel = (type) => {
    return COMPLAINT_TYPE[type]?.label || capitalizeWords(type);
  };

  const fetchComplaints = async (searchTerm = search) => {
    try {
      setLoading(true);
      setError('');

      if (isOwnView) {
        const response = await complaintService.getMine();
        const records = response.data.data || [];
        const normalizedSearch = searchTerm.trim().toLowerCase();
        setData(
          normalizedSearch
            ? records.filter((record) =>
                [record.description, record.complaint_type, record.application?.application_no]
                  .filter(Boolean)
                  .some((value) => value.toLowerCase().includes(normalizedSearch))
              )
            : records
        );
        return;
      }

      const response = await complaintService.getAll({
        limit: 50,
        search: searchTerm,
      });
      setData(response.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data pengaduan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) {
      fetchComplaints();
    }
  }, [user?.role]);

  const handleResolve = async (complaintId) => {
    try {
      setResolvingId(complaintId);
      await complaintService.resolve(complaintId, {
        status: 'resolved',
        resolution_note: 'Ditandai selesai melalui halaman pengaduan.',
      });
      toast.success('Pengaduan berhasil ditandai selesai.');
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status pengaduan.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {isOwnView ? 'Pengaduan Saya' : 'Pengaduan'}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {user?.role === 'pengawas'
              ? 'Pantau pengaduan warga dan pastikan setiap laporan diproses secara akuntabel.'
              : isOwnView
                ? 'Lihat status pengaduan yang sudah Anda kirim.'
                : 'Analisis, tindak lanjuti, dan pantau pengaduan yang masuk ke sistem.'}
          </p>
        </div>
      </div>

      {user?.role === 'pengawas' && (
        <Alert type="info" title="Akses Pengawas">
          Pengawas hanya dapat memonitor isi, status, dan tindak lanjut pengaduan tanpa mengubah penyelesaiannya.
        </Alert>
      )}

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-md">
          <Input
            icon={Search}
            placeholder="Cari isi pengaduan, tipe, atau nomor permohonan..."
            value={search}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearch(nextValue);
              fetchComplaints(nextValue);
            }}
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
          <p className="text-sm text-surface-500">Memuat data pengaduan...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.map((complaint) => (
            <Card key={complaint.id}>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge statusMap={COMPLAINT_STATUS} value={complaint.status} />
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs font-medium text-surface-600 dark:bg-surface-700 dark:text-surface-300">
                      {getComplaintTypeLabel(complaint.complaint_type)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-surface-900 dark:text-surface-100">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-surface-500">
                    <div className="flex items-center gap-1.5">
                      <Home className="h-4 w-4" />
                      {complaint.household?.nama_kepala_keluarga || '-'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(complaint.created_at)}
                    </div>
                    {complaint.application?.application_no && (
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        {complaint.application.application_no}
                      </div>
                    )}
                  </div>

                  {complaint.resolution_note && (
                    <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      <span className="font-medium">Catatan penyelesaian:</span> {complaint.resolution_note}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col justify-center gap-2 border-t border-surface-200 pt-4 dark:border-surface-700 md:w-56 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  {canResolve && complaint.status !== 'resolved' && complaint.status !== 'rejected' ? (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(complaint.id)}
                      loading={resolvingId === complaint.id}
                    >
                      Tandai Selesai
                    </Button>
                  ) : (
                    <div className="text-sm text-surface-500">
                      {user?.role === 'pengawas'
                        ? 'Mode monitor saja'
                        : complaint.status === 'resolved' || complaint.status === 'rejected'
                          ? 'Kasus telah ditutup'
                          : 'Tidak ada aksi tersedia'}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {data.length === 0 && (
            <div className="py-10 text-center text-surface-500">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p>Belum ada pengaduan yang ditemukan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintReview;
