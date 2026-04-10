import { useState, useEffect } from 'react';
import {
  UserPlus, Search, CheckCircle, Copy, Eye, EyeOff,
  MapPin, Phone, Key, User, Mail, AlertCircle, X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Mini Modal Component ────────────────────────────────────────────────────
const CreateAccountModal = ({ household, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: household.nama_kepala_keluarga || '',
    email: '',
    phone: household.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nama wajib diisi'); return; }
    setLoading(true);
    try {
      const res = await api.post('/admin/create-warga', {
        household_id: household.household_id,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
      });
      setCreatedAccount(res.data.data);
      toast.success('Akun warga berhasil dibuat!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Buat Akun Warga</h2>
            <p className="text-sm text-surface-500 mt-0.5">Untuk KK: {household.nomor_kk}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="p-6">
          {!createdAccount ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Sistem akan otomatis membuat <strong>password acak</strong> dan <strong>username unik</strong>. 
                  Harap simpan dan sampaikan ke Warga untuk login pertama kali.
                </p>
              </div>

              <Input
                label="Nama Lengkap Warga"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={User}
                required
              />

              <Input
                label="Email (Opsional, untuk pengiriman notifikasi)"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
                placeholder="email@contoh.com"
              />

              <Input
                label="No. Telepon / WhatsApp"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                icon={Phone}
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
                <Button type="submit" className="flex-1" loading={loading} icon={Key}>
                  Generate & Buat Akun
                </Button>
              </div>
            </form>
          ) : (
            /* ─── Success View ─── */
            <div className="space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9" />
              </div>
              <p className="text-center text-sm text-surface-600 dark:text-surface-400 font-medium">
                Akun berhasil dibuat! OTP untuk aktivasi telah dikirimkan ke nomor WhatsApp warga ({createdAccount.phone}).
              </p>

              <div className="bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 divide-y divide-surface-200 dark:divide-surface-700 overflow-hidden">
                {/* Username */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-surface-500 uppercase tracking-wide">Username</p>
                    <p className="font-mono font-bold text-surface-900 dark:text-white text-sm mt-0.5">
                      {createdAccount.username}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(createdAccount.username)}
                    className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-surface-500" />
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Warga harus mengakses menu "Aktivasi Akun" di halaman login untuk memasukkan OTP dan mengatur kata sandinya.
                </p>
              </div>

              <Button className="w-full" onClick={onClose}>Selesai</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const WargaAccountCreate = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  const fetchEligible = async () => {
    try {
      const res = await api.get('/admin/warga-eligible');
      setHouseholds(res.data.data || []);
    } catch (err) {
      // Fallback to mock data when backend not yet connected
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEligible(); }, []);

  const filtered = households.filter(h =>
    h.nama_kepala_keluarga.toLowerCase().includes(search.toLowerCase()) ||
    h.nomor_kk.includes(search) ||
    h.application_no?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {selectedHousehold && (
        <CreateAccountModal
          household={selectedHousehold}
          onClose={() => setSelectedHousehold(null)}
          onSuccess={() => {
            setSelectedHousehold(null);
            fetchEligible(); // Refresh list
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Buat Akun Portal Warga</h1>
          <p className="text-sm text-surface-500 mt-1">
            Daftar warga yang pengajuannya telah <strong>Disetujui</strong> dan siap dibuatkan akun login.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl border border-green-200 dark:border-green-800 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {households.length} warga menunggu akun
        </div>
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
          <p className="font-semibold text-surface-700 dark:text-surface-300">Semua warga yang layak sudah memiliki akun!</p>
          <p className="text-sm text-surface-500 mt-1">Tidak ada data yang perlu diproses saat ini.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(h => (
            <Card
              key={h.household_id}
              className="relative overflow-hidden border-l-4 border-l-green-500 hover:shadow-lg transition-all hover:-translate-y-0.5"
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
                <p className="text-xs text-surface-400 font-mono mt-1">NIK: {h.nik_kepala_keluarga || '-'} | KK: {h.nomor_kk}</p>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-start gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-surface-400" />
                    <span>{h.alamat}, {h.region?.village}, {h.region?.district}</span>
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

                <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                  <Button
                    size="sm"
                    icon={UserPlus}
                    onClick={() => setSelectedHousehold(h)}
                    shadow
                  >
                    Buatkan Akun Login
                  </Button>
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
