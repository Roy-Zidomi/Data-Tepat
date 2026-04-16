import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Users, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Identitas KK', icon: User },
  { id: 2, title: 'Anggota Keluarga', icon: Users },
  { id: 3, title: 'Selesai', icon: CheckCircle },
];

const HouseholdWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  // Step 1 State
  const [household, setHousehold] = useState({
    nomor_kk: '',
    nama_kepala_keluarga: '',
    nik_kepala_keluarga: '',
    alamat: '',
    region_id: 1,
    phone: user?.phone || ''
  });

  // Step 2 State
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    nik: '',
    name: '',
    relationship_to_head: 'istri',
    birth_date: '',
    gender: 'perempuan'
  });

  const [createdHouseholdId, setCreatedHouseholdId] = useState(null);

  const handleHouseholdChange = (e) => {
    const { name, value } = e.target;
    setHousehold(prev => ({
      ...prev,
      [name]: name === 'region_id' ? Number(value) : value,
    }));
  };

  const handleMemberChange = (e) => {
    setNewMember(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addMember = () => {
    if (!newMember.name || !newMember.nik || !newMember.birth_date) {
      toast.error('Lengkapi data anggota keluarga');
      return;
    }
    setMembers(prev => [...prev, newMember]);
    setNewMember({
      nik: '',
      name: '',
      relationship_to_head: 'anak',
      birth_date: '',
      gender: 'laki_laki'
    });
  };

  const removeMember = (index) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const submitHousehold = async () => {
    try {
      setLoading(true);
      const parsedRegionId = Number(household.region_id);
      if (!Number.isInteger(parsedRegionId) || parsedRegionId <= 0) {
        toast.error('Region tidak valid. Hubungi admin untuk setup wilayah terlebih dahulu.');
        return;
      }

      const payload = {
        ...household,
        region_id: parsedRegionId,
        registration_source: user?.role === 'warga' ? 'self' : 'assisted',
      };

      const res = await api.post('/households', payload);
      setCreatedHouseholdId(res.data.data.id);
      toast.success('Data Kepala Keluarga Berhasil Disimpan');
      setCurrentStep(2);
    } catch (error) {
      const firstError = error.response?.data?.errors?.[0];
      const message = firstError
        ? `Validasi ${firstError.field}: ${firstError.message}`
        : (error.response?.data?.message || 'Gagal menyimpan data KK');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const submitMembers = async () => {
    if (members.length === 0) {
      // Optional, maybe it's only 1 person
      if (!window.confirm('Anda belum memasukkan anggota keluarga. Lanjutkan?')) return;
    }
    
    try {
      setLoading(true);
      if (members.length > 0) {
        await api.post(`/households/${createdHouseholdId}/members`, { members });
      }
      toast.success('Pendaftaran Keluarga Lengkap Selesai!');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Gagal menyimpan anggota keluarga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Formulir Data Rumah Tangga</h1>
        <p className="mt-2 text-surface-500">Lengkapi data untuk keperluan pengajuan bantuan</p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-200 dark:bg-surface-700 -z-10" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 transition-all duration-500 -z-10" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
        />
        
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          return (
             <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
                  isActive ? 'bg-primary-500 border-primary-200 text-white' : 'bg-surface-100 border-white text-surface-400 dark:bg-surface-800 dark:border-surface-900'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-surface-400'}`}>
                  {step.title}
                </span>
             </div>
          );
        })}
      </div>

      <Card className="p-6 md:p-8">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl font-semibold border-b pb-2 dark:border-surface-700">Identitas Kepala Keluarga</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nomor Kartu Keluarga" name="nomor_kk" value={household.nomor_kk} onChange={handleHouseholdChange} placeholder="16 Digit Angka" type="text" maxLength={16} required />
                <Input label="NIK Kepala Keluarga" name="nik_kepala_keluarga" value={household.nik_kepala_keluarga} onChange={handleHouseholdChange} placeholder="16 Digit Angka" type="text" maxLength={16} required />
                <Input label="Nama Lengkap Sesuai KTP" name="nama_kepala_keluarga" value={household.nama_kepala_keluarga} onChange={handleHouseholdChange} required />
                <Input label="Nomor Handphone" name="phone" value={household.phone} onChange={handleHouseholdChange} />
             </div>

             <div className="space-y-2 mt-4">
                <Input label="Alamat Lengkap" name="alamat" value={household.alamat} onChange={handleHouseholdChange} required />
                <p className="text-xs text-surface-500">Mencakup nama jalan, blok, RT/RW, dsb.</p>
             </div>

             <div className="flex justify-end pt-4">
                <Button onClick={submitHousehold} loading={loading} icon={ChevronRight} iconPosition="right">Lanjut ke Anggota Keluarga</Button>
             </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl font-semibold border-b pb-2 dark:border-surface-700">Daftar Anggota Keluarga</h2>
             
             <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl space-y-4 border border-surface-200 dark:border-surface-700">
               <h3 className="text-sm font-medium text-surface-600 dark:text-surface-300">Tambah Anggota (Istri, Anak, dll)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <Input label="Nama Lengkap" name="name" value={newMember.name} onChange={handleMemberChange} />
                 <Input label="NIK" name="nik" value={newMember.nik} onChange={handleMemberChange} maxLength={16} />
                 <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Hubungan</label>
                    <select name="relationship_to_head" value={newMember.relationship_to_head} onChange={handleMemberChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                      <option value="istri">Istri</option>
                      <option value="suami">Suami</option>
                      <option value="anak">Anak</option>
                      <option value="orang_tua">Orang Tua</option>
                      <option value="mertua">Mertua</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                 </div>
                 <Input label="Tanggal Lahir" type="date" name="birth_date" value={newMember.birth_date} onChange={handleMemberChange} />
                 <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Jenis Kelamin</label>
                    <select name="gender" value={newMember.gender} onChange={handleMemberChange} className="w-full rounded-lg border-surface-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                      <option value="laki_laki">Laki-Laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                 </div>
                 <div className="flex items-end pb-1">
                   <Button variant="outline" size="sm" onClick={addMember} className="w-full" type="button">Tambah ke Daftar</Button>
                 </div>
               </div>
             </div>

             {/* Table view */}
             <div className="overflow-x-auto rounded-lg border dark:border-surface-700">
               <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                 <thead className="bg-surface-50 dark:bg-surface-800">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Nama</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">NIK</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Hubungan</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-surface-200 dark:bg-surface-900 dark:divide-surface-800">
                   {members.map((m, idx) => (
                     <tr key={idx}>
                       <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark:text-white">{m.name}</td>
                       <td className="px-4 py-2 whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">{m.nik}</td>
                       <td className="px-4 py-2 whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">{m.relationship_to_head}</td>
                       <td className="px-4 py-2 whitespace-nowrap text-sm text-red-500 cursor-pointer" onClick={() => removeMember(idx)}>Hapus</td>
                     </tr>
                   ))}
                   {members.length === 0 && (
                     <tr>
                       <td colSpan="4" className="px-4 py-4 text-center text-sm text-surface-500">Belum ada anggota keluarga ditambahkan</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>

             <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => window.alert('Teknisnya ini update KK, tapi untuk demo wizard kita maju saja.')} icon={ChevronLeft}>Kembali (Edit KK)</Button>
                <Button onClick={submitMembers} loading={loading} icon={ChevronRight} iconPosition="right">Selesai & Simpan</Button>
             </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="text-center py-12 animate-fade-in">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Pendaftaran Selesai!</h2>
             <p className="text-surface-500 mb-8 max-w-md mx-auto">
               Data profil keluarga Anda telah berhasil disimpan di sistem. Anda sekarang bisa melanjutkannya dengan mengunggah dokumen KTP/KK lalu mengajukan bantuan.
             </p>
             <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Ke Dashboard</Button>
                <Button onClick={() => navigate(`/households/${createdHouseholdId}/documents`)}>Lanjut Upload Dokumen</Button>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HouseholdWizard;
