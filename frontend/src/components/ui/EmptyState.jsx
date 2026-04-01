import { FileX } from 'lucide-react';

/**
 * EmptyState - displayed when a list/table has no data.
 */
const EmptyState = ({ icon: Icon = FileX, title = 'Tidak ada data', description = '', children }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-surface-400" />
      </div>
      <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
