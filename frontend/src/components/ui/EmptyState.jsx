import { FileX } from 'lucide-react';

/**
 * EmptyState - displayed when a list/table has no data.
 */
const EmptyState = ({ icon: Icon = FileX, title = 'Tidak ada data', description = '', children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-surface-300 dark:text-surface-500" />
      </div>
      <h3 className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-surface-400 dark:text-surface-500 max-w-xs">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
