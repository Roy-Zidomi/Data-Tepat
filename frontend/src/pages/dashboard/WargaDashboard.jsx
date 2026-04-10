import { useState, useEffect } from 'react';
import { Clock, Plus, ArrowRight, ShieldCheck, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WargaDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyApps = async () => {
      try {
        setLoading(true);
        const res = await api.get('/aid-applications/my-applications');
        setApplications(res.data.data || []);
      } catch (error) {
        toast.error('Gagal memuat histori pengajuan');
      } finally {
        setLoading(false);
      }
    };
    fetchMyApps();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard Warga</h1>
          <p className="text-sm text-surface-500 mt-1">
            Pantau status verifikasi dan pengajuan bantuan Anda.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/applications/new')}>
          Ajukan Bantuan Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Actions & Info */}
        <div className="space-y-6">
           <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/50">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h2 className="font-semibold text-primary-900 dark:text-primary-100">Kepatuhan Data</h2>
              </div>
              <p className="text-sm text-primary-800 dark:text-primary-200 mb-4">
                Pastikan data Kartu Keluarga Anda sudah lengkap sebelum mengajukan permohonan.
              </p>
              <Button size="sm" variant="outline" className="w-full bg-white dark:bg-surface-800" onClick={() => navigate('/households/create')}>
                Perbarui Profil KK
              </Button>
           </Card>

           <Card>
              <h2 className="font-semibold mb-3 dark:text-white">Butuh Bantuan?</h2>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                Jika terjadi kesalahan data atau penyaluran yang tidak tepat, Anda dapat membuat laporan pengaduan.
              </p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/complaints/create')}>
                Tulis Pengaduan
              </Button>
           </Card>
        </div>

        {/* Right Column: Application Timeline */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold dark:text-white mb-2">Riwayat Pengajuan</h2>
          
          {applications.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <FileText className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 font-medium whitespace-pre-line">
                Belum ada pengajuan bantuan.{"\n"}Silakan tekan 'Ajukan Bantuan Baru' untuk memulai.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
               {applications.map((app) => (
                 <Card key={app.id} className="relative overflow-hidden group hover:border-primary-300 transition-colors">
                   {/* Decorative side bar */}
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                   
                   <div className="flex flex-col sm:flex-row justify-between gap-4 pl-3">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded">
                           {app.application_no}
                         </span>
                         <StatusBadge statusMap={APPLICATION_STATUS} value={app.status} />
                       </div>
                       <h3 className="font-bold text-lg dark:text-white">{app.aidType?.name || 'Program Bantuan'}</h3>
                       <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                         KK: {app.household?.nama_kepala_keluarga} ({app.household?.nomor_kk})
                       </p>
                       <div className="flex items-center gap-1.5 mt-3 text-xs text-surface-500">
                         <Clock className="w-3.5 h-3.5" />
                         <span>Diajukan pada {formatDate(app.submission_date || app.created_at)}</span>
                       </div>
                     </div>
                     
                     <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-surface-200 dark:border-surface-700 pt-3 sm:pt-0 sm:pl-4">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Scoring / Kelayakan</p>
                          {app.scoringResults && app.scoringResults.length > 0 ? (
                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {app.scoringResults[0]?.priority_level || 'Belum Dihitung'}
                            </p>
                          ) : (
                            <p className="text-sm text-surface-400">Tahap Survei</p>
                          )}
                        </div>
                     </div>
                   </div>
                   
                   {/* Status timeline hints */}
                   <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                      <div className="flex items-center justify-between text-xs font-medium px-1">
                         <div className={`flex flex-col items-center gap-1.5 ${app.status !== 'draft' ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`}>
                           <CheckCircle className="w-5 h-5" />
                           <span>Dikirim</span>
                         </div>
                         <div className="h-0.5 flex-1 bg-surface-200 dark:bg-surface-700 mx-2" />
                         <div className={`flex flex-col items-center gap-1.5 ${['under_review', 'verified', 'approved', 'rejected'].includes(app.status) ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`}>
                           <CheckCircle className="w-5 h-5" />
                           <span>Disurvei</span>
                         </div>
                         <div className="h-0.5 flex-1 bg-surface-200 dark:bg-surface-700 mx-2" />
                         <div className={`flex flex-col items-center gap-1.5 ${['approved'].includes(app.status) ? 'text-green-500' : ['rejected'].includes(app.status) ? 'text-red-500' : 'text-surface-400'}`}>
                           {app.status === 'rejected' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                           <span>{app.status === 'rejected' ? 'Ditolak' : 'Selesai'}</span>
                         </div>
                      </div>
                   </div>
                 </Card>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WargaDashboard;
