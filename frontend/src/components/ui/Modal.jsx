import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal dialog component with ARIA accessibility.
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className={`relative w-full ${sizeMap[size]} bg-white dark:bg-surface-800 rounded-2xl shadow-xl animate-slide-up overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
          <h2 id="modal-title" className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 dark:border-surface-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
