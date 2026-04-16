import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, Eye, Search, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import surveyService from '../../services/surveyService';

const surveyStatusConfig = {
  completed: { label: 'Terkirim', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  in_progress: { label: 'Berjalan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  scheduled: { label: 'Terjadwal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const recommendationLabel = {
  strongly_recommended: 'Sangat Layak',
  recommended: 'Layak',
  conditional: 'Bersyarat',
  not_recommended: 'Tidak Layak',
};

const MySurveyResults = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (searchValue = search, statusValue = status) => {
    try {
      setLoading(true);
      setError('');
      const res = await surveyService.getMyResults({
        search: searchValue || undefined,
        status: statusValue || undefined,
        page: 1,
        limit: 50,
      });
      setRecords(res.data.data?.records || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat hasil survei.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Hasil Survei Saya</h1>
        <p className="text-sm text-surface-500 mt-1">
          Riwayat hasil survei yang sudah kamu kirim ke admin staff.
        </p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData(search, status);
          }}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="flex-1 min-w-[220px]">
            <Input
              icon={Search}
              placeholder="Cari nama KK atau nomor KK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="completed">Terkirim</option>
            <option value="in_progress">Berjalan</option>
            <option value="scheduled">Terjadwal</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {!error && records.length === 0 && (
        <Card>
          <div className="py-10 text-center text-surface-500">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Belum ada hasil survei yang dikirim.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {records.map((survey) => {
          const statusCfg = surveyStatusConfig[survey.status] || surveyStatusConfig.completed;
          const household = survey.application?.household;

          return (
            <Card key={survey.id} className="hover:shadow-card-hover transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white">{household?.nama_kepala_keluarga || '-'}</h3>
                    <p className="text-xs text-surface-500 mt-1">KK: {household?.nomor_kk || '-'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-surface-600 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span>{new Date(survey.survey_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-surface-400" />
                    <span>{survey.application?.application_no || '-'}</span>
                  </div>
                </div>

                <div className="text-xs text-surface-500">
                  Checklist: {survey._count?.checklists || 0} | Foto: {survey._count?.photos || 0}
                </div>

                <div className="rounded-lg bg-surface-50 dark:bg-surface-900/40 p-3 text-xs">
                  <span className="font-semibold text-surface-700 dark:text-surface-200">Rekomendasi:</span>{' '}
                  <span className="text-surface-600 dark:text-surface-300">
                    {recommendationLabel[survey.recommendation] || survey.recommendation || '-'}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  icon={Eye}
                  onClick={() => navigate(`/surveys/${household?.id}`)}
                >
                  Buka Form Survei
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MySurveyResults;
