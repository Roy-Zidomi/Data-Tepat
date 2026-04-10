import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Package, Check, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ApplicationCreate = () => {
  const [households, setHouseholds] = useState([]);
  const [aidTypes, setAidTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    household_id: '',
    aid_type_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hhRes, aidRes] = await Promise.all([
          api.get('/households'), // gets own households because role is warga
          api.get('/aid-types')
        ]);
        const hhData = hhRes.data.data.records;
        setHouseholds(hhData);
        setAidTypes(aidRes.data.data);

        // Pre-select if only 1
        if (hhData.length === 1) {
          setFormData(prev => ({ ...prev, household_id: hhData[0].id }));
        }
      } catch (error) {
        toast.error('Gagal memuat data pendukung pendaftaran');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.household_id || !formData.aid_type_id) {
       toast.error('Silakan pilih profil KK dan program bantuan.');
       return;
    }

    try {
      setSubmitting(true);
      await api.post('/aid-applications', {
        household_id: formData.household_id,
        aid_type_id: formData.aid_type_id
      });
      toast.success('Pengajuan Berhasil Dibuat dan Dikirim!');
      navigate('/dashboard'); // Go back to dashboard to see timeline
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Memuat data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Formulir Pengajuan Bantuan</h1>
        <p className="mt-2 text-surface-500">
          Silakan ajukan bantuan sosial yang sesuai dengan profil rumah tangga Anda.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Household Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold dark:text-white">1. Pilih Profil Rumah Tangga</h2>
            {households.length === 0 ? (
               <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-start gap-3">
                 <ShieldAlert className="w-5 h-5 mt-0.5" />
                 <div>
                   <p className="font-semibold">Tidak Ada Data KK</p>
                   <p className="text-sm mt-1">Anda belum membuat data Kartu Keluarga. Silakan buat profil KK Anda terlebih dahulu.</p>
                   <Button size="sm" variant="outline" className="mt-3 border-orange-300 text-orange-700" onClick={() => navigate('/households/create')}>Buat Data KK</Button>
                 </div>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {households.map(hh => (
                   <div 
                     key={hh.id}
                     onClick={() => setFormData({ ...formData, household_id: hh.id })}
                     className={`cursor-pointer border-2 p-4 rounded-xl transition-all ${formData.household_id === hh.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'}`}
                   >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white">{hh.nama_kepala_keluarga}</p>
                          <p className="text-sm text-surface-500">No KK: {hh.nomor_kk}</p>
                        </div>
                        {formData.household_id === hh.id && <Check className="text-primary-500 w-5 h-5" />}
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Aid Type Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold dark:text-white">2. Pilih Program Bantuan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {aidTypes.map(aid => (
                   <div 
                     key={aid.id}
                     onClick={() => setFormData({ ...formData, aid_type_id: aid.id })}
                     className={`cursor-pointer border-2 p-4 rounded-xl transition-all ${formData.aid_type_id === aid.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'}`}
                   >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white">{aid.name}</p>
                          <p className="text-sm text-surface-500 line-clamp-2 mt-1">{aid.description || 'Program bantuan pemerintah.'}</p>
                        </div>
                        {formData.aid_type_id === aid.id && <Check className="text-primary-500 w-5 h-5 shrink-0 ml-2" />}
                      </div>
                   </div>
                 ))}
            </div>
          </div>

          {/* Consent / Confirmation */}
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 text-sm text-surface-600 dark:text-surface-400">
             <p>Dengan menekan tombol Ajukan, Anda menyatakan bahwa seluruh data dan dokumen yang telah diunggah adalah <b>Benar</b> dan dapat dipertanggungjawabkan di hadapan survei riil.</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" icon={ArrowRight} iconPosition="right" loading={submitting} disabled={!formData.household_id || !formData.aid_type_id}>
               Kirim Pengajuan
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};

export default ApplicationCreate;
