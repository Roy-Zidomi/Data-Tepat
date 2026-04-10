import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileCheck, Search, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
// import api from '../../services/api'; 
import toast from 'react-hot-toast';

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Mock data for Relawan's Surveys
  const mockSurveys = [
    {
      id: 1,
      status: 'pending',
      survey_date: '2026-04-05',
      application: {
        application_no: 'APP-2026-001',
        household: {
          nama_kepala_keluarga: 'Budi Santoso',
          alamat: 'Jl. Merdeka No. 45, Kecamatan Sukamaju',
          region: { village: 'Sukamaju', rt: '01', rw: '05' }
        }
      }
    },
    {
      id: 2,
      status: 'completed',
      survey_date: '2026-04-01',
      application: {
        application_no: 'APP-2026-043',
        household: {
          nama_kepala_keluarga: 'Siti Aminah',
          alamat: 'Perumahan Griya Indah Blok C2',
          region: { village: 'Mekar', rt: '03', rw: '08' }
        }
      }
    }
  ];

  useEffect(() => {
    // In a real scenario: api.get('/surveys/my-tasks')
    setTimeout(() => {
      setSurveys(mockSurveys);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = surveys.filter(s => 
    s.application.household.nama_kepala_keluarga.toLowerCase().includes(search.toLowerCase()) ||
    s.application.application_no.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Daftar Survei Lapangan</h1>
          <p className="text-sm text-surface-500 mt-1">
            Daftar tugas pengecekan kelayakan alamat pendaftar.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
         <div className="max-w-md">
           <Input 
             icon={Search} 
             placeholder="Cari nama KK atau Nomor Pengajuan..." 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
           />
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
           <div className="col-span-full py-12 text-center text-surface-500">
             <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>Tidak ada tugas survei ditemukan.</p>
           </div>
        ) : (
          filtered.map(survey => (
            <Card key={survey.id} className="relative overflow-hidden hover:border-primary-300 transition-all group">
              {survey.status === 'pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
              {survey.status === 'completed' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />}
              
              <div className="pl-3 p-4">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded">
                       {survey.application.application_no}
                     </span>
                     <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${survey.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                       {survey.status}
                     </span>
                   </div>
                   <div className="flex items-center text-xs text-surface-500 gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(survey.survey_date)}
                   </div>
                </div>

                <h3 className="text-lg font-bold dark:text-white leading-tight">
                  {survey.application.household.nama_kepala_keluarga}
                </h3>
                
                <div className="mt-3 space-y-2 flex-grow">
                   <div className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                     <MapPin className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                     <span>
                       {survey.application.household.alamat} <br/>
                       Desa {survey.application.household.region.village} RT {survey.application.household.region.rt}/{survey.application.household.region.rw}
                     </span>
                   </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                   {survey.status === 'pending' ? (
                      <Button size="sm" onClick={() => navigate(`/surveys/${survey.id}`)}>Buka Form Survei</Button>
                   ) : (
                      <Button size="sm" variant="outline" icon={CheckCircle}>Lihat Hasil</Button>
                   )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SurveyList;
