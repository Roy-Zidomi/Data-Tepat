import { useState } from 'react';
import { Shield, X, KeyRound } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ChangePasswordModal from './ChangePasswordModal';

/**
 * PasswordChangeReminder - Persistent banner shown when user.must_change_password === true.
 * Dismissible for the current session only — reappears on next login.
 */
const PasswordChangeReminder = () => {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('bt_password_reminder_dismissed') === 'true';
  });
  const [showModal, setShowModal] = useState(false);

  // Don't render if flag is not set or user dismissed for this session
  if (!user?.must_change_password || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('bt_password_reminder_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <>
      <div
        className="animate-fade-in mx-0 mb-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 shadow-sm"
        role="alert"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          {/* Icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Keamanan Akun
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Disarankan ganti password demi keamanan akun Anda. Password sementara sebaiknya segera diganti.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 transition-colors shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ganti Sekarang
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              title="Nanti saja"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default PasswordChangeReminder;
