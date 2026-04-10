import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare, Send } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ComplaintCreate = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    household_id: '',
    application_id: '',
    complaint_type: 'data_error',
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
        }
      } catch (error) {
        toast.error('Gagal memuat data rumah tangga untuk pengaduan.');
      }
    };
    fetchHH();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || formData.description.length < 10) {
      toast.error('Deskripsi pengaduan minimal 10 karakter.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/complaints', {
        household_id: formData.household_id || null, // null if no HH selected
        complaint_type: formData.complaint_type,
        description: formData.description
      });
      toast.success('Pengaduan berhasil dikirim! Petugas kami akan segera menindaklanjuti.');
      navigate('/dashboard'); // Go back to dashboard where they can see
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
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nomor Kartu Keluarga Terkait</label>
              <select 
                name="household_id"
                value={formData.household_id} 
                onChange={handleChange}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="">Pilih KK (Opsional)</option>
                {households.map(hh => (
                  <option key={hh.id} value={hh.id}>{hh.nomor_kk} - {hh.nama_kepala_keluarga}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Pengaduan</label>
              <select 
                name="complaint_type"
                value={formData.complaint_type} 
                onChange={handleChange}
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
              >
                <option value="data_error">Kesalahan Data / NIK</option>
                <option value="distribution_issue">Kendala Penyaluran Bantuan</option>
                <option value="fraud">Indikasi Kecurangan / Penyelewengan</option>
                <option value="other">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Deskripsi Kejadian / Keluhan</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
                className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
                placeholder="Ceritakan keluhan atau masalah yang Anda alami secara rinci..."
              />
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
