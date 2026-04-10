import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS } from '../../utils/constants';

const ApplicationList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // Dummy data
  const [applications, setApplications] = useState([
    {
      id: 1,
      application_no: 'APP-2026-001',
      status: 'submitted',
      household: { nama_kepala_keluarga: 'Budi Santoso', nomor_kk: '3201010101010101' },
      aidType: { name: 'Bantuan Pangan Non Tunai' },
      submission_date: '2026-04-01T10:00:00Z',
      scoringResults: [{ priority_level: 'High', score: 85.5 }]
    },
    {
      id: 2,
      application_no: 'APP-2026-002',
      status: 'under_review',
      household: { nama_kepala_keluarga: 'Ahmad Yani', nomor_kk: '3201010101010102' },
      aidType: { name: 'PKH' },
      submission_date: '2026-04-02T11:30:00Z',
      scoringResults: [{ priority_level: 'Medium', score: 62.0 }]
    }
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Review Pengajuan Bantuan</h1>
          <p className="text-sm text-surface-500 mt-1">
            Daftar antrean aplikasi warga yang membutuhkan supervisi dan penentuan kelayakan.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50 flex flex-col sm:flex-row gap-4">
         <div className="flex-1">
           <Input 
             icon={Search} 
             placeholder="Cari No Pengajuan atau Nama KK..." 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
           />
         </div>
         <Button variant="outline" icon={Filter}>Filter Status</Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">No. Registrasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Kepala Keluarga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Rekomendasi AI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-surface-200 dark:bg-surface-900 dark:divide-surface-800">
               {applications.map(app => (
                 <tr key={app.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{app.application_no}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium dark:text-white">{app.household.nama_kepala_keluarga}</div>
                     <div className="text-xs text-surface-500">{app.household.nomor_kk}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">{app.aidType.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Activity className={`w-4 h-4 ${app.scoringResults[0]?.priority_level === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                        <span className="text-sm font-bold dark:text-white">{app.scoringResults[0]?.score}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <StatusBadge statusMap={APPLICATION_STATUS} value={app.status} />
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <Button size="sm" variant="ghost" onClick={() => navigate(`/applications/${app.id}`)}>
                       <Eye className="w-4 h-4 mr-2" /> Detail
                     </Button>
                   </td>
                 </tr>
               ))}
               {applications.length === 0 && (
                 <tr>
                   <td colSpan="6" className="px-6 py-10 text-center text-surface-500">
                     Tidak ada data pengajuan yang ditemukan.
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationList;
