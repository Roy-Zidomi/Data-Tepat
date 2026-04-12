import { useState, useEffect } from 'react';
import { Eye, Search, Truck, Clock, CheckCircle, XCircle, Package, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

const statusConfig = {
  recorded: { label: 'Tercatat', color: 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300', step: 1 },
  allocated: { label: 'Dialokasikan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', step: 2 },
  sent: { label: 'Dikirim', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', step: 3 },
  delivered: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', step: 4 },
  completed: { label: 'Selesai', color: 'bg-emerald-600 text-white', step: 5 },
  failed: { label: 'Gagal', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', step: 0 },
};

const steps = ['recorded', 'allocated', 'sent', 'delivered', 'completed'];

const DistributionTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/distributions', { params: { search, status: filterStatus || undefined, limit: 50 } });
      setData(res.data.data?.records || res.data.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data distribusi');
    } finally { setLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Status Distribusi</h1>
        <p className="text-sm text-surface-500 mt-1">Tracking real-time status penyaluran bantuan ke warga</p>
      </div>

      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Cari kode distribusi / nama penerima..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2.5">
            <option value="">Semua Status</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
      </Card>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <div className="space-y-4">
          {data.map((item) => {
            const scfg = statusConfig[item.status] || statusConfig.recorded;
            const currentStep = scfg.step;
            return (
              <Card key={item.id} className={`hover:shadow-card-hover transition-all ${item.status === 'failed' ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold dark:text-white truncate">{item.recipient_name}</h3>
                        <span className="text-xs text-surface-500">{item.distribution_code} • {item.aidType?.name || '-'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${scfg.color}`}>{scfg.label}</span>
                    </div>

                    {/* Progress tracker */}
                    {item.status !== 'failed' && (
                      <div className="flex items-center gap-1 mt-3">
                        {steps.map((step, idx) => {
                          const stepNum = idx + 1;
                          const isActive = currentStep >= stepNum;
                          const isCurrent = currentStep === stepNum;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                                isActive ? 'bg-primary-500 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                              } ${isCurrent ? 'ring-2 ring-primary-300 ring-offset-1' : ''}`}>
                                {isActive ? '✓' : stepNum}
                              </div>
                              {idx < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 rounded-full ${isActive ? 'bg-primary-400' : 'bg-surface-200 dark:bg-surface-700'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-surface-400 mt-2">
                      {steps.map((step, idx) => (
                        <span key={step} className={`flex-1 text-center ${(statusConfig[step]?.step || 0) <= currentStep ? 'text-primary-600 font-medium' : ''}`}>
                          {statusConfig[step]?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col gap-1 text-xs text-surface-500 lg:text-right flex-shrink-0">
                    {item.planned_date && <div>Jadwal: {new Date(item.planned_date).toLocaleDateString('id-ID')}</div>}
                    {item.distributed_date && <div className="text-emerald-600 font-medium">Diterima: {new Date(item.distributed_date).toLocaleDateString('id-ID')}</div>}
                    <div>Bukti: {item._count?.proofs || 0} file</div>
                  </div>
                </div>
              </Card>
            );
          })}
          {data.length === 0 && (
            <div className="text-center py-10 text-surface-500">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Belum ada data distribusi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DistributionTracking;
