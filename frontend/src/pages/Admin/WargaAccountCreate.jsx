import { useState, useEffect } from 'react';
import { Search, CheckCircle, MapPin, Phone, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Halaman Referensi Warga Layak
// Read-only — hanya menampilkan informasi warga yang eligible.
// Pembuatan akun dilakukan di menu "Daftar Pengguna".
// ─────────────────────────────────────────────────────────────────────────────
const WargaAccountCreate = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchEligible = async () => {
    try {
      const res = await api.get('/admin/warga-eligible');
      setHouseholds(res.data.data || []);
    } catch {
      // Fallback ke data dummy saat backend belum terhubung
      setHouseholds([
        {
          household_id: '1',
          nomor_kk: '3201010101010101',
          nama_kepala_keluarga: 'Budi Santoso',
          nik_kepala_keluarga: '3201011234567890',
          alamat: 'Jl. Merdeka No. 45',
          phone: '08123456789',
          aid_type: 'PKH',
          region: { village: 'Sukamaju', rt: '01', rw: '05', district: 'Bogor Tengah', city_regency: 'Kota Bogor' },
          application_no: 'APP-2026-001',
        },
        {
          household_id: '2',
          nomor_kk: '3201010101010202',
          nama_kepala_keluarga: 'Siti Aminah',
          nik_kepala_keluarga: '3201019876543210',
          alamat: 'Gang Mawar No. 12',
          phone: '08987654321',
          aid_type: 'BPNT',
          region: { village: 'Mekar', rt: '03', rw: '08', district: 'Bogor Tengah', city_regency: 'Kota Bogor' },
          application_no: 'APP-2026-015',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEligible(); }, []);

  const filtered = households.filter((h) =>
    h.nama_kepala_keluarga.toLowerCase().includes(search.toLowerCase()) ||
    h.nomor_kk.includes(search) ||
    h.application_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Antrian Akun Warga</h1>
          <p className="text-sm text-surface-500 mt-1">
            Daftar warga yang pengajuannya disetujui dan belum memiliki akun login.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {households.length} warga layak
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Untuk membuat akun bagi warga di bawah, pergi ke menu{' '}
            <strong>Daftar Pengguna</strong> dan klik <strong>"Buat Akun Baru"</strong>,
            pilih peran <strong>Warga</strong>, lalu isi data sesuai informasi di halaman ini.
            Sistem akan men-generate password sementara secara otomatis.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={ArrowRight}
          onClick={() => navigate('/users')}
          className="flex-shrink-0"
        >
          Daftar Pengguna
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-surface-50 dark:bg-surface-800/50">
        <div className="max-w-md">
          <Input
            icon={Search}
            placeholder="Cari nama, No KK, atau No Pengajuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-60" />
          <p className="font-semibold text-surface-700 dark:text-surface-300">
            Semua warga yang layak sudah memiliki akun!
          </p>
          <p className="text-sm text-surface-500 mt-1">Tidak ada data yang perlu diproses saat ini.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((h) => (
            <Card
              key={h.household_id}
              className="relative overflow-hidden border-l-4 border-l-green-500"
            >
              <div className="p-5">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded uppercase tracking-wider">
                    Layak Bantuan
                  </span>
                  <span className="text-xs text-surface-500">{h.application_no}</span>
                </div>

                <h3 className="text-lg font-bold text-surface-900 dark:text-white leading-tight">
                  {h.nama_kepala_keluarga}
                </h3>
                <p className="text-xs text-surface-400 font-mono mt-1">
                  NIK: {h.nik_kepala_keluarga || '—'} &nbsp;|&nbsp; KK: {h.nomor_kk}
                </p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-start gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-surface-400" />
                    <span>
                      {h.alamat}, {h.region?.village}, {h.region?.district}
                    </span>
                  </div>
                  {h.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                      <Phone className="w-4 h-4 text-surface-400" />
                      {h.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Program: {h.aid_type}
                  </div>
                </div>

                {/* Reference data untuk admin */}
                <div className="mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
                  <p className="text-xs text-surface-400 italic">
                    Gunakan data di atas saat membuat akun di menu Daftar Pengguna.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WargaAccountCreate;
