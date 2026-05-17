import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, HeartHandshake } from 'lucide-react';
import authService from '../../services/authService';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';

/**
 * ForgotPassword - Public page where users enter their email to receive a password reset link.
 * Uses the same split layout as the Login page — left panel identical, only right form changes.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email wajib diisi');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await authService.forgotPassword(email);
      const responseData = response.data?.data;
      setResetInfo(responseData?.resetUrl ? responseData : null);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-surface-950 font-sans">
      {/* Left Pane - Branding & Info (IDENTICAL to Login) */}
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

      {/* Right Pane - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-10 sm:p-12 relative overflow-y-auto bg-white dark:bg-surface-950">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-5 lg:hidden flex items-center gap-2 text-surface-900 dark:text-white">
          <HeartHandshake className="w-5 h-5 text-primary-600" />
          <span className="text-lg font-bold">BantuTepat</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in my-auto pt-12 lg:pt-0">
          {!sent ? (
            <>
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
                  Lupa Password
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mt-1.5 text-sm">
                  Masukkan email Anda untuk menerima link reset password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(clampText(e.target.value, FORM_LIMITS.email)); setError(''); }}
                      placeholder="nama@email.com"
                      required
                      maxLength={FORM_LIMITS.email}
                      className={`w-full bg-surface-50 dark:bg-surface-800 border text-surface-900 dark:text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-all text-sm placeholder:text-surface-400 ${
                        error ? 'border-red-400 dark:border-red-500' : 'border-surface-200 dark:border-surface-700'
                      }`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
                      <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Link Reset
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                Email Terkirim!
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-1.5">
                Link reset password telah dikirim ke <strong className="text-surface-800 dark:text-white">{email}</strong>
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 mb-6">
                Link berlaku selama 15 menit. Periksa juga folder spam Anda.
              </p>

              {resetInfo?.resetUrl && (
                <div className="bg-sky-50 dark:bg-sky-500/5 border border-sky-200/80 dark:border-sky-800/40 rounded-lg p-3.5 mb-6 text-left">
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1.5">
                    Mode development
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-2">
                    Email belum dikonfigurasi, jadi link reset ditampilkan di sini untuk testing lokal.
                  </p>
                  <a
                    href={resetInfo.resetUrl}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline break-all"
                  >
                    Buka link reset password →
                  </a>
                </div>
              )}

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Login
              </Link>
            </div>
          )}

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

export default ForgotPassword;
