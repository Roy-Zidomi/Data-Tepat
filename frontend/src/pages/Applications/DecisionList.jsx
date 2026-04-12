import { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Stamp, XCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DecisionList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [selectedApp, setSelectedApp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aidTypes, setAidTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    decision_status: 'approved',
    approved_aid_type_id: '',
    approved_amount: '',
    approved_note: ''
  });

  useEffect(() => { 
    fetchData(); 
    fetchAidTypes();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      // We will reuse the application list endpoint but filter for admin_review
      const res = await api.get('/aid-applications/all', {
        params: { search, status: 'admin_review', limit: 50 }
      });
      setData(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar permohonan siap review');
    } finally { setLoading(false); }
  };

  const fetchAidTypes = async () => {
    try {
      const res = await api.get('/aid-types');
      setAidTypes(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setSubmitting(true);
      await api.post('/decisions', {
        application_id: selectedApp.id,
        ...formData
      });
      toast.success(`Keputusan berhasil disimpan untuk ${selectedApp.application_no}`);
      setSelectedApp(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan keputusan');
    } finally { setSubmitting(false); }
  };

  const openDecisionModal = (app) => {
    setSelectedApp(app);
    setFormData({
      decision_status: 'approved',
      approved_aid_type_id: app.aid_type_id?.toString() || '',
      approved_amount: '',
      approved_note: ''
    });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Review & Keputusan</h1>
          <p className="text-sm text-surface-500 mt-1">Buat keputusan (Approve/Reject) untuk permohonan yang telah disurvei</p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari nomor permohonan..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 font-medium border-b border-surface-200 dark:border-surface-800">
                <tr>
                  <th className="px-6 py-4">No Permohonan</th>
                  <th className="px-6 py-4">Keluarga</th>
                  <th className="px-6 py-4">Scoring</th>
                  <th className="px-6 py-4">Validasi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50 text-surface-700 dark:text-surface-300">
                {data.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium dark:text-white">{app.application_no}</td>
                    <td className="px-6 py-4">{app.household?.nama_kepala_keluarga || '-'}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-bold">
                         Menunggu
                       </span>
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white text-xs">{app.status.replace(/_/g, ' ').toUpperCase()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button size="xs" variant="primary" icon={Stamp} onClick={() => openDecisionModal(app)}>Eksekusi</Button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-surface-500">
                      <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada permohonan yang menunggu keputusan admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DECISION MODAL */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Eksekusi Keputusan" size="md">
        {selectedApp && (
          <form onSubmit={handleDecisionSubmit} className="space-y-4">
            <div className="bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg mb-4 text-sm text-surface-700 dark:text-surface-300">
              <span className="font-medium text-surface-500">Permohonan:</span> <span className="font-bold">{selectedApp.application_no}</span>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Tentukan Keputusan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, decision_status: 'approved'})}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.decision_status === 'approved' 
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-bold text-sm">SETUJUI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, decision_status: 'rejected'})}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.decision_status === 'rejected' 
                    ? 'border-red-500 bg-red-50/50 text-red-700 dark:bg-red-500/10 dark:text-red-400' 
                    : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300 dark:hover:border-surface-600'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                  <span className="font-bold text-sm">TOLAK</span>
                </button>
              </div>
            </div>

            {formData.decision_status === 'approved' && (
              <div className="space-y-4 animate-fade-in bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Jenis Bantuan Disetujui</label>
                  <select
                    value={formData.approved_aid_type_id}
                    onChange={e => setFormData({...formData, approved_aid_type_id: e.target.value})}
                    required
                    className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="">Pilih Bantuan...</option>
                    {aidTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <Input label="Nominal/Keterangan Bantuan" value={formData.approved_amount} onChange={e => setFormData({...formData, approved_amount: e.target.value})} placeholder="Contoh: Sembako Senilai Rp 200.000 / bln" />
              </div>
            )}

            <div className="space-y-1">
               <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Catatan Administratif</label>
               <textarea
                 className="w-full rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500 outline-none"
                 rows={3}
                 value={formData.approved_note}
                 onChange={e => setFormData({...formData, approved_note: e.target.value})}
                 placeholder="Tambahkan catatan mengapa permohonan ini disetujui/ditolak..."
               />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button type="button" variant="ghost" onClick={() => setSelectedApp(null)}>Batal</Button>
              <Button type="submit" variant="primary" loading={submitting}>Simpan Keputusan Final</Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default DecisionList;
