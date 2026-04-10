import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, ArrowRight, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 2;

const HouseholdDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('KTP');
  
  // Fetch existing docs
  useEffect(() => {
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/household/${id}`);
      setDocuments(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat dokumen');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format tidak didukung. Gunakan PDF/JPG/PNG');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran maksimal ${MAX_SIZE_MB}MB`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('household_id', id);
    formData.append('document_type', docType);

    try {
      setLoading(true);
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Dokumen berhasil diunggah');
      fetchDocuments();
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Gagal mengunggah dokumen');
    } finally {
      setLoading(false);
    }
  };

  const requiredDocs = ['KTP', 'KK', 'FOTO_RUMAH'];
  const uploadedTypes = documents.map(d => d.document_type);
  const isComplete = requiredDocs.every(type => uploadedTypes.includes(type));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dokumen Pendukung</h1>
          <p className="text-sm text-surface-500 mt-1">
            Unggah dokumen wajib untuk menyelesaikan pengisian profil.
          </p>
        </div>
        {isComplete && (
          <Button icon={ArrowRight} iconPosition="right" onClick={() => navigate('/applications/new')}>
            Lanjut Ajukan Bantuan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Action */}
        <Card className="p-6">
           <h2 className="text-lg font-semibold mb-4 dark:text-white">Unggah Berkas Baru</h2>
           
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipe Dokumen</label>
               <select 
                 value={docType} 
                 onChange={(e) => setDocType(e.target.value)}
                 className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white"
               >
                 <option value="KTP">KTP Kepala Keluarga</option>
                 <option value="KK">Kartu Keluarga</option>
                 <option value="SKTM">Surat Keterangan Tidak Mampu (SKTM)</option>
                 <option value="FOTO_RUMAH">Foto Depan Rumah</option>
               </select>
             </div>

             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                 loading ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-50 border-surface-300 dark:border-surface-700 dark:hover:bg-surface-800'
               }`}
             >
               <UploadCloud className="w-10 h-10 text-primary-500 mx-auto mb-3" />
               <p className="text-sm font-medium text-surface-900 dark:text-white">Klik untuk memilih file</p>
               <p className="text-xs text-surface-500 mt-1">PDF, JPG, PNG hingga {MAX_SIZE_MB}MB</p>
             </div>
             
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".png,.jpg,.jpeg,.pdf" 
               onChange={handleFileChange} 
             />
           </div>
        </Card>

        {/* Uploaded List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Berkas Terunggah</h2>
          
          {documents.length === 0 ? (
            <Card className="p-6 text-center border border-surface-200 dark:border-surface-700 shadow-none bg-surface-50/50 dark:bg-surface-800/50 flex flex-col items-center justify-center h-48">
               <FileText className="w-10 h-10 text-surface-300 mb-2" />
               <p className="text-sm text-surface-500">Belum ada dokumen yang diunggah</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-semibold dark:text-white">{doc.document_type}</p>
                       <p className="text-xs text-surface-500 capitalize">{doc.verifications?.[0]?.status || 'Dalam Review'}</p>
                     </div>
                   </div>
                   {doc.verifications?.[0]?.status === 'verified' && <CheckCircle className="w-5 h-5 text-green-500" />}
                   {doc.verifications?.[0]?.status === 'rejected' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseholdDocuments;
