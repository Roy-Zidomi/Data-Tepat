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
        className="animate-fade-in mx-0 mb-4 rounded-lg border border-amber-200/80 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-500/5"
        role="alert"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Keamanan Akun
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              Disarankan ganti password demi keamanan akun Anda.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              Ganti Sekarang
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              title="Nanti saja"
            >
              <X className="w-3.5 h-3.5" />
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
