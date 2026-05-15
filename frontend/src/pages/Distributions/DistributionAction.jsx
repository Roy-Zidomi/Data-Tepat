import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Truck, CheckCircle, Upload, Clock, ArrowRight,
  Camera, FileText, AlertTriangle, Package, Send,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import distributionService from '../../services/distributionService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const statusConfig = {
  recorded: { label: 'Tercatat', color: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300', icon: Package, step: 1 },
  allocated: { label: 'Dialokasikan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle, step: 2 },
  sent: { label: 'Dikirim', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Send, step: 3 },
  delivered: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Truck, step: 4 },
  completed: { label: 'Selesai', color: 'bg-emerald-600 text-white', icon: CheckCircle, step: 5 },
  failed: { label: 'Gagal', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle, step: 0 },
};

const steps = ['recorded', 'allocated', 'sent', 'delivered', 'completed'];

// Mirrors backend DISTRIBUTION_TRANSITIONS
const TRANSITIONS = {
  recorded: [{ to: 'allocated', label: 'Alokasikan', roles: ['admin_main', 'admin_staff'] }],
  allocated: [
    { to: 'sent', label: 'Kirim', roles: ['admin_main', 'admin_staff'] },
    { to: 'failed', label: 'Gagalkan', roles: ['admin_main', 'admin_staff'], danger: true },
  ],
  sent: [
    { to: 'delivered', label: 'Tandai Diterima', roles: ['admin_main', 'admin_staff', 'relawan'] },
    { to: 'failed', label: 'Gagalkan', roles: ['admin_main', 'admin_staff'], danger: true },
  ],
  delivered: [{ to: 'completed', label: 'Selesaikan', roles: ['admin_main', 'admin_staff'] }],
};

const proofTypes = [
  { value: 'photo', label: 'Foto' },
  { value: 'document', label: 'Dokumen' },
  { value: 'signature', label: 'Tanda Tangan' },
];

const DistributionAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [dist, setDist] = useState(null);
  const [error, setError] = useState('');

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Proof upload form
  const [proofType, setProofType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await distributionService.getById(id);
      setDist(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail distribusi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const availableTransitions = dist
    ? (TRANSITIONS[dist.status] || []).filter((t) => t.roles.includes(user?.role))
    : [];

  const handleStatusUpdate = async () => {
    if (!newStatus) { toast.error('Pilih status tujuan.'); return; }
    try {
      setUpdatingStatus(true);
      await distributionService.updateStatus(id, { status: newStatus, reason: reason || undefined });
      toast.success('Status distribusi berhasil diperbarui.');
      setNewStatus('');
      setReason('');
      await fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUploadProof = async () => {
    if (!file) { toast.error('Pilih file terlebih dahulu.'); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('proof_type', proofType);
      if (caption) formData.append('caption', caption);
      await distributionService.uploadProof(id, formData);
      toast.success('Bukti distribusi berhasil diunggah.');
      setFile(null);
      setCaption('');
      await fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah bukti.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/distributions')} className="-ml-4">Kembali</Button>
        <Alert type="error" title="Error">{error}</Alert>
      </div>
    );
  }

  const scfg = statusConfig[dist.status] || statusConfig.recorded;
  const currentStep = scfg.step;
  const StatusIcon = scfg.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/distributions')} className="-ml-4">Kembali</Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Proses Distribusi</h1>
        <p className="mt-1 text-sm text-surface-500">Update status dan unggah bukti penyaluran bantuan</p>
      </div>

      {/* Distribution Info Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">{dist.recipient_name}</h2>
            <p className="text-sm text-surface-500 mt-0.5">
              {dist.distribution_code} &bull; {dist.aidType?.name || '-'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div>
                <span className="text-surface-400 block text-xs">Kepala Keluarga</span>
                <span className="font-medium dark:text-white">{dist.decision?.application?.household?.nama_kepala_keluarga || '-'}</span>
              </div>
              <div>
                <span className="text-surface-400 block text-xs">No. Permohonan</span>
                <span className="font-medium dark:text-white">{dist.decision?.application?.application_no || '-'}</span>
              </div>
              <div>
                <span className="text-surface-400 block text-xs">Tanggal Rencana</span>
                <span className="font-medium dark:text-white">{dist.planned_date ? new Date(dist.planned_date).toLocaleDateString('id-ID') : '-'}</span>
              </div>
              <div>
                <span className="text-surface-400 block text-xs">Jumlah</span>
                <span className="font-medium dark:text-white">{dist.quantity || '-'} {dist.unit || ''}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${scfg.color}`}>
            {scfg.label}
          </span>
        </div>

        {/* Progress Tracker */}
        {dist.status !== 'failed' && (
          <div className="mt-6 pt-5 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-1">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isActive ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                    } ${isCurrent ? 'ring-2 ring-primary-300 ring-offset-2 dark:ring-offset-surface-800' : ''}`}>
                      {isActive ? '✓' : stepNum}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded-full ${isActive ? 'bg-primary-400' : 'bg-surface-200 dark:bg-surface-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs text-surface-400 mt-2">
              {steps.map((step) => (
                <span key={step} className={`flex-1 text-center ${(statusConfig[step]?.step || 0) <= currentStep ? 'text-primary-600 font-medium' : ''}`}>
                  {statusConfig[step]?.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Update Status Section */}
      {availableTransitions.length > 0 && (
        <Card>
          <Card.Header className="mb-0">
            <Card.Title>Update Status Distribusi</Card.Title>
          </Card.Header>
          <p className="text-sm text-surface-500 mb-4">
            Pilih status selanjutnya sesuai alur proses penyaluran.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {availableTransitions.map((t) => (
              <button
                key={t.to}
                onClick={() => setNewStatus(t.to)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  newStatus === t.to
                    ? t.danger
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className={`w-4 h-4 ${t.danger ? 'text-red-500' : 'text-primary-500'}`} />
                  <span className={`font-semibold text-sm ${t.danger ? 'text-red-700 dark:text-red-400' : 'dark:text-white'}`}>
                    {t.label}
                  </span>
                </div>
                <span className={`text-xs mt-1 block ${statusConfig[t.to]?.color} px-2 py-0.5 rounded-full inline-block mt-2`}>
                  → {statusConfig[t.to]?.label}
                </span>
              </button>
            ))}
          </div>

          {newStatus && (
            <div className="space-y-3 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan / Alasan (opsional)</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="Tambahkan catatan perubahan status..."
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:border-primary-500 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  icon={CheckCircle}
                  variant={availableTransitions.find((t) => t.to === newStatus)?.danger ? 'danger' : 'primary'}
                  loading={updatingStatus}
                  onClick={handleStatusUpdate}
                >
                  Konfirmasi → {statusConfig[newStatus]?.label}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Completed / Failed info */}
      {dist.status === 'completed' && (
        <Alert type="success" title="Distribusi Selesai">
          Distribusi ini telah selesai pada {dist.distributed_date ? new Date(dist.distributed_date).toLocaleDateString('id-ID') : '-'}.
        </Alert>
      )}
      {dist.status === 'failed' && (
        <Alert type="error" title="Distribusi Gagal">
          Distribusi ini ditandai gagal. Hubungi admin untuk informasi lebih lanjut.
        </Alert>
      )}

      {/* Upload Proof Section */}
      {['admin_main', 'admin_staff', 'relawan'].includes(user?.role) && (
        <Card>
          <Card.Header className="mb-0">
            <Card.Title>Unggah Bukti Distribusi (BAST)</Card.Title>
          </Card.Header>
          <p className="text-sm text-surface-500 mb-4">
            Upload foto penerima, dokumen tanda terima, atau bukti lainnya.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Bukti</label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value)}
                  className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:border-primary-500 focus:ring-primary-500 dark:text-white"
                >
                  {proofTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Keterangan (opsional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={255}
                placeholder="Contoh: Foto penerima saat menerima bantuan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">File</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400 cursor-pointer"
                />
              </div>
              {file && (
                <p className="mt-1 text-xs text-surface-500">
                  File dipilih: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button icon={Upload} loading={uploading} onClick={handleUploadProof} disabled={!file}>
                Unggah Bukti
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Proofs */}
      {dist.proofs && dist.proofs.length > 0 && (
        <Card>
          <Card.Header className="mb-0">
            <Card.Title>Bukti yang Sudah Diunggah ({dist.proofs.length})</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {dist.proofs.map((proof) => (
              <div key={proof.id} className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden group">
                <div className="aspect-[4/3] bg-surface-100 dark:bg-surface-900 flex items-center justify-center overflow-hidden">
                  {proof.proof_type === 'photo' && proof.file_url ? (
                    <img src={proof.file_url} alt={proof.caption || 'Bukti'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-surface-300" />
                      <span className="text-xs text-surface-400 uppercase font-bold">{proof.proof_type}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {proof.caption && <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2">{proof.caption}</p>}
                  <p className="text-xs text-surface-400 mt-1">
                    {new Date(proof.uploaded_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status History */}
      {dist.statusHistories && dist.statusHistories.length > 0 && (
        <Card>
          <Card.Header className="mb-0">
            <Card.Title>Riwayat Status</Card.Title>
          </Card.Header>
          <div className="relative mt-4">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-200 dark:bg-surface-700" />
            <div className="space-y-4">
              {dist.statusHistories.map((entry, idx) => (
                <div key={entry.id} className="relative flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white dark:border-surface-800 ${
                    idx === 0 ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.old_status && (
                        <>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig[entry.old_status]?.color || 'bg-surface-200 text-surface-600'}`}>
                            {statusConfig[entry.old_status]?.label || entry.old_status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-surface-400" />
                        </>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig[entry.new_status]?.color || 'bg-surface-200 text-surface-600'}`}>
                        {statusConfig[entry.new_status]?.label || entry.new_status}
                      </span>
                    </div>
                    {entry.reason && <p className="text-xs text-surface-500 mt-1">{entry.reason}</p>}
                    <p className="text-xs text-surface-400 mt-1">
                      {new Date(entry.changed_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DistributionAction;
