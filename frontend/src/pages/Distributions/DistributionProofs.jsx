import { useState, useEffect } from 'react';
import { Camera, Search, Eye, FileText, Image, Video } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const proofTypeConfig = {
  photo: { label: 'Foto', icon: Image, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  document: { label: 'Dokumen', icon: FileText, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  video: { label: 'Video', icon: Video, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  signature: { label: 'Tanda Tangan', icon: FileText, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

const DistributionProofs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [previewModal, setPreviewModal] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/distribution-proofs', { params: { search, limit: 50 } });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat bukti distribusi');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Bukti Distribusi</h1>
        <p className="text-sm text-surface-500 mt-1">Galeri foto dan dokumen bukti penyaluran bantuan (BAST)</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex gap-3 max-w-md">
          <div className="flex-1"><Input icon={Search} placeholder="Cari kode distribusi / nama penerima..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((item) => {
            const pcfg = proofTypeConfig[item.proof_type] || proofTypeConfig.document;
            const Icon = pcfg.icon;
            return (
              <Card key={item.id} className="hover:shadow-card-hover transition-all cursor-pointer group" onClick={() => setPreviewModal(item)}>
                {/* Preview area */}
                <div className="aspect-[4/3] bg-surface-100 dark:bg-surface-800 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                  {item.proof_type === 'photo' && item.file_url ? (
                    <img src={item.file_url} alt={item.caption || 'Bukti'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div className={`flex flex-col items-center justify-center gap-2 ${item.proof_type === 'photo' ? 'hidden' : ''}`}>
                    <Icon className="w-10 h-10 text-surface-300" />
                    <span className="text-xs text-surface-400 uppercase font-bold">{pcfg.label}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold dark:text-white truncate">{item.distribution?.recipient_name || '-'}</h3>
                    <span className="text-xs text-surface-500">{item.distribution?.distribution_code}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${pcfg.color}`}>{pcfg.label}</span>
                </div>
                {item.caption && <p className="text-xs text-surface-400 mt-1 line-clamp-2">{item.caption}</p>}
                <div className="text-xs text-surface-400 mt-1">
                  {new Date(item.uploaded_at).toLocaleDateString('id-ID')} • {item.uploadedByUser?.name || '-'}
                </div>
              </Card>
            );
          })}
          {data.length === 0 && (
            <div className="col-span-full text-center py-10 text-surface-500">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada bukti distribusi yang di-upload.</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title="Preview Bukti Distribusi" size="lg">
        {previewModal && (
          <div className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
              <h3 className="font-bold text-sm dark:text-white">{previewModal.distribution?.recipient_name}</h3>
              <p className="text-xs text-surface-500">{previewModal.distribution?.distribution_code} • {previewModal.distribution?.aidType?.name}</p>
            </div>
            
            {previewModal.file_url && (
              <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                {previewModal.proof_type === 'photo' ? (
                  <img src={previewModal.file_url} alt={previewModal.caption || 'Bukti'} className="w-full max-h-96 object-contain bg-surface-100 dark:bg-surface-900" />
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="w-16 h-16 mx-auto text-surface-300 mb-3" />
                    <a href={previewModal.file_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-medium">
                      Buka / Unduh File
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500 block text-xs">Jenis Bukti</span><span className="font-medium dark:text-white">{(proofTypeConfig[previewModal.proof_type] || {}).label || previewModal.proof_type}</span></div>
              <div><span className="text-surface-500 block text-xs">Diupload oleh</span><span className="font-medium dark:text-white">{previewModal.uploadedByUser?.name || '-'}</span></div>
              <div><span className="text-surface-500 block text-xs">Tanggal Upload</span><span className="font-medium dark:text-white">{new Date(previewModal.uploaded_at).toLocaleDateString('id-ID')}</span></div>
              <div><span className="text-surface-500 block text-xs">Status Distribusi</span><span className="font-medium dark:text-white">{previewModal.distribution?.status || '-'}</span></div>
            </div>

            {previewModal.caption && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <span className="font-medium text-blue-700 dark:text-blue-400">Keterangan:</span> {previewModal.caption}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DistributionProofs;
