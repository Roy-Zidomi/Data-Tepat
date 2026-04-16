import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';
import { 
  Building2, 
  ChevronDown, 
  Lock, 
  Mail, 
  ShieldCheck,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';

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
    <div className="min-h-screen bg-surface-50 flex items-stretch">
      {/* Left Panel - Branding & Identity (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary-700 relative overflow-hidden flex-col justify-between p-12">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/30 blur-[80px]" />
          <div className="absolute bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary-400/20 blur-[100px]" />
          <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary-300/10 blur-[60px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Bantu Tepat</span>
          </div>

          <div className="max-w-md mt-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Sistem Penyaluran Bantuan Sosial
            </h1>
            <p className="text-primary-100 text-lg leading-relaxed mb-10">
              Platform layanan publik digital yang modern dan aman. 
              Solusi tepat untuk bantuan yang lebih cepat, transparan, dan terarah.
            </p>
            
            {/* Feature Highlights */}
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-primary-200" />
                </div>
                <span className="font-medium">Data aman dan terverifikasi</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Activity className="w-5 h-5 text-primary-200" />
                </div>
                <span className="font-medium">Distribusi tepat sasaran</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-200/80 text-sm mt-auto">
          &copy; {new Date().getFullYear()} Pemerintah Daerah & BantuTepat.<br />
          Hak Cipta Dilindungi Undang-Undang.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-surface-50">
        
        {/* Mobile Logo Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-surface-900 tracking-tight">Bantu Tepat</span>
        </div>

        <div className="w-full max-w-[440px] mt-12 lg:mt-0">
          <div className="mb-10 lg:mb-12 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-2">
              Selamat Datang
            </h2>
            <p className="text-surface-500 text-base">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Username / Email */}
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-surface-700">
                Username / Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="emailOrUsername"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  placeholder="Masukkan username atau email"
                  required
                  maxLength={FORM_LIMITS.email}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-surface-200 text-surface-900 text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-surface-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                  maxLength={FORM_LIMITS.password}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-surface-200 text-surface-900 text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Role / Login As */}
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-surface-700">
                Masuk Sebagai (Peran)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-white border border-surface-200 text-surface-900 text-sm rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="warga">Warga</option>
                  <option value="relawan">Relawan</option>
                  <option value="pengawas">Pengawas</option>
                  <option value="admin_staff">Admin Staff</option>
                  <option value="admin_main">Admin Utama</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-surface-500">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Form Links */}
            <div className="flex items-center justify-between pt-1">
              <Link to="/activation" className="text-[13px] font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Aktivasi Akun (OTP)
              </Link>
              <Link to="/forgot-password" className="text-[13px] font-semibold text-surface-500 hover:text-surface-700 transition-colors">
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white text-[15px] font-bold tracking-wide transition-all duration-300 shadow-[0_8px_20px_rgb(79,70,229,0.25)] 
                  ${loading 
                    ? 'bg-primary-400 cursor-not-allowed transform-none shadow-none' 
                    : 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgb(79,70,229,0.35)] active:translate-y-0 active:shadow-md'
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
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Simple footer for mobile */}
          <div className="mt-12 text-center lg:hidden">
            <p className="text-xs text-surface-400">
              &copy; {new Date().getFullYear()} BantuTepat. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

