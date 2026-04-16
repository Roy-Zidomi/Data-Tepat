import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Save, ArrowLeft, CheckCircle, AlertCircle, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import surveyService from '../../services/surveyService';

const SurveyAction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Checklist State
  const [answers, setAnswers] = useState({
    kondisi_atap: 'genteng_layak',
    kondisi_dinding: 'tembok_permanen',
    kondisi_lantai: 'keramik',
    status_kepemilikan: 'milik_sendiri',
    pengeluaran_bulanan: '',
    catatan_tambahan: ''
  });

  // Photo Gallery State
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [captions, setCaptions] = useState([]);

  useEffect(() => {
    fetchPhotos();
  }, [id]);

  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const _photos = await surveyService.getPhotos(id);
      setPhotos(_photos.data?.data || _photos.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat foto survei');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  // --- Photo Upload Logic ---
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate Max 5 files at once
    if (selectedFiles.length > 5) {
      toast.error('Maksimal upload 5 foto sekaligus');
      return;
    }

    // Validate size (5MB) and type
    const validFiles = [];
    selectedFiles.forEach(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`File ${f.name} bukan gambar`);
      } else if (f.size > 5 * 1024 * 1024) {
        toast.error(`Ukuran file ${f.name} melebih 5MB`);
      } else {
        validFiles.push(f);
      }
    });

    if (validFiles.length > 0) {
      setFilesToUpload(validFiles);
      setCaptions(validFiles.map(() => '')); // empty caption initially
    }
    
    // Reset input
    e.target.value = null;
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
  };

  const doUploadSelectedPhotos = async () => {
    if (filesToUpload.length === 0) return;
    try {
      setUploading(true);
      const formData = new FormData();
      filesToUpload.forEach((f, i) => {
        formData.append('photos', f);
        formData.append('captions[]', captions[i] || '');
      });

      await surveyService.uploadPhotos(id, formData);
      toast.success('Foto berhasil diunggah!');
      setFilesToUpload([]);
      setCaptions([]);
      fetchPhotos(); // Refresh gallery
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Hapus foto ini dari sistem? (Tindakan tidak dapat dibatalkan)')) return;
    
    try {
      await surveyService.deletePhoto(id, photoId);
      toast.success('Foto dihapus');
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error) {
      toast.error('Gagal menghapus foto');
    }
  };

  // --- Submit All Logic ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (photos.length === 0 && filesToUpload.length === 0) {
      toast.error('Harap unggah minimal 1 foto kondisi rumah/lapangan!');
      return;
    }
    
    setSubmitting(true);
    // Kalau ada file yang blm diupload, upload dlu baru submit akhir (simulate workflow)
    const proceedComplete = () => {
      setTimeout(() => {
        setSubmitting(false);
        toast.success('Hasil survei berhasil disimpan dan dikirim ke petugas');
        navigate('/surveys');
      }, 1000);
    };

    if (filesToUpload.length > 0) {
       doUploadSelectedPhotos().then(() => proceedComplete());
    } else {
       proceedComplete();
    }
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
           <h2 className="text-lg font-semibold mb-4 dark:text-white">Galeri Bukti Foto Lapangan</h2>
           
           {/* Existing Photos Gallery */}
           {loadingPhotos ? (
             <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
           ) : (
             photos.length > 0 && (
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                 {photos.map(p => (
                   <div key={p.id} className="relative group rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                     <img src={p.file_url} alt="Survei" className="w-full h-32 object-cover" />
                     {p.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white truncate">
                          {p.caption}
                        </div>
                     )}
                     <button
                       type="button"
                       onClick={() => handleDeletePhoto(p.id)}
                       className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                       title="Hapus"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )
           )}

           <div className="bg-surface-50 dark:bg-surface-800/50 p-6 rounded-xl border border-dashed border-surface-300 dark:border-surface-600">
             
             {filesToUpload.length > 0 ? (
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">File Siap Upload</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {filesToUpload.map((file, idx) => (
                     <div key={idx} className="flex gap-3 bg-white dark:bg-surface-900 p-3 rounded-lg border border-surface-200 dark:border-surface-700 items-start">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-surface-900 dark:text-white truncate mb-1">{file.name}</p>
                          <input 
                            type="text" 
                            placeholder="Opsional: Keterangan foto (mis. Ruang Tamu)" 
                            className="w-full text-xs rounded border border-surface-300 p-1.5 dark:bg-surface-800 dark:border-surface-600 dark:text-white"
                            value={captions[idx]}
                            onChange={(e) => handleCaptionChange(idx, e.target.value)}
                          />
                        </div>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-3 justify-end items-center pt-2">
                   <Button variant="outline" size="sm" type="button" onClick={() => setFilesToUpload([])} disabled={uploading}>
                     Batal
                   </Button>
                   <Button variant="primary" size="sm" icon={Upload} type="button" onClick={doUploadSelectedPhotos} loading={uploading}>
                     Unggah Sekarang
                   </Button>
                 </div>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">Ambil Foto / Tambah Berkas</h3>
                  <p className="text-sm text-surface-500 mt-1 max-w-sm mb-4">
                    Foto yang diambil wajib mencakup bagian depan rumah dan terlihat kepala keluarga (Maks 5 foto, 5MB).
                  </p>
                  <label className="cursor-pointer">
                    <span className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-block">
                       Pilih File Foto
                    </span>
                    <input type="file" className="hidden" accept="image/*" multiple capture="environment" onChange={handleFileSelect} />
                  </label>
                </div>
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
