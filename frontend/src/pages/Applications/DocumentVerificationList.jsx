import { useState, useEffect } from 'react';
import { FileSearch, Search, Eye, CheckCircle, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const verifyStatusConfig = {
  approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  revision_required: { label: 'Perlu Revisi', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertTriangle },
  pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
};

const docTypeLabels = {
  ktp: 'Kartu Tanda Penduduk',
  kk: 'Kartu Keluarga',
  sktm: 'Surat Ket. Tidak Mampu',
  foto_rumah: 'Foto Rumah',
  foto_lapangan: 'Foto Lapangan',
  bukti_penghasilan: 'Bukti Penghasilan',
};

const DocumentVerificationList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/documents', { params: { search, limit: 50 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dokumen');
    } finally { setLoading(false); }
  };

  const getStatus = (doc) => {
    const v = doc.latestVerification;
    if (!v) return 'pending';
    return v.status || 'pending';
  };

  const handleVerify = async (docId, status) => {
    try {
      setVerifyLoading(true);
      const note = status === 'rejected' ? prompt('Alasan penolakan:') : null;
      if (status === 'rejected' && !note) return;
      
      await api.patch(`/documents/${docId}/verify`, { status, note: note || '' });
      toast.success(`Dokumen berhasil di-${status === 'approved' ? 'verifikasi' : 'tolak'}`);
      setDetailModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memverifikasi dokumen');
    } finally { setVerifyLoading(false); }
  };

  if (loading) return <PageLoader />;

  const pending = data.filter(d => getStatus(d) === 'pending');
  const reviewed = data.filter(d => getStatus(d) !== 'pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Verifikasi Dokumen</h1>
        <p className="text-sm text-surface-500 mt-1">Review dan verifikasi kelengkapan dokumen permohonan bantuan</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-3 max-w-md">
          <div className="flex-1"><Input icon={Search} placeholder="Cari nama KK..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {/* Stats bar */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{pending.length} Menunggu Review</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{reviewed.length} Sudah Direview</span>
        </div>
      </div>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <>
          {/* Pending section */}
          {pending.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400">⏳ Menunggu Verifikasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pending.map((doc) => (
                  <DocCard key={doc.id} doc={doc} status="pending" onView={() => setDetailModal(doc)} />
                ))}
              </div>
            </>
          )}

          {/* Reviewed section */}
          {reviewed.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-surface-600 dark:text-surface-300 mt-6">✅ Sudah Direview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reviewed.map((doc) => (
                  <DocCard key={doc.id} doc={doc} status={getStatus(doc)} onView={() => setDetailModal(doc)} />
                ))}
              </div>
            </>
          )}

          {data.length === 0 && (
            <div className="text-center py-10 text-surface-500">
              <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada dokumen yang di-upload oleh warga.</p>
            </div>
          )}
        </>
      )}

      {/* Detail + Verify Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Review Dokumen" size="lg">
        {detailModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold text-sm dark:text-white mb-1">{detailModal.household?.nama_kepala_keluarga}</h3>
              <p className="text-xs text-surface-500">KK: {detailModal.household?.nomor_kk}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Jenis Dokumen</span>
                <span className="font-bold dark:text-white">{docTypeLabels[detailModal.document_type] || detailModal.document_type}</span>
              </div>
              <div><span className="text-surface-500 block text-xs">Nama File</span>
                <span className="font-medium dark:text-white">{detailModal.original_filename || '-'}</span>
              </div>
              <div><span className="text-surface-500 block text-xs">Diupload oleh</span>
                <span className="font-medium dark:text-white">{detailModal.uploadedByUser?.name || '-'}</span>
              </div>
              <div><span className="text-surface-500 block text-xs">Tanggal Upload</span>
                <span className="font-medium dark:text-white">{new Date(detailModal.uploaded_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {detailModal.file_url && (
              <div className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 text-center">
                <FileText className="w-10 h-10 mx-auto text-surface-400 mb-2" />
                <a href={detailModal.file_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm font-medium">
                  Lihat / Unduh Dokumen
                </a>
              </div>
            )}

            {detailModal.latestVerification && (
              <div className={`p-3 rounded-lg text-sm ${detailModal.latestVerification.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <span className="font-medium">Status:</span> {detailModal.latestVerification.status} oleh {detailModal.latestVerification.verifiedByUser?.name}
                {detailModal.latestVerification.verification_note && <p className="mt-1 opacity-80">{detailModal.latestVerification.verification_note}</p>}
              </div>
            )}

            {getStatus(detailModal) === 'pending' && (
              <div className="flex gap-3 justify-end pt-2 border-t border-surface-200 dark:border-surface-700">
                <Button variant="outline" className="border-red-500 text-red-600" icon={XCircle} onClick={() => handleVerify(detailModal.id, 'rejected')} loading={verifyLoading}>Tolak</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={CheckCircle} onClick={() => handleVerify(detailModal.id, 'approved')} loading={verifyLoading}>Verifikasi</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const DocCard = ({ doc, status, onView }) => {
  const cfg = verifyStatusConfig[status] || verifyStatusConfig.pending;
  const Icon = cfg.icon;
  return (
    <Card className={`hover:shadow-card-hover transition-all ${status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold dark:text-white">{doc.household?.nama_kepala_keluarga}</h3>
            <span className="text-xs text-surface-500">{docTypeLabels[doc.document_type] || doc.document_type}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
          <Icon className="w-3 h-3" />{cfg.label}
        </span>
      </div>
      <div className="text-xs text-surface-500 mb-3">
        Upload: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')} • {doc.original_filename || 'file'}
      </div>
      <Button size="xs" variant="ghost" icon={Eye} onClick={onView}>Review</Button>
    </Card>
  );
};

export default DocumentVerificationList;
