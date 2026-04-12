import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Search, Check, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import aidTypeService from '../../services/aidTypeService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const AidTypeList = () => {
  const user = useAuthStore(s => s.user);
  const [aidTypes, setAidTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', description: '', unit: '', is_active: true
  });

  useEffect(() => { fetchAidTypes(); }, []);

  const fetchAidTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await aidTypeService.getAll({ search, limit: 100 });
      const records = data.data?.records || data.data || [];
      setAidTypes(records);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki izin untuk mengakses data jenis bantuan.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data jenis bantuan');
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingType(null);
    setForm({ code: '', name: '', description: '', unit: '', is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (aidType) => {
    setEditingType(aidType);
    setForm({
      code: aidType.code || '',
      name: aidType.name || '',
      description: aidType.description || '',
      unit: aidType.unit || '',
      is_active: aidType.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingType) {
        await aidTypeService.update(editingType.id, form);
        toast.success('Jenis bantuan berhasil diperbarui');
      } else {
        await aidTypeService.create(form);
        toast.success('Jenis bantuan berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchAidTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jenis bantuan ini?')) return;
    try {
      await aidTypeService.delete(id);
      toast.success('Jenis bantuan berhasil dihapus');
      fetchAidTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAidTypes();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manajemen Jenis Bantuan</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Kelola jenis program bantuan sosial yang tersedia
          </p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>Tambah Jenis Bantuan</Button>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Cari kode atau nama bantuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? (
        <Alert type="error" title="Error">{error}</Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aidTypes.map((aidType) => (
            <Card key={aidType.id} className="relative group hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-surface-500 bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                      {aidType.code}
                    </span>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  aidType.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {aidType.is_active ? <><Check className="w-3 h-3" /> Aktif</> : <><X className="w-3 h-3" /> Nonaktif</>}
                </span>
              </div>

              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1">{aidType.name}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-2">
                {aidType.description || 'Tidak ada deskripsi'}
              </p>
              {aidType.unit && (
                <p className="text-xs text-surface-400">Satuan: <span className="font-medium text-surface-600 dark:text-surface-300">{aidType.unit}</span></p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
                <Button size="xs" variant="ghost" icon={Pencil} onClick={() => openEditModal(aidType)}>Edit</Button>
                {user?.role === 'admin_main' && (
                  <Button size="xs" variant="ghost" className="text-red-600 hover:text-red-700" icon={Trash2} onClick={() => handleDelete(aidType.id)}>Hapus</Button>
                )}
              </div>
            </Card>
          ))}

          {aidTypes.length === 0 && (
            <div className="col-span-full">
              <Card className="text-center py-10">
                <Package className="w-10 h-10 mx-auto mb-3 text-surface-400 opacity-40" />
                <p className="text-surface-500">Belum ada data jenis bantuan.</p>
                <Button className="mt-4" icon={Plus} onClick={openCreateModal}>Tambah Jenis Bantuan</Button>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingType ? 'Edit Jenis Bantuan' : 'Tambah Jenis Bantuan Baru'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingType ? 'Simpan Perubahan' : 'Tambah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kode *"
            placeholder="Contoh: BPNT, PKH, BLT"
            value={form.code}
            onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
            required
          />
          <Input
            label="Nama Program *"
            placeholder="Contoh: Bantuan Pangan Non Tunai"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Deskripsi</label>
            <textarea
              className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
              rows={3}
              placeholder="Deskripsi singkat tentang program bantuan..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Input
            label="Satuan"
            placeholder="Contoh: kg, paket, rupiah"
            value={form.unit}
            onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Aktif (tersedia untuk pengajuan)
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AidTypeList;
