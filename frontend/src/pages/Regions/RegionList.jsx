import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import regionService from '../../services/regionService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText, digitsOnly } from '../../utils/formLimits';

const RegionList = () => {
  const user = useAuthStore(s => s.user);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    province: '', city_regency: '', district: '', village: '', rt: '', rw: '', postal_code: ''
  });

  useEffect(() => { fetchRegions(); }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await regionService.getAll({ search, limit: 100 });
      const records = data.data?.records || data.data || [];
      setRegions(records);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki izin untuk mengakses data wilayah.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data wilayah');
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRegion(null);
    setForm({ province: '', city_regency: '', district: '', village: '', rt: '', rw: '', postal_code: '' });
    setModalOpen(true);
  };

  const openEditModal = (region) => {
    setEditingRegion(region);
    setForm({
      province: region.province || '',
      city_regency: region.city_regency || '',
      district: region.district || '',
      village: region.village || '',
      rt: region.rt || '',
      rw: region.rw || '',
      postal_code: region.postal_code || '',
    });
    setModalOpen(true);
  };

  const updateFormField = (field, value) => {
    let nextValue = value;

    if (['province', 'city_regency', 'district', 'village'].includes(field)) {
      nextValue = clampText(value, FORM_LIMITS.regionName);
    }

    if (['rt', 'rw'].includes(field)) {
      nextValue = digitsOnly(value, FORM_LIMITS.rtRw);
    }

    if (field === 'postal_code') {
      nextValue = digitsOnly(value, FORM_LIMITS.postalCode);
    }

    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingRegion) {
        await regionService.update(editingRegion.id, form);
        toast.success('Wilayah berhasil diperbarui');
      } else {
        await regionService.create(form);
        toast.success('Wilayah berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data wilayah');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus wilayah ini?')) return;
    try {
      await regionService.delete(id);
      toast.success('Wilayah berhasil dihapus');
      fetchRegions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus wilayah');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRegions();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Manajemen Wilayah</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Kelola data wilayah administrasi untuk pendataan rumah tangga
          </p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>Tambah Wilayah</Button>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Cari provinsi, kota, kecamatan..."
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead className="bg-surface-50 dark:bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Provinsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Kota/Kabupaten</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Kecamatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Kelurahan/Desa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">RT/RW</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-200 dark:bg-surface-900 dark:divide-surface-800">
                {regions.map((region) => (
                  <tr key={region.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{region.province}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">{region.city_regency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">{region.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">{region.village}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                      {region.rt && region.rw ? `${region.rt}/${region.rw}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button size="xs" variant="ghost" icon={Pencil} onClick={() => openEditModal(region)}>Edit</Button>
                      {user?.role === 'admin_main' && (
                        <Button size="xs" variant="ghost" className="text-red-600 hover:text-red-700" icon={Trash2} onClick={() => handleDelete(region.id)}>Hapus</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {regions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-surface-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada data wilayah. Klik "Tambah Wilayah" untuk memulai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRegion ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingRegion ? 'Simpan Perubahan' : 'Tambah Wilayah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Provinsi *"
              value={form.province}
              onChange={(e) => updateFormField('province', e.target.value)}
              required
              maxLength={FORM_LIMITS.regionName}
            />
            <Input
              label="Kota/Kabupaten *"
              value={form.city_regency}
              onChange={(e) => updateFormField('city_regency', e.target.value)}
              required
              maxLength={FORM_LIMITS.regionName}
            />
            <Input
              label="Kecamatan *"
              value={form.district}
              onChange={(e) => updateFormField('district', e.target.value)}
              required
              maxLength={FORM_LIMITS.regionName}
            />
            <Input
              label="Kelurahan/Desa *"
              value={form.village}
              onChange={(e) => updateFormField('village', e.target.value)}
              required
              maxLength={FORM_LIMITS.regionName}
            />
            <Input
              label="RT"
              value={form.rt}
              onChange={(e) => updateFormField('rt', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.rtRw}
            />
            <Input
              label="RW"
              value={form.rw}
              onChange={(e) => updateFormField('rw', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.rtRw}
            />
            <Input
              label="Kode Pos"
              value={form.postal_code}
              onChange={(e) => updateFormField('postal_code', e.target.value)}
              inputMode="numeric"
              maxLength={FORM_LIMITS.postalCode}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RegionList;
