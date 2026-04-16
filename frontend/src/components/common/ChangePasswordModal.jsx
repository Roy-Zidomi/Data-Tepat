import { useState } from 'react';
import { KeyRound, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FORM_LIMITS, clampText } from '../../utils/formLimits';

/**
 * ChangePasswordModal - Standalone modal for changing password.
 * Fields: Password Lama, Password Baru, Konfirmasi Password Baru.
 */
const ChangePasswordModal = ({ onClose }) => {
  const clearMustChangePassword = useAuthStore((s) => s.clearMustChangePassword);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.currentPassword) e.currentPassword = 'Password lama wajib diisi';
    if (!formData.newPassword) e.newPassword = 'Password baru wajib diisi';
    else if (formData.newPassword.length < 6) e.newPassword = 'Password minimal 6 karakter';
    if (!formData.confirmPassword) e.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (formData.newPassword !== formData.confirmPassword) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: clampText(e.target.value, FORM_LIMITS.password) }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      clearMustChangePassword();
      // Clear session dismiss flag since password is now changed
      sessionStorage.removeItem('bt_password_reminder_dismissed');
      toast.success('Password berhasil diubah!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200'
        : 'border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 focus:ring-2 focus:ring-primary-200 focus:border-primary-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Ganti Password</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange('currentPassword')}
                className={inputClass('currentPassword')}
                placeholder="Masukkan password lama"
                maxLength={FORM_LIMITS.password}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                className={inputClass('newPassword')}
                placeholder="Minimal 6 karakter"
                maxLength={FORM_LIMITS.password}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className={inputClass('confirmPassword')}
                placeholder="Ulangi password baru"
                maxLength={FORM_LIMITS.password}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Simpan Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
