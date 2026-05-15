import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Plus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import distributionService from '../../services/distributionService';
import decisionService from '../../services/decisionService';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { DISTRIBUTION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const DistributionList = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedDecisions, setApprovedDecisions] = useState([]);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    beneficiary_decision_id: '',
    recipient_name: '',
    recipient_relation: '',
    planned_date: '',
    quantity: '',
    unit: '',
    delivery_location: '',
    notes: '',
  });

  const fetchDistributions = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true);
      setError('');
      const response = await distributionService.getAll({
        page,
        limit: 10,
        search: searchTerm,
      });
      const payload = response.data.data || {};
      setData(payload.records || []);
      setMeta(payload.meta || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data distribusi bantuan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const res = await decisionService.getAll({ decision_status: 'approved', limit: 100 });
      setApprovedDecisions(res.data.data?.records || []);
    } catch (err) {
      toast.error('Gagal memuat daftar keputusan');
    }
  };

  const handleCreateDistribution = async (e) => {
    e.preventDefault();
    if (!formData.beneficiary_decision_id) {
      toast.error('Pilih keputusan permohonan terlebih dahulu');
      return;
    }

    const selectedDec = approvedDecisions.find(d => d.id.toString() === formData.beneficiary_decision_id);
    if (!selectedDec) return;

    try {
      setCreating(true);
      await distributionService.create({
        ...formData,
        aid_type_id: selectedDec.approved_aid_type_id
      });
      toast.success('Distribusi berhasil dibuat');
      setIsModalOpen(false);
      setFormData({
        beneficiary_decision_id: '',
        recipient_name: '',
        recipient_relation: '',
        planned_date: '',
        quantity: '',
        unit: '',
        delivery_location: '',
        notes: '',
      });
      fetchDistributions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat distribusi');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: 'distribution_code',
      label: 'Kode Distribusi',
      render: (value) => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {value}
        </span>
      ),
    },
    {
      key: 'recipient_name',
      label: 'Penerima',
      render: (value, row) => (
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{value || '-'}</p>
          <p className="text-xs text-surface-500">
            {row.decision?.application?.household?.nama_kepala_keluarga || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'aidType',
      label: 'Program',
      sortable: false,
      render: (value) => value?.name || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge statusMap={DISTRIBUTION_STATUS} value={value} />,
    },
    {
      key: 'decision',
      label: 'Permohonan',
      sortable: false,
      render: (value) => value?.application?.application_no || '-',
    },
    {
      key: '_count',
      label: 'Bukti',
      sortable: false,
      render: (value) => value?.proofs || 0,
    },
    {
      key: 'planned_date',
      label: 'Tanggal Rencana',
      render: (value) => formatDate(value),
    },
    ...(['admin_main', 'admin_staff', 'relawan'].includes(user?.role)
      ? [{
          key: 'id',
          label: 'Aksi',
          sortable: false,
          render: (value) => (
            <Button
              size="xs"
              variant="outline"
              icon={Settings}
              onClick={() => navigate(`/distributions/${value}/action`)}
            >
              Proses
            </Button>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Distribusi Bantuan</h1>
          <p className="mt-1 text-sm text-surface-500">
            {user?.role === 'pengawas'
              ? 'Pantau status distribusi, penerima, dan bukti penyaluran secara read-only.'
              : 'Ringkasan distribusi bantuan untuk pelacakan dan pemantauan.'}
          </p>
        </div>
        
        {['admin_main', 'admin_staff'].includes(user?.role) && (
          <Button icon={Plus} onClick={handleOpenModal}>
            Buat Distribusi Baru
          </Button>
        )}
      </div>

      {user?.role === 'pengawas' && (
        <Alert type="info" title="Akses Pengawas">
          Pengawas hanya dapat memantau penyaluran. Perubahan status dan upload bukti tetap dilakukan petugas operasional.
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            meta={meta}
            onPageChange={(page) => fetchDistributions(page, search)}
            onSearch={(searchTerm) => {
              setSearch(searchTerm);
              fetchDistributions(1, searchTerm);
            }}
            searchPlaceholder="Cari kode distribusi atau nama penerima..."
            emptyMessage="Belum ada data distribusi yang ditemukan."
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Distribusi Baru"
        size="lg"
      >
        <form onSubmit={handleCreateDistribution} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Pilih Keputusan Layak (Approved)
            </label>
            <select
              value={formData.beneficiary_decision_id}
              onChange={(e) => {
                const dec = approvedDecisions.find(d => d.id.toString() === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  beneficiary_decision_id: e.target.value,
                  recipient_name: dec?.application?.household?.nama_kepala_keluarga || '',
                  delivery_location: dec?.application?.household?.alamat || '',
                }));
              }}
              className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
              required
            >
              <option value="">-- Pilih Keputusan Warga --</option>
              {approvedDecisions.map(dec => (
                <option key={dec.id} value={dec.id}>
                  {dec.application?.application_no} - {dec.application?.household?.nama_kepala_keluarga} ({dec.approvedAidType?.name})
                </option>
              ))}
            </select>
            {approvedDecisions.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">Belum ada keputusan warga yang disetujui (Approved).</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Penerima Aktual"
              value={formData.recipient_name}
              onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
              required
            />
            <Input
              label="Hubungan dengan KK"
              value={formData.recipient_relation}
              onChange={(e) => setFormData({ ...formData, recipient_relation: e.target.value })}
              placeholder="Kosongkan jika penerima adalah KK"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Kuantitas"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <Input
              label="Satuan"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="Contoh: Kg, Liter, Rupiah"
            />
            <Input
              label="Tanggal Rencana"
              type="date"
              value={formData.planned_date}
              onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Alamat Pengiriman
            </label>
            <textarea
              rows={2}
              value={formData.delivery_location}
              onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
              className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-surface-700 dark:bg-surface-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={creating}>
              Simpan Distribusi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DistributionList;
