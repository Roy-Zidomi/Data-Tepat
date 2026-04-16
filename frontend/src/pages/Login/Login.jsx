import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';
import { HeartHandshake, Mail, Lock, LogIn, ChevronDown } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('warga');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'password'
      ? clampText(value, FORM_LIMITS.password)
      : clampText(value, FORM_LIMITS.email);
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrUsername || !formData.password) {
      toast.error('Silakan isi username dan password.');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.login(
        formData.emailOrUsername,
        formData.password,
        selectedRole
      );
      const { user } = res.data.data;
      login(user);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('[Login.jsx] Error details:', error);
      toast.error(error.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface-50 dark:bg-surface-950 font-sans">
      {/* Left Pane - Branding & Info (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary-600 dark:bg-primary-900 overflow-hidden flex-col justify-between p-12">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-500/30 dark:bg-primary-800/30 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-3xl mix-blend-screen"></div>
        </div>

        {/* Logo/Brand */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl shadow-sm">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">BantuTepat</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg mt-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Distribusi Bantuan Tepat Sasaran & Transparan.
          </h1>
          <p className="text-lg text-primary-100 dark:text-primary-200/80 leading-relaxed mb-8 font-medium">
            Platform terpadu untuk memfasilitasi pendataan, verifikasi, dan penyaluran bantuan sosial bagi masyarakat yang membutuhkan secara akurat dan terpercaya.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-semibold text-white/90 bg-black/10 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Sistem Aktif
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30"></div>
            <div>Verifikasi Real-time</div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-sm text-primary-200 mt-20 font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi &mdash; Platform BantuTepat</p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-primary-600 dark:text-primary-400">
          <HeartHandshake className="w-6 h-6" />
          <span className="text-xl font-bold">BantuTepat</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fade-in my-auto pt-10 lg:pt-0">
          {/* Form Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2.5 text-sm sm:text-base font-medium">
              Silakan masuk ke akun Anda untuk mengakses sistem.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6 mt-8">
            {/* Login Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold tracking-wide text-surface-700 dark:text-surface-300 uppercase relative top-1">
                Masuk Sebagai
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-semibold shadow-sm cursor-pointer"
                >
                  <option value="warga">Masyarakat / Warga</option>
                  <option value="relawan">Relawan Lapangan</option>
                  <option value="pengawas">Pengawas Program</option>
                  <option value="admin_staff">Admin Staff</option>
                  <option value="admin_main">Admin Utama</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wide text-surface-700 dark:text-surface-300 uppercase relative top-1">
                  Username atau Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    placeholder="Masukkan username atau email"
                    required
                    maxLength={FORM_LIMITS.email}
                    className="w-full bg-white dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium placeholder:font-normal shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold tracking-wide text-surface-700 dark:text-surface-300 uppercase relative top-1">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    required
                    maxLength={FORM_LIMITS.password}
                    className="w-full bg-white dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all tracking-widest font-medium placeholder:font-normal placeholder:tracking-normal shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 -ml-1" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="pt-8 text-center lg:hidden">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
              &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
