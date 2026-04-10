import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const SurveyAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Dummy Checklist items for demo since we don't have dynamic endpoint yet
  const [answers, setAnswers] = useState({
    kondisi_atap: 'genteng_layak',
    kondisi_dinding: 'tembok_permanen',
    kondisi_lantai: 'keramik',
    status_kepemilikan: 'milik_sendiri',
    pengeluaran_bulanan: '',
    catatan_tambahan: ''
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photo) {
      toast.error('Harap unggah minimal 1 foto kondisi rumah/keadaan lapangan');
      return;
    }
    
    setSubmitting(true);
    // Simulate API Call for Submitting Checklist & Photo
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Hasil survei berhasil disimpan dan dikirim ke petugas');
      navigate('/surveys');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/surveys')} className="mb-4 -ml-4">
        Kembali
      </Button>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-surface-500 uppercase tracking-widest bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
             SURVEY #{id}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Form Kelayakan Survei</h1>
        <p className="text-sm text-surface-500 mt-1">
          Isi daftar periksa berdasarkan kondisi lapangan yang sebenar-benarnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 md:p-8">
           <h2 className="text-lg font-semibold border-b pb-2 dark:border-surface-700 mb-6">Penilaian Kondisi Fisik</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kondisi Atap Terluas</label>
                <select name="kondisi_atap" value={answers.kondisi_atap} onChange={handleChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                   <option value="genteng_layak">Genteng (Layak)</option>
                   <option value="seng_asbes">Seng / Asbes</option>
                   <option value="ijuk_rumbia">Ijuk / Rumbia / Daun</option>
                   <option value="rusak_parah">Rusak Parah / Bocor Bebas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kondisi Dinding</label>
                <select name="kondisi_dinding" value={answers.kondisi_dinding} onChange={handleChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                   <option value="tembok_permanen">Tembok Permanen Berplester</option>
                   <option value="tembok_tanpa_plester">Tembok Tanpa Plester / Bata</option>
                   <option value="kayu_papan">Kayu / Papan Berkualitas</option>
                   <option value="bambu_anyaman">Bambu / Anyaman / Seng Bekas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Kondisi Lantai</label>
                <select name="kondisi_lantai" value={answers.kondisi_lantai} onChange={handleChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                   <option value="keramik">Keramik / Marmer / Porselen</option>
                   <option value="semen">Semen / Plester</option>
                   <option value="kayu_biasa">Kayu Papan Biasa</option>
                   <option value="tanah">Tanah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Status Kepemilikan Rumah/Lahan</label>
                <select name="status_kepemilikan" value={answers.status_kepemilikan} onChange={handleChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                   <option value="milik_sendiri">Milik Sendiri</option>
                   <option value="kontrak_sewa">Kontrak / Sewa</option>
                   <option value="menumpang">Menumpang / Bebas Sewa</option>
                   <option value="liar">Liar / Bukan Hak Milik</option>
                </select>
              </div>
           </div>

           <div className="mt-6 border-t pt-4 dark:border-surface-700">
             <Input 
               label="Estimasi Pengeluaran Bulanan Keluarga (Rp)" 
               type="number" 
               name="pengeluaran_bulanan" 
               value={answers.pengeluaran_bulanan} 
               onChange={handleChange} 
               placeholder="Contoh: 1500000"
               required
             />
           </div>

           <div className="mt-4">
             <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Catatan Tambahan Relawan (Opsional)</label>
             <textarea 
               name="catatan_tambahan"
               value={answers.catatan_tambahan}
               onChange={handleChange}
               rows={3}
               className="w-full rounded-lg border-surface-300 focus:border-primary-500 dark:bg-surface-900 dark:border-surface-700 dark:text-white text-sm"
               placeholder="Bisa cantumkan detail misal: Memiliki 3 balita yang butuh susu, dll."
             />
           </div>
        </Card>

        {/* Upload Bukti */}
        <Card className="p-6">
           <h2 className="text-lg font-semibold mb-4 dark:text-white">Unggah Bukti Foto Lapangan</h2>
           <div className="bg-surface-50 dark:bg-surface-800/50 p-6 rounded-xl border border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center text-center">
             
             {photoPreview ? (
               <div className="space-y-4">
                 <img src={photoPreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg mx-auto shadow-md border-4 border-white dark:border-surface-700" />
                 <p className="text-sm font-medium">{photo.name}</p>
                 <Button variant="outline" size="sm" onClick={() => { setPhoto(null); setPhotoPreview(null); }} type="button">Hapus Foto</Button>
               </div>
             ) : (
                <>
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Ambil Foto / Unggah Berkas</h3>
                  <p className="text-sm text-surface-500 mt-1 max-w-xs mb-4">
                    Foto yang diambil wajib mencakup bagian depan rumah dan terlihat kepala keluarga jika memungkinkan.
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-block">
                       Pilih File Foto
                    </span>
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />
                  </label>
                </>
             )}

           </div>
        </Card>

        <div className="flex bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl items-start gap-3 border border-blue-200 dark:border-blue-800">
           <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
           <p className="text-sm text-blue-800 dark:text-blue-200">
             Demi menjunjung integritas sistem, data yang Anda isikan akan berpengaruh langsung terhadap hasil **Scoring AI**. Harap mengisi sejujur-jujurnya sesuai fakta lapangan.
           </p>
        </div>

        <div className="flex justify-end pt-2">
           <Button type="submit" size="lg" icon={Save} loading={submitting}>Simpan & Finalisasi Survei</Button>
        </div>
      </form>
    </div>
  );
};

export default SurveyAction;
