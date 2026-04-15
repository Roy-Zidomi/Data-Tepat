import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Flag, CreditCard, Home, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * DataValidation — Deteksi Duplikasi Data (Revisi #3 & #8)
 * Admin Staff hanya bisa: Lihat + Tandai (flag)
 * Admin Staff TIDAK bisa: Hapus / Gabung / Edit
 * Scope: NIK + Nomor KK saja
 */
const DataValidation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggedItems, setFlaggedItems] = useState(new Set());

  useEffect(() => { fetchDuplicates(); }, []);

  const fetchDuplicates = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.get('/admin-views/duplicate-check');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menjalankan pengecekan duplikasi');
    } finally { setLoading(false); }
  };

  const handleFlag = (type, identifier) => {
    const key = `${type}:${identifier}`;
    setFlaggedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        toast.success(`Flag dibatalkan: ${identifier}`);
      } else {
        next.add(key);
        toast.success(`Ditandai sebagai duplikat: ${identifier}`);
      }
      return next;
    });
  };

  const isFlagged = (type, identifier) => flaggedItems.has(`${type}:${identifier}`);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Verifikasi Data</h1>
          <p className="text-sm text-surface-500 mt-1">Deteksi duplikasi NIK dan Nomor KK untuk meningkatkan kualitas data</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={fetchDuplicates}>Scan Ulang</Button>
      </div>

      {error ? <Alert type="error" title="Error">{error}</Alert> : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Duplikat NIK</p>
                  <p className="text-3xl font-black text-amber-800 dark:text-amber-300">{data?.totalDuplicateNiks || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400">Duplikat Nomor KK</p>
                  <p className="text-3xl font-black text-red-800 dark:text-red-300">{data?.totalDuplicateKks || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Duplicate NIK List */}
          {data?.duplicateNiks?.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" /> Duplikat NIK
              </h2>
              <div className="space-y-4">
                {data.duplicateNiks.map((dup, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isFlagged('nik', dup.nik) ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold dark:text-white">NIK: {dup.nik}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-bold">{dup.count}x ditemukan</span>
                      </div>
                      <Button
                        size="xs"
                        variant={isFlagged('nik', dup.nik) ? 'danger' : 'outline'}
                        icon={Flag}
                        onClick={() => handleFlag('nik', dup.nik)}
                      >
                        {isFlagged('nik', dup.nik) ? 'Flagged' : 'Tandai'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {dup.members.map((m, j) => (
                        <div key={j} className="flex items-center justify-between text-sm px-3 py-2 bg-white dark:bg-surface-900 rounded-lg">
                          <div>
                            <span className="font-medium dark:text-white">{m.name}</span>
                            <span className="text-xs text-surface-500 ml-2">KK: {m.nomor_kk}</span>
                          </div>
                          <span className="text-xs text-surface-400">KepKel: {m.household_head}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Duplicate KK List */}
          {data?.duplicateKks?.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-red-500" /> Duplikat Nomor KK
              </h2>
              <div className="space-y-4">
                {data.duplicateKks.map((dup, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isFlagged('kk', dup.nomor_kk) ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold dark:text-white">KK: {dup.nomor_kk}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold">{dup.count}x ditemukan</span>
                      </div>
                      <Button
                        size="xs"
                        variant={isFlagged('kk', dup.nomor_kk) ? 'danger' : 'outline'}
                        icon={Flag}
                        onClick={() => handleFlag('kk', dup.nomor_kk)}
                      >
                        {isFlagged('kk', dup.nomor_kk) ? 'Flagged' : 'Tandai'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {dup.households.map((h, j) => (
                        <div key={j} className="flex items-center justify-between text-sm px-3 py-2 bg-white dark:bg-surface-900 rounded-lg">
                          <div>
                            <span className="font-medium dark:text-white">{h.nama_kepala_keluarga}</span>
                            <span className="text-xs text-surface-500 ml-2">{h.alamat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(!data?.duplicateNiks?.length && !data?.duplicateKks?.length) && (
            <Card className="text-center py-12">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-emerald-500 opacity-60" />
              <p className="text-lg font-bold text-surface-700 dark:text-surface-300">Tidak Ada Duplikasi Terdeteksi</p>
              <p className="text-sm text-surface-500 mt-1">Data NIK dan Nomor KK sudah bersih.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DataValidation;
