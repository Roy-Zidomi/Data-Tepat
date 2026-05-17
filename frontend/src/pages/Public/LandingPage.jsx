import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Shield,
  Users,
  ClipboardList,
  Truck,
  BarChart3,
  CheckCircle,
  ArrowRight,
  FileSearch,
  MessageSquare,
  MapPin,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import useUIStore from '../../store/uiStore';

const features = [
  {
    icon: ClipboardList,
    title: 'Pendataan Terpadu',
    description: 'Registrasi rumah tangga beserta anggota keluarga, kondisi ekonomi, tempat tinggal, dan kerentanan dalam satu platform.',
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  },
  {
    icon: FileSearch,
    title: 'Verifikasi & Skoring',
    description: 'Verifikasi dokumen, validasi survei lapangan, dan skoring kelayakan otomatis untuk transparansi keputusan.',
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  },
  {
    icon: Truck,
    title: 'Distribusi Bantuan',
    description: 'Kelola distribusi dari penjadwalan hingga konfirmasi penyerahan lengkap dengan bukti foto dan tracking status.',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  {
    icon: Shield,
    title: 'Audit & Monitoring',
    description: 'Sistem audit log lengkap, laporan pengawasan independen, dan pelacakan aktivitas pengguna secara real-time.',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  {
    icon: MessageSquare,
    title: 'Pengaduan Warga',
    description: 'Warga dapat mengajukan pengaduan langsung melalui sistem dan memantau status penyelesaiannya.',
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & Laporan',
    description: 'Dashboard real-time untuk setiap peran pengguna dengan statistik, grafik, dan laporan yang komprehensif.',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
];

const roles = [
  { name: 'Admin Utama', desc: 'Pengelolaan pengguna, wilayah, jenis bantuan, dan keputusan final.', icon: Shield },
  { name: 'Admin Staff', desc: 'Verifikasi dokumen, validasi survei, skoring, dan finalisasi keputusan.', icon: FileSearch },
  { name: 'Pengawas', desc: 'Monitoring transparansi, laporan pengawasan, dan audit trail.', icon: BarChart3 },
  { name: 'Relawan', desc: 'Registrasi rumah tangga, survei lapangan, dan pendistribusian bantuan.', icon: Users },
  { name: 'Warga', desc: 'Melihat data keluarga, memantau status bantuan, dan mengajukan pengaduan.', icon: HeartHandshake },
];

const stats = [
  { label: 'Peran Pengguna', value: '5' },
  { label: 'Modul Fitur', value: '12+' },
  { label: 'Alur Verifikasi', value: 'Multi-layer' },
  { label: 'Transparansi', value: '100%' },
];

const LandingPage = () => {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 font-sans text-surface-800 dark:text-surface-200">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200/60 dark:border-surface-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-surface-900 dark:text-white">BantuTepat</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Link
              to="/public-dashboard"
              className="hidden sm:inline-flex text-sm font-medium text-surface-500 hover:text-surface-800 dark:text-surface-400 dark:hover:text-white transition-colors px-3 py-1.5"
            >
              Data Publik
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Masuk
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[30%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-3xl"></div>
          <div className="absolute bottom-[0%] right-[5%] w-[400px] h-[400px] rounded-full bg-sky-400/5 blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 relative z-10">
          <div className="max-w-2xl">

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-surface-900 dark:text-white leading-[1.15] tracking-tight mb-4 sm:mb-5">
              Distribusi Bantuan<br />
              <span className="text-primary-600 dark:text-primary-400">Tepat Sasaran</span> &amp; Transparan
            </h1>
            <p className="text-base sm:text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-6 sm:mb-8 max-w-lg">
              BantuTepat adalah sistem informasi terpadu yang memfasilitasi pendataan, verifikasi, dan penyaluran bantuan sosial secara akurat, akuntabel, dan terpercaya.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98]"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/public-dashboard"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                Lihat Data Publik
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-12 sm:py-20 bg-surface-50 dark:bg-surface-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Fitur Utama</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
              Solusi Lengkap untuk Pengelolaan<br />Bantuan Sosial
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">
              Dari pendataan hingga distribusi, setiap tahap tercatat dan terverifikasi dengan sistem multi-layer yang transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5 hover:shadow-card-hover transition-shadow group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${f.color} mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Alur Kerja</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
              Bagaimana Sistem Bekerja?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              { step: '01', title: 'Pendataan', desc: 'Relawan mendaftar rumah tangga, anggota keluarga, dan mengisi data survei lapangan.', icon: ClipboardList },
              { step: '02', title: 'Verifikasi', desc: 'Admin staff memverifikasi dokumen, validasi survei, dan menjalankan skoring kelayakan.', icon: FileSearch },
              { step: '03', title: 'Keputusan', desc: 'Finalisasi keputusan bantuan, revisi jika diperlukan, dan pelaporan ke admin utama.', icon: CheckCircle },
              { step: '04', title: 'Distribusi', desc: 'Bantuan didistribusikan dengan tracking status dan bukti penyerahan yang terdokumentasi.', icon: Truck },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
                  <div className="text-xs font-bold text-primary-500 mb-3">{item.step}</div>
                  <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mb-3">
                    <item.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles Section ─── */}
      <section className="py-12 sm:py-20 bg-surface-50 dark:bg-surface-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Multi-Role System</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
              5 Peran, Satu Tujuan
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">
              Setiap peran memiliki akses dan tanggung jawab yang berbeda untuk memastikan akuntabilitas sistem.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {roles.map((r) => (
              <div
                key={r.name}
                className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center mx-auto mb-3">
                  <r.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{r.name}</h3>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-surface-900 dark:bg-surface-800 rounded-2xl p-6 sm:p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-[30%] -left-[10%] w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-3xl"></div>
              <div className="absolute -bottom-[20%] -right-[10%] w-[300px] h-[300px] rounded-full bg-primary-400/8 blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                Siap Memulai?
              </h2>
              <p className="text-surface-400 text-sm max-w-md mx-auto mb-8">
                Masuk ke platform BantuTepat untuk mulai mengelola data bantuan sosial secara terpadu, transparan, dan akuntabel.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors"
                >
                  Masuk ke Sistem
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/public-dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-surface-300 bg-white/10 hover:bg-white/15 transition-colors"
                >
                  Lihat Data Publik
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
                <HeartHandshake className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-surface-900 dark:text-white">BantuTepat</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/public-dashboard" className="text-xs text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors">
                Data Publik
              </Link>
              <Link to="/donasi" className="text-xs text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors">
                Donasi
              </Link>
              <Link to="/login" className="text-xs text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors">
                Masuk
              </Link>
            </div>
            <p className="text-[11px] text-surface-400 dark:text-surface-500">
              &copy; {new Date().getFullYear()} BantuTepat. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
