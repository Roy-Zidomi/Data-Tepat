import { useState } from 'react';
import { MessageSquare, Check, X, Search, Clock, Home } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ComplaintReview = () => {
  const [search, setSearch] = useState('');
  
  // Dummy complaint data
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      complaint_type: 'data_error',
      description: 'Saya sudah mendaftar PKH tapi di sistem tulisannya NIK tidak valid padahal di Capil sudah online.',
      status: 'pending',
      created_at: '2026-04-03T08:00:00Z',
      household: { nama_kepala_keluarga: 'Budi Santoso' }
    },
    {
      id: 2,
      complaint_type: 'distribution_issue',
      description: 'Bantuan sembako yang dijadwalkan tanggal 1 lalu belum kami terima di lapangan.',
      status: 'reviewed',
      created_at: '2026-04-01T09:00:00Z',
      household: { nama_kepala_keluarga: 'Siti Aminah' }
    }
  ]);

  const handleResolve = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
    toast.success('Keluhan ditandai sebagai Selesai / Ditanggapi.');
  };

  const getComplaintLabel = (type) => {
    switch (type) {
      case 'data_error': return 'Kesalahan Data';
      case 'distribution_issue': return 'Isu Distribusi';
      case 'fraud': return 'Indikasi Kecurangan';
      default: return 'Lainnya';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Review Pengaduan</h1>
          <p className="text-sm text-surface-500 mt-1">
            Analisis dan tindak lanjuti laporan serta keluhan yang disampaikan oleh Warga.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
         <div className="max-w-md">
           <Input 
             icon={Search} 
             placeholder="Cari kata kunci keluhan..." 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
           />
         </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {complaints.filter(c => c.description.toLowerCase().includes(search.toLowerCase())).map(c => (
           <Card key={c.id}>
             <div className="flex flex-col md:flex-row gap-6">
                {/* Info Keluhan */}
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-2">
                     <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                     }`}>
                       {c.status}
                     </span>
                     <span className="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded">
                       {getComplaintLabel(c.complaint_type)}
                     </span>
                   </div>
                   
                   <p className="text-surface-900 dark:text-surface-100 text-sm leading-relaxed whitespace-pre-wrap">
                      "{c.description}"
                   </p>
                   
                   <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-surface-500">
                     <div className="flex items-center gap-1.5"><Home className="w-4 h-4" /> Pelapor: {c.household.nama_kepala_keluarga}</div>
                     <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Masuk pada: {new Date(c.created_at).toLocaleString()}</div>
                   </div>
                </div>

                {/* Aksi Petugas */}
                <div className="w-full md:w-48 xl:w-64 border-t md:border-t-0 md:border-l border-surface-200 dark:border-surface-700 pt-4 md:pt-0 md:pl-6 flex flex-col gap-2 justify-center">
                   {c.status !== 'resolved' ? (
                     <>
                        <Button className="w-full" size="sm" onClick={() => handleResolve(c.id)}>Tandai Selesai</Button>
                        <Button className="w-full" size="sm" variant="outline" icon={MessageSquare}>Beri Tanggapan</Button>
                     </>
                   ) : (
                     <div className="text-center text-sm font-bold text-green-600 dark:text-green-400 flex flex-col items-center gap-1">
                        <Check className="w-6 h-6" /> Kasus Ditutup
                     </div>
                   )}
                </div>
             </div>
           </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplaintReview;
