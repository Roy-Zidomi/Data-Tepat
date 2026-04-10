import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, Camera, MapPin, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { APPLICATION_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState(false);

  // Mock application data
  const app = {
    id: id,
    application_no: `APP-2026-00${id}`,
    status: 'under_review',
    submission_date: '2026-04-02T11:30:00Z',
    household: {
      nama_kepala_keluarga: 'Ahmad Yani',
      nomor_kk: '3201010101010102',
      alamat: 'Kampung Manggis RT 02 / RW 04',
    },
    aidType: { name: 'Bantuan Langsung Tunai (BLT)' },
    scoringResults: [{ priority_level: 'High', score: 85.5, recommendation: 'Sangat Layak (Kritis)' }],
    documents: [
       { id: 1, type: 'KTP', status: 'verified', url: '#' },
       { id: 2, type: 'SKTM', status: 'verified', url: '#' }
    ],
    surveys: [
       { id: 1, relawan: 'Relawan Toni', status: 'completed', date: '2026-04-03', note: 'Kondisi rumah kayu lapuk, memiliki 2 balita.' }
    ]
  };

  const handleDecision = (decision) => {
    setLoadingAction(true);
    setTimeout(() => {
      setLoadingAction(false);
      toast.success(`Pengajuan berhasil di-${decision === 'approved' ? 'Setujui' : 'Tolak'}`);
      navigate('/applications');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/applications')} className="mb-2 -ml-4">
        Kembali ke Antrean
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-200 dark:border-surface-700 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{app.application_no}</h1>
            <StatusBadge statusMap={APPLICATION_STATUS} value={app.status} />
          </div>
          <p className="text-sm text-surface-500">
            {app.household.nama_kepala_keluarga} | Diajukan untuk {app.aidType.name}
          </p>
        </div>
        
        {app.status === 'under_review' && (
           <div className="flex items-center gap-3">
              <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" icon={XCircle} onClick={() => handleDecision('rejected')} loading={loadingAction}>Tolak</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={CheckCircle} onClick={() => handleDecision('approved')} loading={loadingAction}>Setujui Kelayakan</Button>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6">
              <h2 className="text-lg font-bold dark:text-white mb-4 border-b pb-2 dark:border-surface-700">Profil Keluarga</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-surface-500">Nama Kepala Keluarga</p>
                  <p className="font-medium dark:text-white">{app.household.nama_kepala_keluarga}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Nomor Kartu Keluarga</p>
                  <p className="font-medium dark:text-white">{app.household.nomor_kk}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-xs text-surface-500">Alamat Lapangan</p>
                  <div className="flex items-start gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                    <p className="font-medium dark:text-white">{app.household.alamat}</p>
                  </div>
                </div>
              </div>
           </Card>

           <Card className="p-6">
              <h2 className="text-lg font-bold dark:text-white mb-4 border-b pb-2 dark:border-surface-700">Riwayat Survei & Bukti Lapangan</h2>
              {app.surveys.map(s => (
                <div key={s.id} className="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg border border-surface-200 dark:border-surface-700">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-sm font-bold text-surface-900 dark:text-white">Ditangani: {s.relawan}</span>
                     <span className="text-xs text-surface-500">{s.date}</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">"{s.note}"</p>
                  <div className="mt-4 flex gap-2">
                     <Button size="sm" variant="outline" icon={Camera}>Lihat Foto Rumah</Button>
                     <Button size="sm" variant="outline" icon={FileText}>Checklist Relawan</Button>
                  </div>
                </div>
              ))}
           </Card>
        </div>

        {/* Right Col: Scoring & Tools */}
        <div className="space-y-6">
           <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
              <div className="flex items-center gap-2 mb-4 opacity-90">
                 <Shield className="w-5 h-5" />
                 <h2 className="font-bold">Analisis Rekomendasi (AI)</h2>
              </div>
              <div className="text-center py-4">
                 <p className="text-5xl font-black">{app.scoringResults[0]?.score}</p>
                 <p className="text-sm mt-2 opacity-90 uppercase tracking-widest">{app.scoringResults[0]?.priority_level}</p>
                 <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                   {app.scoringResults[0]?.recommendation}
                 </div>
              </div>
           </Card>

           <Card>
              <h2 className="font-bold dark:text-white mb-3">Dokumen Mandiri Warga</h2>
              <div className="space-y-2">
                {app.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-surface-50 dark:hover:bg-surface-800 rounded">
                     <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-surface-400" />
                       <span className="text-sm font-medium dark:text-white">{doc.type}</span>
                     </div>
                     <span className="text-xs text-green-500 px-2 py-0.5 bg-green-50 rounded uppercase font-bold">{doc.status}</span>
                  </div>
                ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
