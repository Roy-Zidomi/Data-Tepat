import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, HeartHandshake, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';

/**
 * ResetPassword - Public page for resetting password via token from email.
 * Uses the same split layout as the Login page — left panel identical, only right form changes.
 * URL: /reset-password?token=xxx
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------- Left panel (shared with Login & ForgotPassword) ---------- */
  const LeftPanel = () => (
    <div className="hidden lg:flex w-1/2 relative bg-surface-900 dark:bg-surface-900 overflow-hidden flex-col justify-between p-12">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-600/15 blur-3xl"></div>
        <div className="absolute bottom-[10%] -right-[15%] w-[50%] h-[50%] rounded-full bg-primary-400/10 blur-3xl"></div>
      </div>
      <div className="relative z-10 flex items-center gap-3 text-white">
        <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl">
          <HeartHandshake className="w-7 h-7 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">BantuTepat</span>
      </div>
      <div className="relative z-10 max-w-lg">
        <h1 className="text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-5 tracking-tight">
          Distribusi Bantuan<br />Tepat Sasaran &amp; Transparan.
        </h1>
        <p className="text-base text-surface-300 leading-relaxed mb-8">
          Platform terpadu untuk memfasilitasi pendataan, verifikasi, dan penyaluran bantuan sosial bagi masyarakat yang membutuhkan secara akurat dan terpercaya.
        </p>

      </div>
      <div className="relative z-10 text-xs text-surface-500">
        <p>&copy; {new Date().getFullYear()} BantuTepat &mdash; Hak Cipta Dilindungi</p>
      </div>
    </div>
  );

  /* ---------- Invalid token state ---------- */
  if (!token) {
    return (
      <div className="flex min-h-screen w-full bg-white dark:bg-surface-950 font-sans">
        <LeftPanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-10 sm:p-12 relative bg-white dark:bg-surface-950">
          <div className="absolute top-6 left-5 lg:hidden flex items-center gap-2 text-surface-900 dark:text-white">
            <HeartHandshake className="w-5 h-5 text-primary-600" />
            <span className="text-lg font-bold">BantuTepat</span>
          </div>
          <div className="w-full max-w-sm text-center animate-fade-in">
            <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Link Tidak Valid</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
              Token reset password tidak ditemukan. Pastikan Anda menggunakan link yang benar dari email.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Minta Link Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!formData.newPassword) e.newPassword = 'Password baru wajib diisi';
    else if (formData.newPassword.length < 6) e.newPassword = 'Password minimal 6 karakter';
    if (!formData.confirmPassword) e.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authService.resetPassword(token, formData.newPassword);
      toast.success('Password berhasil direset!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password. Token mungkin sudah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-surface-50 dark:bg-surface-800 border text-surface-900 dark:text-white rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all text-sm placeholder:text-surface-400 ${
      errors[field] ? 'border-red-400 dark:border-red-500' : 'border-surface-200 dark:border-surface-700'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-surface-950 font-sans">
      <LeftPanel />

      {/* Right Pane - Reset Password Form */}
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
              Reset Password
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-1.5 text-sm">
              Buat password baru untuk akun Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => { setFormData(p => ({ ...p, newPassword: clampText(e.target.value, FORM_LIMITS.password) })); setErrors(p => ({ ...p, newPassword: null })); }}
                  placeholder="Minimal 6 karakter"
                  required
                  maxLength={FORM_LIMITS.password}
                  className={inputClass('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData(p => ({ ...p, confirmPassword: clampText(e.target.value, FORM_LIMITS.password) })); setErrors(p => ({ ...p, confirmPassword: null })); }}
                  placeholder="Ulangi password baru"
                  required
                  maxLength={FORM_LIMITS.password}
                  className={inputClass('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all mt-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Login
            </Link>
          </div>

          <div className="pt-2 text-center lg:hidden">
            <p className="text-xs text-surface-400">
              &copy; {new Date().getFullYear()} BantuTepat. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
