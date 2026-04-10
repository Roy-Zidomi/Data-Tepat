import { useState } from 'react';
import { Truck, Search, CheckCircle, Package, Camera } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const DistributionList = () => {
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  // Mock data distributions
  const [distributions, setDistributions] = useState([
    {
       id: 1,
       application_no: 'APP-2026-001',
       household: 'Budi Santoso',
       aid_name: 'Bantuan Pangan Non Tunai',
       status: 'pending',
       date_scheduled: '2026-04-10'
    },
    {
       id: 2,
       application_no: 'APP-2026-015',
       household: 'Siti Aminah',
       aid_name: 'BLT UMKM',
       status: 'distributed',
       date_scheduled: '2026-04-03'
    }
  ]);

  const handleUpdateStatus = (id) => {
    setUpdating(id);
    setTimeout(() => {
      setDistributions(prev => prev.map(d => d.id === id ? { ...d, status: 'distributed' } : d));
      toast.success('Status distribusi berhasil diperbarui menjadi Tersalurkan!');
      setUpdating(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Penyaluran Penugasan</h1>
          <p className="text-sm text-surface-500 mt-1">
            Manajemen logistik dan pelacakan BAST (Berita Acara Serah Terima) ke Warga.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
         <div className="max-w-md">
           <Input 
             icon={Search} 
             placeholder="Cari No Pengajuan atau Nama Warga..." 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
           />
         </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {distributions.map(dist => (
          <Card key={dist.id} className={`p-0 overflow-hidden border-l-4 ${dist.status === 'distributed' ? 'border-l-green-500' : 'border-l-amber-500'}`}>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded">
                       {dist.application_no}
                     </span>
                     <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${dist.status === 'distributed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                       {dist.status}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold dark:text-white mt-1">{dist.household}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400 mt-2">
                     <Package className="w-4 h-4 text-surface-400" />
                     {dist.aid_name} &bull; Jadwal {dist.date_scheduled}
                  </div>
               </div>
               
               <div className="flex items-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                 {dist.status === 'pending' ? (
                   <>
                     <Button variant="outline" size="sm" icon={Camera}>Foto Bukti BAST</Button>
                     <Button size="sm" onClick={() => handleUpdateStatus(dist.id)} loading={updating === dist.id} shadow>
                       Tandai Selesai Dikirim
                     </Button>
                   </>
                 ) : (
                   <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                     <CheckCircle className="w-5 h-5" /> Distribusi Selesai
                   </span>
                 )}
               </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DistributionList;
