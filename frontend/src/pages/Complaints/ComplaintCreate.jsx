import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare, Send } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { clampText } from '../../utils/formLimits';

const COMPLAINT_DESCRIPTION_LIMIT = 2000;

const COMPLAINT_GROUPS = {
  general: {
    label: 'Masalah Umum / Data',
    helper: 'Gunakan untuk masalah data diri, anggota keluarga, atau kendala akun.',
    categories: [
      { value: 'data_kk', label: 'Data KK tidak sesuai' },
      { value: 'data_anggota', label: 'Data anggota keluarga salah' },
      { value: 'nik_kk', label: 'NIK / KK bermasalah' },
      { value: 'akun_akses', label: 'Masalah akun / akses login' },
      { value: 'lainnya', label: 'Masalah umum lainnya' },
    ],
  },
  application: {
    label: 'Masalah Permohonan Bantuan',
    helper: 'Gunakan untuk proses pengajuan, verifikasi, atau hasil permohonan bantuan.',
    categories: [
      { value: 'status_pengajuan', label: 'Status pengajuan tidak jelas' },
      { value: 'hasil_tidak_sesuai', label: 'Hasil pengajuan tidak sesuai' },
      { value: 'survei_belum_datang', label: 'Survei belum dilakukan' },
      { value: 'dokumen_pengajuan', label: 'Masalah dokumen pengajuan' },
      { value: 'lainnya', label: 'Masalah pengajuan lainnya' },
    ],
  },
  distribution: {
    label: 'Masalah Distribusi Bantuan',
    helper: 'Gunakan untuk masalah bantuan yang tidak diterima, salah sasaran, atau tidak sesuai jumlah.',
    categories: [
      { value: 'bantuan_belum_diterima', label: 'Bantuan belum diterima' },
      { value: 'jumlah_tidak_sesuai', label: 'Jumlah bantuan tidak sesuai' },
      { value: 'salah_sasaran', label: 'Distribusi salah sasaran' },
      { value: 'jadwal_penyaluran', label: 'Jadwal penyaluran bermasalah' },
      { value: 'lainnya', label: 'Masalah distribusi lainnya' },
    ],
  },
};

const ComplaintCreate = () => {
  const [households, setHouseholds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    household_id: '',
    application_id: '',
    complaint_type: 'general',
    issue_category: 'data_kk',
    description: ''
  });

  useEffect(() => {
    const fetchHH = async () => {
      try {
        const res = await api.get('/households');
        const hhData = res.data.data.records;
        setHouseholds(hhData);
        if (hhData.length > 0) {
          setFormData(prev => ({ ...prev, household_id: hhData[0].id }));
        } else {
          setFormData(prev => ({ ...prev, household_id: '' }));
        }
      } catch (error) {
        toast.error('Gagal memuat data rumah tangga untuk pengaduan.');
      }
    };
    fetchHH();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'description' ? clampText(value, COMPLAINT_DESCRIPTION_LIMIT) : value;
    if (name === 'complaint_type') {
      const defaultCategory = COMPLAINT_GROUPS[value]?.categories?.[0]?.value || 'lainnya';
      setFormData({ ...formData, complaint_type: value, issue_category: defaultCategory });
      return;
    }
    setFormData({ ...formData, [name]: nextValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.household_id) {
      toast.error('Data rumah tangga Anda belum tersedia. Hubungi admin untuk pengecekan data keluarga.');
      return;
    }
    if (!formData.description || formData.description.length < 10) {
      toast.error('Deskripsi pengaduan minimal 10 karakter.');
      return;
    }

    const selectedGroup = COMPLAINT_GROUPS[formData.complaint_type];
    const selectedCategory = selectedGroup?.categories.find((category) => category.value === formData.issue_category);
    const composedDescription = selectedCategory
      ? `[Kategori: ${selectedCategory.label}] ${formData.description}`
      : formData.description;

    try {
      setSubmitting(true);
      await api.post('/complaints', {
        household_id: formData.household_id,
        complaint_type: formData.complaint_type,
        description: composedDescription
      });
      toast.success('Pengaduan berhasil dikirim! Petugas kami akan segera menindaklanjuti.');
      navigate('/complaints');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pengaduan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Layanan Pengaduan Warga</h1>
        <p className="mt-2 text-surface-500">
          Sampaikan keluhan terkait ketidaksesuaian data atau hal mengenai program bantuan sosial.
        </p>
      </div>

      <Card className="p-6 md:p-8">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Kategori Masalah Pengaduan</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(COMPLAINT_GROUPS).map(([value, group]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'complaint_type', value } })}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      formData.complaint_type === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800'
                    }`}
                  >
                    <p className="font-semibold">{group.label}</p>
                    <p className="mt-1 text-xs opacity-80">{group.helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kategori Detail Masalah</label>
              <select
                name="issue_category"
                value={formData.issue_category}
                onChange={handleChange}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                {COMPLAINT_GROUPS[formData.complaint_type].categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-surface-500">
                Pilih jenis masalah yang paling mendekati agar laporan lebih cepat diteruskan ke petugas yang tepat.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Deskripsi Kejadian / Keluhan</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
                maxLength={COMPLAINT_DESCRIPTION_LIMIT}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
                placeholder="Ceritakan keluhan atau masalah yang Anda alami secara rinci..."
              />
              <p className="mt-1 text-xs text-surface-500 text-right">
                {formData.description.length}/{COMPLAINT_DESCRIPTION_LIMIT}
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm flex gap-3">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p>Setiap laporan pengaduan akan diverifikasi dan diteruskan ke petugas wilayah terdekat. Mohon berikan informasi yang akurat.</p>
            </div>

            <div className="flex justify-end pt-4">
               <Button type="submit" icon={Send} iconPosition="right" loading={submitting}>Kirim Laporan</Button>
            </div>
         </form>
      </Card>
    </div>
  );
};

export default ComplaintCreate;
