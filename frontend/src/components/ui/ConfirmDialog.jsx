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
      <div className="flex gap-3.5 items-start">
        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-surface-600 dark:text-surface-400 pt-1.5">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
