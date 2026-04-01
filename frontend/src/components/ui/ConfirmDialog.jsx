import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

/**
 * Confirm dialog for delete/destructive actions.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin ingin melanjutkan?',
  confirmText = 'Ya, Lanjutkan',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 items-start">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400 pt-2">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
