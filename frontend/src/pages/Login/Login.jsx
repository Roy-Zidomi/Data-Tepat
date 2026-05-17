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
      const { user, token, csrfToken } = res.data.data;
      login(user, token, csrfToken);
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
    <div className="flex min-h-screen w-full bg-white dark:bg-surface-950 font-sans">
      {/* Left Pane - Branding & Info (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-900 dark:bg-surface-900 overflow-hidden flex-col justify-between p-12">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-600/15 blur-3xl"></div>
          <div className="absolute bottom-[10%] -right-[15%] w-[50%] h-[50%] rounded-full bg-primary-400/10 blur-3xl"></div>
        </div>

        {/* Logo/Brand */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BantuTepat</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-5 tracking-tight">
            Distribusi Bantuan<br />Tepat Sasaran &amp; Transparan.
          </h1>
          <p className="text-base text-surface-300 leading-relaxed mb-8">
            Platform terpadu untuk memfasilitasi pendataan, verifikasi, dan penyaluran bantuan sosial bagi masyarakat yang membutuhkan secara akurat dan terpercaya.
          </p>
          

        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-surface-500">
          <p>&copy; {new Date().getFullYear()} BantuTepat &mdash; Hak Cipta Dilindungi</p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-10 sm:p-12 relative overflow-y-auto bg-white dark:bg-surface-950">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-5 lg:hidden flex items-center gap-2 text-surface-900 dark:text-white">
          <HeartHandshake className="w-5 h-5 text-primary-600" />
          <span className="text-lg font-bold">BantuTepat</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-fade-in my-auto pt-12 lg:pt-0">
          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-1.5 text-sm">
              Masuk ke akun Anda untuk mengakses sistem.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Login Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Masuk Sebagai
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full appearance-none bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-sm font-medium cursor-pointer"
                >
                  <option value="warga">Masyarakat / Warga</option>
                  <option value="relawan">Relawan Lapangan</option>
                  <option value="pengawas">Pengawas Program</option>
                  <option value="admin_staff">Admin Staff</option>
                  <option value="admin_main">Admin Utama</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Username atau Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="emailOrUsername"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    placeholder="Masukkan username atau email"
                    required
                    maxLength={FORM_LIMITS.email}
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all text-sm placeholder:text-surface-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••"
                    required
                    maxLength={FORM_LIMITS.password}
                    className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all tracking-widest text-sm placeholder:tracking-normal placeholder:text-surface-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 -ml-0.5" />
                  Masuk
                </>
              )}
            </button>
          </form>
          
          <div className="pt-6 text-center lg:hidden">
            <p className="text-xs text-surface-400">
              &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
